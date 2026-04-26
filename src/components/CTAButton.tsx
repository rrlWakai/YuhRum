import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type CTAButtonProps = {
  children: ReactNode;
  href?: string;
  large?: boolean;
  className?: string;
  onClick?: () => void;
};

export function CTAButton({ children, href = '#final-cta', large = false, className = '', onClick }: CTAButtonProps) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.65 }}
      transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.1 }}
      whileHover={{
        scale: 1.03,
      }}
      whileTap={{ scale: 0.98 }}
      className={`flex w-fit items-center justify-center border border-gray-200 btn-navy text-sm font-medium uppercase tracking-[0.15em] text-white ${
        large ? 'px-11 py-4 text-base' : 'px-8 py-3'
      } ${className}`}
    >
      {children}
    </motion.a>
  );
}
