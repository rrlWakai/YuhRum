import { useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  Phone,
  Mail,
  ArrowRight,
  Wifi,
  Compass,
  ChefHat,
  Sparkles,
  Flame,
  Waves,
} from "lucide-react";

import { villas } from "../data/villas";
import type { PageView } from "../App";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

type Props = {
  onNavigate: (p: PageView) => void;
  onReserve: (villaId: string) => void;
};

const experiences = [
  {
    num: "01",
    title: "The Private Pool",
    body: "Your own water, your own light. No schedules, no strangers. The pool opens when you do.",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80",
    location: "Villa Serena",
  },
  {
    num: "02",
    title: "The Garden Estate",
    body: "Lush. Still. Entirely yours. A private estate for those who seek quiet without sacrificing comfort.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80",
    location: "Villa Verde",
  },
  {
    num: "03",
    title: "The Gathered Moment",
    body: "For families, barkadas, milestones. Events held in spaces that feel like belonging.",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
    location: "Both Villas",
  },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80", location: "Villa Serena" },
  { src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", location: "Private Pool" },
  { src: "https://images.unsplash.com/photo-1501117716987-c8e1ecb21076?auto=format&fit=crop&w=800&q=80", location: "Sunset Terrace" },
  { src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80", location: "Villa Verde" },
  { src: "https://images.unsplash.com/photo-1602002418672-43121356dc46?auto=format&fit=crop&w=800&q=80", location: "Garden Estate" },
  { src: "https://images.unsplash.com/photo-1615529162924-f8605388465d?auto=format&fit=crop&w=800&q=80", location: "The Pool House" },
];

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HomePage({ onNavigate, onReserve }: Props) {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1.08, 1.0]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="bg-petal text-plum font-body overflow-x-hidden">

      {/* ═══ HERO — cinematic dark, petals, large italic ═══ */}
      <section className="relative h-[100svh] overflow-hidden">

        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 will-change-transform">
          <img
            src="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1900&q=80"
            alt="Yuhrum Villa — misty waters at dawn"
            className="h-full w-full object-cover brightness-[0.42]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 flex h-full flex-col justify-center px-6 md:px-16 lg:px-28 max-w-7xl"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            className="font-body text-[9px] uppercase tracking-[0.4em] text-blush/80 mb-5"
          >
            Private Villa Rentals
          </motion.p>

          <h1 className="font-display italic leading-[0.95] text-petal">
            {["Where", "stillness", "finds you."].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.35 + i * 0.14, ease }}
                className="block text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem]"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.0, ease }}
            className="mt-8 font-body text-sm text-petal/60 max-w-xs tracking-wide leading-relaxed"
          >
            Two private villas. One standard of stillness.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.2, ease }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button
              onClick={() => document.getElementById('villas')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-body text-[10px] uppercase tracking-[0.25em] text-plum bg-petal px-8 py-3.5 transition-all duration-300 hover:bg-blush"
            >
              Explore Villas
            </button>
            <button
              onClick={() => onReserve(villas[0].id)}
              className="font-body text-[10px] uppercase tracking-[0.25em] text-plum bg-blush px-8 py-3.5 transition-all duration-300 hover:bg-petal"
            >
              Reserve Now
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <motion.div
            animate={{ scaleY: [0.2, 1, 0.2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-10 w-px bg-petal/30 origin-top"
          />
          <ChevronDown className="size-4 text-petal/40" strokeWidth={1} />
        </div>
      </section>

      {/* ═══ VILLAS — light bg, carousel on ALL devices ═══ */}
      <section id="villas" className="pt-24 md:pt-32 pb-0 bg-petal">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mb-12">
          <Reveal>
            <p className="font-body text-[9px] uppercase tracking-[0.4em] text-shadow/50 mb-4">Our Properties</p>
            <h2 className="font-display text-5xl italic text-plum md:text-6xl">
              Two Villas.<br />One Standard.
            </h2>
            <p className="mt-4 font-body text-sm text-shadow max-w-md leading-relaxed">
              100% private. No shared spaces. No other guests. Pick your villa and make it yours.
            </p>
          </Reveal>
        </div>

        {/* Carousel — works on ALL screen sizes */}
        <div className="villa-carousel">
          {villas.map((villa, i) => (
            <motion.article
              key={villa.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease }}
              className="villa-carousel-card group cursor-pointer"
              onClick={() => onNavigate({ type: 'detail', villaId: villa.id })}
            >
              {/* Portrait image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-blush/20">
                <motion.img
                  src={villa.coverImage}
                  alt={villa.name}
                  className="h-full w-full object-cover brightness-90 transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum/60 via-transparent to-transparent" />
                {/* Blush accent on hover — bottom edge */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.45, ease }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blush origin-left"
                />
              </div>
              {/* Card details */}
              <div className="pt-5 pb-2 border-b border-plum/10">
                <p className="font-body text-[9px] uppercase tracking-[0.35em] text-shadow/50 mb-1">Private Villa</p>
                <h3 className="font-display text-3xl italic text-plum">{villa.name}</h3>
                <p className="font-body text-xs text-shadow mt-2 leading-relaxed">{villa.tagline}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-display text-xl italic text-gold">
                    From ₱{Math.min(villa.rates.dayStay.weekday, villa.rates.nightStay.weekday).toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onReserve(villa.id); }}
                    className="plum-link"
                  >
                    Reserve <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6 pb-12">
          {villas.map((_, i) => (
            <div key={i} className={`h-px transition-all duration-300 ${i === 0 ? 'w-8 bg-plum' : 'w-4 bg-plum/25'}`} />
          ))}
        </div>
      </section>

      {/* ═══ AMENITIES — premium light/cream background with rich interactive hover grid ═══ */}
      <section id="amenities" className="py-24 md:py-32 bg-white border-t border-blush/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Reveal className="mb-16">
            <p className="font-body text-[9px] uppercase tracking-[0.4em] text-shadow/50 mb-4">Sanctuary Luxuries</p>
            <h2 className="font-display text-5xl italic text-plum md:text-6xl mb-6">
              Details designed<br />for stillness.
            </h2>
            <p className="font-body text-sm text-shadow max-w-lg leading-relaxed">
              Every space in Yuhrum is packed with high-end provisions so you never have to step outside your private oasis.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Waves,
                title: "Private Natural Pool",
                desc: "Exclusively yours. High-filtration deep-water dipping pool with bespoke night ambiance lighting.",
              },
              {
                icon: Wifi,
                title: "Starlink High-Speed Wi-Fi",
                desc: "Ultra-fast satellite connectivity and cinematic outdoor/indoor theater projection configurations.",
              },
              {
                icon: Compass,
                title: "Bespoke Concierge Butler",
                desc: "Dedicated personal host to curate your stay, organize bonfires, and orchestrate private dining setups.",
              },
              {
                icon: ChefHat,
                title: "Alfresco Teak Kitchen",
                desc: "Fully integrated gas grills, premium refrigerators, stone prep surfaces, and outdoor dining bar.",
              },
              {
                icon: Sparkles,
                title: "Wellness Sunken Tub",
                desc: "Relaxing natural wood-accented outdoor bathtubs, private massage pavilions, and relaxation decks.",
              },
              {
                icon: Compass, // Replaced Flame with Compass/Sparkles or flame as imported
                title: "Celestial Bonfire Area",
                desc: "Handcrafted natural stone fire pits under a canopy of stars, pre-stacked with wood and plush seating.",
              },
            ].map((amenity, idx) => {
              // Ensure we use Flame for the bonfire
              const IconComp = idx === 5 ? Flame : amenity.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease }}
                  className="group relative border border-blush/10 bg-petal/30 p-8 transition-all duration-300 hover:border-plum/20 hover:bg-petal/60 hover:shadow-sm"
                >
                  <div className="mb-6 flex size-12 items-center justify-center border border-blush/20 bg-white text-plum transition-all duration-500 group-hover:bg-plum group-hover:text-petal">
                    <IconComp className="size-5 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
                  </div>
                  <h3 className="font-display text-xl italic text-plum mb-3 group-hover:text-gold transition-colors">
                    {amenity.title}
                  </h3>
                  <p className="font-body text-xs text-shadow leading-relaxed">
                    {amenity.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ EXPERIENCES — alternating, white sections ═══ */}
      <section id="experience" className="bg-white">
        {experiences.map((exp, i) => (
          <div
            key={exp.num}
            className={`relative flex flex-col md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''} border-t border-blush/20`}
          >
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 1.04 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease }}
              className="relative w-full md:w-[55%] aspect-[4/3] md:aspect-auto md:min-h-[55vh] overflow-hidden"
            >
              <img
                src={exp.image}
                alt={exp.title}
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Text */}
            <Reveal
              delay={0.15}
              className="flex flex-col justify-center px-8 py-14 md:w-[45%] md:px-14 lg:px-20"
            >
              <p className="font-body text-[9px] uppercase tracking-[0.4em] text-blush mb-5">{exp.location}</p>
              {/* Ghost numeral — subtle behind text */}
              <div className="relative">
                <span className="absolute -top-4 -left-1 font-display text-7xl italic text-plum/[0.05] select-none pointer-events-none leading-none hidden md:block">
                  {exp.num}
                </span>
                <h3 className="relative font-display text-4xl italic text-plum leading-tight">{exp.title}</h3>
              </div>
              <p className="mt-5 font-body text-sm text-shadow leading-relaxed max-w-xs">{exp.body}</p>
              <button
                onClick={() => onNavigate({ type: 'detail', villaId: villas[i % villas.length].id })}
                className="plum-link mt-8 w-fit"
              >
                Explore
              </button>
            </Reveal>
          </div>
        ))}
      </section>

      {/* ═══ THE FEEL — atmospheric, centered quote ═══ */}
      <section id="feel" className="bg-petal py-24 md:py-40">
        <Reveal>
          <div
            className="w-full overflow-hidden"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0 100%)' }}
          >
            <img
              src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1900&q=80"
              alt="Still waters"
              className="w-full h-[55vh] md:h-[70vh] object-cover brightness-[0.7] sepia-[0.15]"
            />
          </div>
        </Reveal>

        <Reveal delay={0.25} className="max-w-2xl mx-auto px-6 pt-20 md:pt-28 text-center">
          <p className="font-display text-3xl italic text-plum leading-relaxed md:text-4xl">
            "Some places do not ask you to hurry.<br />
            Yuhrum is one of them."
          </p>
          <p className="mt-7 font-body text-[9px] uppercase tracking-[0.4em] text-shadow/50">
            Mono no Aware — 物の哀れ
          </p>
        </Reveal>
      </section>

      {/* ═══ GALLERY — petal bg, masonry ═══ */}
      <section id="gallery" className="bg-white py-24 md:py-32 border-t border-blush/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Reveal className="flex items-end justify-between mb-12">
            <div>
              <p className="font-body text-[9px] uppercase tracking-[0.4em] text-shadow/50 mb-4">Gallery</p>
              <h2 className="font-display text-5xl italic text-plum md:text-6xl">A glimpse<br />of stillness.</h2>
            </div>
            <button
              onClick={() => onNavigate({ type: 'gallery', villaId: villas[0].id })}
              className="plum-link hidden md:flex"
            >
              View All
            </button>
          </Reveal>

          <div className="masonry-gallery">
            {galleryImages.map((img, i) => (
              <motion.figure
                key={img.src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.05, ease }}
                className="masonry-item group relative overflow-hidden cursor-pointer"
                onClick={() => onNavigate({ type: 'gallery', villaId: villas[0].id })}
              >
                <img
                  src={img.src}
                  alt={img.location}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-plum/0 group-hover:bg-plum/20 transition-colors duration-400 flex items-end">
                  <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-400 w-full p-4 bg-gradient-to-t from-plum/70 to-transparent">
                    <p className="font-display text-lg italic text-petal">{img.location}</p>
                  </div>
                </div>
              </motion.figure>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <button
              onClick={() => onNavigate({ type: 'gallery', villaId: villas[0].id })}
              className="plum-link"
            >
              View Full Gallery
            </button>
          </div>
        </div>
      </section>

      {/* ═══ BOOKING CTA — subtle blush tone ═══ */}
      <section className="relative bg-plum py-32 md:py-48 overflow-hidden">

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display text-[18vw] text-petal/[0.04] leading-none">安らぎ</span>
        </div>

        <Reveal className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="font-body text-[9px] uppercase tracking-[0.4em] text-blush/50 mb-8">Reserve Your Stay</p>
          <h2 className="font-display text-5xl italic text-petal leading-tight md:text-6xl lg:text-7xl">
            Your moment of<br />stillness awaits.
          </h2>
          <p className="mt-7 font-body text-sm text-petal/50 max-w-sm mx-auto leading-relaxed">
            Two villas. One exclusively yours. From sunrise to dawn.
          </p>
          <button
            onClick={() => onReserve(villas[0].id)}
            className="mt-12 bg-blush text-plum px-12 py-4 text-[10px] uppercase tracking-[0.25em] transition-all hover:bg-petal shadow-xl shadow-black/20"
          >
            Begin Your Reservation
          </button>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-petal border-t border-blush/30 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center md:items-start">
              <p className="font-display text-3xl italic text-plum">Yuhrum</p>
              <p className="mt-2 font-body text-[9px] uppercase tracking-[0.25em] text-shadow/50">Where stillness finds you.</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              {[
                { label: 'Villa Serena', action: () => onNavigate({ type: 'detail', villaId: 'villa-serena' }) },
                { label: 'Villa Verde', action: () => onNavigate({ type: 'detail', villaId: 'villa-verde' }) },
                { label: 'Gallery', action: () => onNavigate({ type: 'gallery', villaId: villas[0].id }) },
                { label: 'Reserve', action: () => onReserve(villas[0].id) },
              ].map((item) => (
                <button key={item.label} onClick={item.action}
                  className="font-body text-[9px] uppercase tracking-[0.25em] text-shadow/60 hover:text-plum transition-colors">
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3 md:items-end">
              <a href={`tel:${villas[0].contact.phone}`}
                className="flex items-center gap-2 font-body text-xs text-shadow/60 hover:text-plum transition-colors">
                <Phone className="size-3.5" strokeWidth={1} /> {villas[0].contact.phone}
              </a>
              <a href={`mailto:${villas[0].contact.email}`}
                className="flex items-center gap-2 font-body text-xs text-shadow/60 hover:text-plum transition-colors">
                <Mail className="size-3.5" strokeWidth={1} /> {villas[0].contact.email}
              </a>
              <div className="flex gap-4 mt-2">
                <a href="#" aria-label="Instagram" className="text-shadow/50 hover:text-plum transition-colors">
                  <ExternalLink className="size-4" strokeWidth={1} />
                </a>
                <a href="#" aria-label="Facebook" className="text-shadow/50 hover:text-plum transition-colors">
                  <ExternalLink className="size-4" strokeWidth={1} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-4">
            <div className="flex-1 h-px bg-blush/30" />
            <p className="font-body text-[9px] uppercase tracking-[0.25em] text-shadow/40">
              © {year} Yuhrum Villas
            </p>
            <div className="flex-1 h-px bg-blush/30" />
          </div>
        </div>
      </footer>
    </main>
  );
}
