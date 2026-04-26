import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import yuhrumLogo from '../assets/yuhrumlogo.png';
import { villas } from '../data/villas';

type Message = {
  role: 'user' | 'model' | 'system';
  text: string;
};

// Initialize the SDK only if the key exists
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
let chatSession: any = null;

if (apiKey && apiKey !== 'your_api_key_here') {
  try {
    ai = new GoogleGenAI({ apiKey });
    
    // Prepare context about the villas
    const villaContext = villas.map(v => `
      Name: ${v.name}
      Location: ${v.location}
      Capacity: ${v.capacity.min}-${v.capacity.max} pax
      Day Stay (Weekday: ${v.rates.dayStay.weekday}, Weekend: ${v.rates.dayStay.weekend})
      Night Stay (Weekday: ${v.rates.nightStay.weekday}, Weekend: ${v.rates.nightStay.weekend})
      Overnight (Weekday: ${v.rates.overnight.weekday}, Weekend: ${v.rates.overnight.weekend})
      Amenities: ${v.amenities.outdoor.join(', ')}
    `).join('\n\n');

    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are the exclusive concierge and virtual assistant for Yuhrum Villas. 
        Adopt a sophisticated, polite, and premium tone. Provide well-structured, easy-to-read answers. 
        Do not use markdown formatting like asterisks (**). Use spacing and new lines for a clean layout.
        Here is the villa information:\n${villaContext}`,
        temperature: 0.7,
      }
    });
  } catch (error) {
    console.error("Failed to initialize Google Gen AI:", error);
  }
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Welcome to Yuhrum Villas. How may I assist you with your reservation today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    if (!chatSession) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'system', 
          text: 'Error: Gemini API Key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.' 
        }]);
      }, 500);
      return;
    }

    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'system', text: 'I apologize, but I am currently unavailable to respond. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center border border-gray-200 bg-white shadow-lg transition-opacity duration-300 ${
          isOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <img src={yuhrumLogo} alt="Chat with us" className="h-8 w-auto object-contain opacity-80" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 flex h-[550px] max-h-[80vh] w-[380px] max-w-[calc(100vw-48px)] flex-col border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0A192F] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center bg-white p-1">
                  <img src={yuhrumLogo} alt="Yuhrum Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white leading-none">Yuhrum Assistant</h3>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-[#D1DEEA]">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex size-8 items-center justify-center text-[#D1DEEA] hover:text-white transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-[#F7F6F4] p-5 scrollbar-hide">
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex max-w-[85%] items-end gap-2">
                      {msg.role === 'model' && (
                        <div className="flex size-7 shrink-0 items-center justify-center border border-gray-200 bg-white p-1 mb-1">
                          <img src={yuhrumLogo} alt="AI" className="h-full w-full object-contain opacity-80" />
                        </div>
                      )}
                      
                      <div
                        className={`whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#0A192F] text-white'
                            : msg.role === 'system'
                            ? 'bg-red-50 border border-red-100 text-red-600 italic text-xs'
                            : 'border border-gray-200 bg-white text-gray-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 bg-white">
                      <Loader2 className="size-4 animate-spin text-gray-400" />
                      <span className="text-xs uppercase tracking-widest text-gray-400">Typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="border-t border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our villas..."
                  className="flex-1 border border-gray-200 bg-[#F7F6F4] px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex size-11 shrink-0 items-center justify-center bg-[#0A192F] text-white disabled:opacity-50 transition-opacity"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
