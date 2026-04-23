import { motion } from 'framer-motion';

type TestimonialCardProps = {
  quote: string;
  guest: string;
  role: string;
};

export function TestimonialCard({ quote, guest, role }: TestimonialCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="min-w-[300px] border border-gray-200 bg-white p-8 transition-shadow duration-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
    >
      <p className="text-base leading-relaxed text-gray-700">{quote}</p>
      <div className="mt-8">
        <p className="font-serif text-xl text-neutral-950">{guest}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-500">{role}</p>
      </div>
    </motion.article>
  );
}
