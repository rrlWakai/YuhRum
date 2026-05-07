import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import yuhrumLogo from '../assets/yuhrumlogo-clean.png';

interface LoaderProps {
  onComplete: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';

    // Simulate progress
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds total loading time

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            document.body.style.overflow = '';
            onComplete();
          }, 800); // 800ms for the fade-out animation
        }, 400); // small delay after hitting 100%
      }
    }, 16); // ~60fps

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F5F5F5] backdrop-blur-md"
        >
          {/* Ambient Background Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.08, 0.15, 0.08],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-tr from-[#D4AF37]/30 to-transparent rounded-full blur-[120px]"
            />
          </div>

          <div className="relative flex flex-col items-center z-10 w-full px-6">
            {/* Logo container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative flex justify-center"
            >
              <motion.img
                src={yuhrumLogo}
                alt="YUHRUM Logo"
                className="w-48 md:w-72 h-auto object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                animate={{
                  y: [-6, 6, -6],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Glowing Progress Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 flex flex-col items-center w-full max-w-[200px] md:max-w-[280px]"
            >
              <div className="w-full h-[1px] bg-black/10 rounded-full overflow-hidden relative backdrop-blur-sm">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-[#F3E5AB] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <motion.div 
                className="mt-6 text-[#D4AF37] text-[10px] md:text-xs tracking-[0.3em] font-medium uppercase tabular-nums"
              >
                {Math.round(progress)}%
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
