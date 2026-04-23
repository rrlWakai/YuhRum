import { motion } from 'framer-motion';

type AnimatedTextProps = {
  title: string;
  description?: string;
  align?: 'left' | 'center';
  light?: boolean;
};

export function AnimatedText({ title, description, align = 'left', light = false }: AnimatedTextProps) {
  return (
    <motion.div
      className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 22 },
          show: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeInOut' }}
        className={`font-serif text-4xl leading-tight md:text-5xl ${light ? 'text-neutral-950' : 'text-neutral-950'}`}
      >
        {title}
      </motion.h2>
      {description ? (
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, delay: 0.18, ease: 'easeInOut' }}
          className={`mt-6 text-base leading-relaxed md:text-lg ${light ? 'text-gray-600' : 'text-gray-600'}`}
        >
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
