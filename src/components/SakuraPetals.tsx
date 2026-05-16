import { useRef } from 'react';
import { motion } from 'framer-motion';

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

type Petal = {
  id: number;
  x: number;
  xOffset: number;
  delay: number;
  duration: number;
  opacity: number;
  scale: number;
  rotate: number;
  width: number;
  height: number;
};

function generatePetals(count: number): Petal[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(0, 100), // vw percentage
    xOffset: randomBetween(-80, 80),
    delay: randomBetween(0, 14),
    duration: randomBetween(10, 18),
    opacity: randomBetween(0.12, 0.38),
    scale: randomBetween(0.6, 1.4),
    rotate: randomBetween(0, 360),
    width: randomBetween(8, 18),
    height: randomBetween(12, 24),
  }));
}

type Props = {
  count?: number;
};

export function SakuraPetals({ count = 15 }: Props) {
  const petals = useRef<Petal[]>(generatePetals(count));

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
      aria-hidden="true"
    >
      {petals.current.map((petal) => (
        <motion.div
          key={petal.id}
          style={{
            position: 'absolute',
            left: `${petal.x}vw`,
            top: 0,
            opacity: petal.opacity,
            scale: petal.scale,
          }}
          animate={{
            y: ['-8vh', '108vh'],
            x: [0, petal.xOffset],
            rotate: [petal.rotate, petal.rotate + 360],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg
            width={petal.width}
            height={petal.height}
            viewBox="0 0 16 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="8"
              cy="12"
              rx="6"
              ry="10"
              fill="#E8B4C0"
              transform={`rotate(${randomBetween(-20, 20)} 8 12)`}
            />
            <ellipse
              cx="8"
              cy="12"
              rx="3"
              ry="7"
              fill="#F5EEF0"
              opacity="0.3"
              transform={`rotate(${randomBetween(-10, 10)} 8 12)`}
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
