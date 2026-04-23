import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Maximize2, Users, Waves } from 'lucide-react';
import { Reveal } from './Reveal';

type Room = {
  name: string;
  category: string;
  description: string;
  features: string;
  price: string;
  ctaLabel: string;
  image: string;
};

type RoomCarouselProps = {
  rooms: Room[];
};

function parseFeatures(features: string) {
  const [guests, bed, view, size] = features.split('·').map((item) => item.trim());
  return [
    { icon: Users, label: guests ?? '' },
    { icon: BedDouble, label: bed ?? '' },
    { icon: Waves, label: view ?? '' },
    { icon: Maximize2, label: size ?? '' },
  ];
}

export function RoomCarousel({ rooms }: RoomCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const roomFeatures = useMemo(() => rooms.map((room) => parseFeatures(room.features)), [rooms]);

  const onScroll = () => {
    const node = scrollRef.current;
    if (!node) return;
    const itemWidth = node.clientWidth * 0.82;
    const next = Math.round(node.scrollLeft / itemWidth);
    setActiveIndex(Math.max(0, Math.min(rooms.length - 1, next)));
  };

  return (
    <div className="overflow-visible">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-[8vw] pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {rooms.map((room, index) => (
          <motion.article
            key={room.name}
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            animate={{ scale: activeIndex === index ? 1.03 : 0.96 }}
            className="group relative min-w-[82%] snap-center overflow-hidden border border-gray-200 bg-white md:min-w-[58%] xl:min-w-[42%]"
          >
            <div className="relative h-[540px] overflow-hidden">
              <motion.img
                src={room.image}
                alt={room.name}
                className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <Reveal delay={0.05}>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/80">{room.category}</p>
                </Reveal>
                <Reveal delay={0.12}>
                  <h3 className="mt-3 font-serif text-4xl">{room.name}</h3>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85">{room.description}</p>
                </Reveal>
                <Reveal delay={0.28}>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/90">
                    {roomFeatures[index].map((feature) => (
                      <div key={`${room.name}-${feature.label}`} className="flex items-center gap-2">
                        <feature.icon className="size-4" />
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={0.36}>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-white/90">{room.price}</p>
                    <button className="border border-white px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white hover:text-neutral-900">
                      {room.ctaLabel}
                    </button>
                  </div>
                </Reveal>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
