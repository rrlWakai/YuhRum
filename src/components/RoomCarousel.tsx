import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, UtensilsCrossed, Users, Waves } from "lucide-react";
import { Reveal } from "./Reveal";

type Room = {
  name: string;
  category: string;
  features: string;
  price: string;
  ctaLabel: string;
  image: string;
};

type RoomCarouselProps = {
  rooms: Room[];
  onSelect?: (index: number) => void;
};

function parseFeatures(features: string) {
  const [guests, pool, kitchen, events] = features
    .split("·")
    .map((item) => item.trim());
  return [
    { icon: Users, label: guests ?? "" },
    { icon: Waves, label: pool ?? "" },
    { icon: UtensilsCrossed, label: kitchen ?? "" },
    { icon: Sparkles, label: events ?? "" },
  ];
}

export function RoomCarousel({ rooms, onSelect }: RoomCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const roomFeatures = useMemo(
    () => rooms.map((room) => parseFeatures(room.features)),
    [rooms],
  );

  const onScroll = () => {
    const node = scrollRef.current;
    if (!node) return;
    const scrollLeft = node.scrollLeft;
    const itemWidth = node.querySelector("article")?.offsetWidth || 0;
    const gap = 24; // gap-6
    const next = Math.round(scrollLeft / (itemWidth + gap));
    setActiveIndex(Math.max(0, Math.min(rooms.length - 1, next)));
  };

  return (
    <div className="overflow-visible">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-10 pb-12 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-[15vw] md:px-[20vw]"
      >
        {rooms.map((room, index) => (
          <motion.article
            key={room.name}
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.65,
              delay: index * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            animate={{ scale: activeIndex === index ? 1.03 : 0.96 }}
            className="group relative min-w-[75vw] snap-center overflow-hidden border border-gray-200 bg-white sm:min-w-[60vw] md:min-w-[45vw] lg:min-w-[32vw]"
          >
            <div className="relative w-full aspect-[2/3] overflow-hidden sm:aspect-[2/3] lg:h-[750px]">
              <motion.img
                src={room.image}
                alt={room.name}
                className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 md:p-12">
                <Reveal delay={0.05}>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/80">
                    {room.category}
                  </p>
                </Reveal>
                <Reveal delay={0.12}>
                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl md:text-4xl">{room.name}</h3>
                </Reveal>
                <Reveal delay={0.28}>
                  <div className="mt-4 grid grid-cols-1 gap-y-2 gap-x-4 text-[10px] text-white/90 min-[400px]:grid-cols-2 sm:text-xs">
                    {roomFeatures[index].map((feature) => (
                      <div
                        key={`${room.name}-${feature.label}`}
                        className="flex items-center gap-2"
                      >
                        <feature.icon className="size-4" />
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={0.36}>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-white/90">{room.price}</p>
                    <button
                      onClick={() => onSelect?.(index)}
                      className="border border-white px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white hover:text-neutral-900"
                    >
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
