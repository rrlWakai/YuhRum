import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type SectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, className = '', children }: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative
        w-full
        max-w-full
        overflow-x-hidden
        scroll-mt-16
        px-6
        py-16
        sm:py-20
        md:px-10
        md:py-28
        md:scroll-mt-20
        lg:py-32
        ${className}
      `}
    >
      {/* Inner wrapper prevents content from breaking layout */}
      <div className="w-full max-w-[1440px] mx-auto">
        {children}
      </div>
    </motion.section>
  );
}