import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type AmenityCardProps = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export function AmenityCard({ icon: Icon, title, text }: AmenityCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group border border-gray-300 bg-white p-7 transition-shadow duration-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
    >
      <div className="mb-6 inline-flex border border-gray-300 bg-gray-50 p-3">
        <Icon className="size-5 text-neutral-800" />
      </div>
      <h3 className="font-serif text-2xl text-neutral-950">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">{text}</p>
    </motion.article>
  );
}
