import type { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

type ParallaxSectionProps = {
  id?: string;
  image: string;
  imageAlt: string;
  children: ReactNode;
  className?: string;
  bgSpeed?: [number, number];
  fgSpeed?: [number, number];
};

export function ParallaxSection({
  id,
  image,
  imageAlt,
  children,
  className = '',
  bgSpeed = [80, -60],
  fgSpeed = [40, -20],
}: ParallaxSectionProps) {
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], bgSpeed);
  const fgY = useTransform(scrollYProgress, [0, 1], fgSpeed);

  return (
    <section id={id} className={`relative w-full overflow-visible py-28 md:py-36 ${className}`}>
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
      </motion.div>
      <motion.div style={{ y: fgY }} className="relative z-10">
        {children}
      </motion.div>
    </section>
  );
}
