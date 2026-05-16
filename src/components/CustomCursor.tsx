import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isLarge, setIsLarge] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e: MouseEvent) => {
      setIsVisible(true);
      cursor.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;
    };

    const onEnterHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, img, [data-cursor-large]')) {
        setIsLarge(true);
      }
    };

    const onLeaveHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, img, [data-cursor-large]')) {
        setIsLarge(false);
      }
    };

    const onLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onEnterHover);
    window.addEventListener('mouseout', onLeaveHover);
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onEnterHover);
      window.removeEventListener('mouseout', onLeaveHover);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      aria-hidden="true"
    >
      <motion.div
        animate={{
          width: isLarge ? 48 : 24,
          height: isLarge ? 48 : 24,
          opacity: isVisible ? 1 : 0,
          marginLeft: isLarge ? -12 : 0,
          marginTop: isLarge ? -12 : 0,
        }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-full border border-blush/60"
        style={{ mixBlendMode: 'difference' }}
      />
    </div>
  );
}
