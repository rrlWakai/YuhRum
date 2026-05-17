import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SendHorizontal, Loader2 } from 'lucide-react';
import { useAvailability } from '../lib/hooks';
import { getConciergeModel } from '../services/chat';

// Types
export type ChatRole = 'user' | 'model' | 'system';

export type ChatMessage = {
  role: ChatRole;
  text: string;
  timestamp: Date;
};

// Lotus Icon Component
function LotusIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M32 8C32 8 20 24 20 38C20 48 26 56 32 56C38 56 44 48 44 38C44 24 32 8 32 8Z" />
      <path d="M32 20C32 20 26 30 26 38" />
      <path d="M32 30C32 30 38 36 38 40" />
    </svg>
  );
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { blockedDates } = useAvailability();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Auto-resize input textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Reset or focus input when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Suggested prompt handler
  const handleSuggestionClick = (suggestion: string) => {
    handleSend(undefined, suggestion);
  };

  // Main send message handler
  async function handleSend(e?: React.FormEvent, directMessage?: string) {
    e?.preventDefault();
    const textToSend = (directMessage || input).trim();
    if (!textToSend || isLoading) return;

    if (!directMessage) {
      setInput('');
    }

    // Add user message
    const userMsg: ChatMessage = {
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key missing');
      }

      // Format blocked dates for the assistant context
      const formattedBlockedDates = Array.from(blockedDates.entries()).map(
        ([date, types]) => `${date} (${Array.from(types).join(', ')})`
      ).join(', ') || 'None';

      const model = getConciergeModel(formattedBlockedDates);

      // Build chat history excluding system roles
      const chatHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const chat = model.startChat({
        history: chatHistory,
      });

      const result = await chat.sendMessage(textToSend);
      const replyText = result.response.text();

      setMessages(prev => [...prev, {
        role: 'model',
        text: replyText || 'I apologize, but my thoughts are currently quiet. Please ask again.',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        text: 'I apologize, but my connection is currently resting. Please try again later or reach out to us directly.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  // Key press handler for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to format timestamps gracefully
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Parse custom bold markers ** in AI response beautifully
  const formatMessageText = (text: string) => {
    return text.split('\n\n').map((paragraph, pIdx) => {
      const parts = paragraph.split('**');
      return (
        <p key={pIdx} className="mb-2.5 last:mb-0 text-stone-700 leading-relaxed font-light">
          {parts.map((part, partIdx) => {
            if (partIdx % 2 === 1) {
              return <strong key={partIdx} className="font-semibold text-stone-900">{part}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Suggested prompts
  const suggestions = [
    'What makes Yuhrum special?',
    'Tell me about villa availability',
    'What experiences do you offer?'
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ delay: 2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-end"
          >
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-18 bg-[#2C2A25] text-[#FAF8F4] px-4 py-2 text-xs tracking-wider uppercase rounded-md shadow-md whitespace-nowrap font-body select-none mr-2 pointer-events-none"
                >
                  Chat with our concierge
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setIsOpen(true)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex w-14 h-14 items-center justify-center rounded-full bg-[#2C2A25] text-[#FAF8F4] shadow-lg border border-[#FAF8F4]/10 transition-colors focus:outline-none"
              aria-label="Open Chatbot"
            >
              <LotusIcon className="w-6 h-6 animate-pulse duration-[3000ms]" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-0 right-0 w-full h-full md:bottom-6 md:right-6 md:w-[380px] md:h-[560px] md:max-h-[85vh] z-50 flex flex-col md:rounded-2xl border border-[rgba(180,170,155,0.3)] bg-[#FAF8F4] shadow-2xl overflow-hidden font-body"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E6E1DA]/60 px-5 py-4 bg-[#FAF8F4]">
              <div>
                <h3 className="font-display text-xl text-[#2C2A25] leading-none">
                  Yuhrum Concierge
                </h3>
                <p className="mt-1.5 text-[10px] tracking-widest uppercase text-stone-400">
                  How may we serve you?
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex w-8 h-8 items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:text-[#2C2A25] hover:border-stone-400 transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto bg-[#FAF8F4] px-5 py-6 space-y-5 scrollbar-hide">
              {messages.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full py-6 select-none">
                  <div className="w-14 h-14 rounded-full bg-[#A89880]/10 text-[#A89880]/60 flex items-center justify-center mb-4 border border-[#A89880]/15">
                    <LotusIcon className="w-8 h-8" />
                  </div>
                  <p className="font-display italic text-lg text-[#2C2A25]/70 text-center mb-6 px-4">
                    "Still waters run deep. Ask us anything."
                  </p>
                  
                  <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-[12px] text-[#2C2A25] border border-stone-300 hover:bg-[#2C2A25]/5 px-4 py-2.5 transition-all text-center rounded-full font-body font-medium"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages rendering */
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'user' ? (
                        /* User Message Bubble */
                        <div className="flex flex-col items-end max-w-[80%]">
                          <div className="bg-[#2C2A25] text-[#FAF8F4] px-4.5 py-3 rounded-2xl rounded-tr-sm shadow-sm text-[13.5px] leading-relaxed">
                            {msg.text}
                          </div>
                          <span className="text-[9px] tracking-wider text-stone-400 mt-1 uppercase">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      ) : msg.role === 'system' ? (
                        /* System Error Message */
                        <div className="w-full flex justify-center">
                          <div className="border border-red-100 bg-red-50/50 text-red-600 px-4 py-3 rounded-xl text-xs text-center max-w-[90%] italic leading-normal">
                            {msg.text}
                          </div>
                        </div>
                      ) : (
                        /* AI Assistant Message */
                        <div className="flex items-start gap-3.5 max-w-[90%] select-text">
                          <div className="w-8 h-8 rounded-full bg-[#A89880]/15 text-[#A89880] flex items-center justify-center shrink-0 border border-[#A89880]/20 select-none">
                            <LotusIcon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex flex-col">
                            <div className="text-[13.5px] pr-2 pt-0.5">
                              {formatMessageText(msg.text)}
                            </div>
                            <span className="text-[9px] tracking-wider text-stone-400 mt-1.5 uppercase select-none">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3.5"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#A89880]/15 text-[#A89880] flex items-center justify-center shrink-0 border border-[#A89880]/20">
                        <LotusIcon className="w-4.5 h-4.5 animate-spin duration-[4000ms]" />
                      </div>
                      <div className="flex gap-1 px-3.5 py-2.5 bg-stone-200/40 rounded-xl w-fit items-center mt-0.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-stone-500"
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.15
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Form Area */}
            <form onSubmit={handleSend} className="border-t border-[#E6E1DA]/60 bg-[#FAF8F4] px-4 py-3">
              <div className="flex items-end gap-2 bg-stone-100 rounded-xl border border-stone-200 px-3 py-1.5 focus-within:border-stone-400 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about our villas, availability, or anything else…"
                  className="flex-1 bg-transparent border-0 outline-none text-[13.5px] text-[#2C2A25] placeholder-stone-400 resize-none max-h-[120px] py-1 font-body leading-relaxed scrollbar-hide focus:ring-0 focus:outline-none"
                  rows={1}
                />
                
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex w-9.5 h-9.5 items-center justify-center rounded-lg bg-transparent text-[#2C2A25]/40 hover:text-[#2C2A25] hover:bg-stone-200/50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#2C2A25]/40 transition-all focus:outline-none shrink-0"
                  aria-label="Send Message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
                  ) : (
                    <SendHorizontal className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
