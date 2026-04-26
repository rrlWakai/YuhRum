import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { villas } from '../data/villas';
import type { PageView } from '../App';

type Props = {
  villaId: string;
  onNavigate: (p: PageView) => void;
};

export function GalleryPage({ villaId, onNavigate }: Props) {
  const villa = villas.find((v) => v.id === villaId) ?? villas[0];
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(villaId);

  const allImages = villas.find((v) => v.id === activeTab)?.galleryImages ?? villa.galleryImages;

  const GRID_CLASSES = [
    'col-span-2 row-span-2',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-2',
    'col-span-1 row-span-1',
    'col-span-2 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-2 row-span-1',
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F4]">
      <div className="mx-auto max-w-[1240px] px-6 pt-32 pb-24 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <button
            onClick={() => onNavigate({ type: 'detail', villaId })}
            className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gray-500 hover:text-neutral-900 transition-colors"
          >
            ← Back to {villa.name}
          </button>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Photo Gallery</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-neutral-950 sm:text-5xl md:text-6xl">
            {villa.name} Gallery
          </h1>
          <p className="mt-4 text-gray-600">Explore every space of your private villa.</p>
        </motion.div>

        <div className="mb-10 flex flex-wrap gap-4">
          {villas.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveTab(v.id)}
              className={`border px-6 py-3 text-xs font-medium uppercase tracking-[0.1em] transition-all duration-200 ${
                activeTab === v.id
                  ? 'border-[#0A192F] bg-[#0A192F] text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-neutral-900 hover:text-neutral-900'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>

        <div className="grid auto-rows-[200px] grid-cols-3 gap-4 md:auto-rows-[260px] md:gap-5">
          {allImages.map((img, index) => (
            <motion.figure
              key={img}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setLightbox(img)}
              className={`group relative cursor-pointer overflow-hidden border border-gray-200 bg-white ${
                GRID_CLASSES[index % GRID_CLASSES.length]
              }`}
            >
              <img
                src={img}
                alt={`${villa.name} photo ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
            </motion.figure>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => onNavigate({ type: 'detail', villaId: activeTab })}
            className="flex w-full sm:w-auto items-center justify-center border border-gray-200 bg-white px-8 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-gray-800 transition-colors hover:bg-neutral-50"
          >
            View Villa Details
          </button>
          <button
            onClick={() => onNavigate({ type: 'detail', villaId: activeTab })}
            className="flex w-full sm:w-auto items-center justify-center btn-navy px-8 py-3.5 text-xs font-medium uppercase tracking-[0.15em]"
          >
            Reserve This Villa
          </button>
        </div>
      </div>

      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-6 top-6 flex size-12 items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20"
            onClick={() => setLightbox(null)}
          >
            <X className="size-5" />
          </button>
          <motion.img
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            src={lightbox}
            alt="Gallery lightbox"
            className="max-h-[90vh] max-w-[95vw] object-contain shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </div>
  );
}
