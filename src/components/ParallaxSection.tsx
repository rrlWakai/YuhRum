import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

type ParallaxSectionProps = {
  id?: string;
  image: string;
  imageAlt: string;
  children: ReactNode;
  className?: string;
};

export function ParallaxSection({
  id,
  image,
  imageAlt,
  children,
  className = '',
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Layer 1 — photo: drifts slowly upward + zooms out as section enters viewport
  const bgY = useTransform(scrollYProgress, [0, 1], [-90, 90]);
  const bgScale = useTransform(scrollYProgress, [0, 0.45], [1.25, 1.0]);

  // Layer 2 — gradient overlay: drifts at a faster rate creating depth separation
  const gradY = useTransform(scrollYProgress, [0, 1], [-35, 65]);
  const gradOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.35, 0.6, 0.6, 0.35]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative w-full py-16 sm:py-20 md:py-28 lg:py-36 ${className}`}
    >
      {/* Clipping wrapper keeps scaled/translated layers inside the section boundary */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Layer 1: background photo — slow drift + zoom out */}
        <motion.div
          style={{ y: bgY, scale: bgScale }}
          className="absolute inset-0 will-change-transform"
        >
          <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
        </motion.div>

        {/* Layer 2: atmospheric gradient — faster drift for parallax depth */}
        <motion.div
          style={{ y: gradY, opacity: gradOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/55 will-change-transform"
        />
      </div>

      <div className="relative z-10">{children}</div>
    </section>
  );
}
