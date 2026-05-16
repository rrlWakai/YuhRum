import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { villas } from '../data/villas';
import type { PageView } from '../App';

type Props = {
  villaId: string;
  onNavigate: (p: PageView) => void;
};

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export function GalleryPage({ villaId, onNavigate }: Props) {
  const villa = villas.find((v) => v.id === villaId) ?? villas[0];
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(villaId);

  const allImages = villas.find((v) => v.id === activeTab)?.galleryImages ?? villa.galleryImages;

  return (
    <div className="min-h-screen bg-petal text-plum font-body">
      <div className="mx-auto max-w-7xl px-6 pt-28 pb-24 md:px-12 lg:px-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease }}
          className="mb-16"
        >
          <button
            onClick={() => onNavigate({ type: 'detail', villaId })}
            className="mb-8 font-body text-[9px] uppercase tracking-[0.35em] text-shadow/50 hover:text-plum transition-colors"
          >
            ← Back to {villa.name}
          </button>
          <p className="font-body text-[9px] uppercase tracking-[0.4em] text-shadow/50 mb-4">Photo Gallery</p>
          <h1 className="font-display text-5xl italic text-plum md:text-6xl lg:text-7xl">{villa.name}</h1>
          <p className="mt-4 font-body text-sm text-shadow/60 max-w-md">Explore every space of your private villa.</p>
        </motion.div>

        {/* Villa Tabs */}
        <div className="mb-12 flex flex-wrap gap-3">
          {villas.map((v) => (
            <button key={v.id} onClick={() => setActiveTab(v.id)}
              className={`border px-6 py-2.5 font-body text-[9px] uppercase tracking-[0.22em] transition-all ${
                activeTab === v.id
                  ? 'border-plum bg-plum text-petal'
                  : 'border-blush/25 text-shadow hover:border-plum/40 hover:text-plum'
              }`}>
              {v.name}
            </button>
          ))}
        </div>

        {/* Masonry */}
        <div className="masonry-gallery">
          {allImages.map((img, index) => (
            <motion.figure
              key={img}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: index * 0.04, ease }}
              onClick={() => setLightbox(img)}
              className="masonry-item group relative cursor-pointer overflow-hidden border border-blush/10"
            >
              <img
                src={img}
                alt={`${villa.name} photo ${index + 1}`}
                loading="lazy"
                className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-plum/0 group-hover:bg-plum/15 transition-colors duration-400 flex items-end">
                <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-400 w-full px-4 py-3 bg-gradient-to-t from-plum/60 to-transparent">
                  <p className="font-display text-base italic text-petal">{villa.name}</p>
                </div>
              </div>
            </motion.figure>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button onClick={() => onNavigate({ type: 'detail', villaId: activeTab })}
            className="plum-link w-full sm:w-auto justify-center border border-plum/20 px-8 py-3.5">
            View Villa Details
          </button>
          <button onClick={() => onNavigate({ type: 'detail', villaId: activeTab })}
            className="font-body text-[10px] uppercase tracking-[0.25em] text-petal bg-plum px-8 py-3.5 hover:bg-shadow transition-all w-full sm:w-auto text-center">
            Reserve This Villa
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-plum/95 p-4 md:p-10 backdrop-blur-md"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute right-6 top-6 flex size-10 items-center justify-center border border-petal/20 text-petal hover:bg-petal/10 transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X className="size-4" strokeWidth={1} />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease }}
              src={lightbox}
              alt="Gallery lightbox"
              className="max-h-[90vh] max-w-[95vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
