import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MapPin, Users, ChevronLeft, ChevronRight,
  Sun, Moon, Sunrise, Trees, Sofa, UtensilsCrossed,
  LayoutGrid, Phone, Mail, ExternalLink, ArrowRight, Check,
} from "lucide-react";
import { villas } from "../data/villas";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import type { StayType } from "../lib/hooks";
import type { PageView } from "../App";

type Props = {
  villaId: string;
  onNavigate: (p: PageView) => void;
  onReserve: (villaId: string) => void;
};
type AmenityTab = "outdoor" | "indoor" | "kitchen" | "spaces";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const TAB_META: { key: AmenityTab; label: string; Icon: React.ElementType }[] = [
  { key: "outdoor", label: "Outdoor", Icon: Trees },
  { key: "indoor", label: "Indoor", Icon: Sofa },
  { key: "kitchen", label: "Kitchen", Icon: UtensilsCrossed },
  { key: "spaces", label: "Spaces", Icon: LayoutGrid },
];
const STAY_META = [
  { key: "dayStay" as const, label: "Day Stay", Icon: Sun },
  { key: "nightStay" as const, label: "Night Stay", Icon: Moon },
  { key: "overnight" as const, label: "Overnight", Icon: Sunrise },
];

function fmt(n: number) { return `₱${n.toLocaleString()}`; }

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.75, delay, ease }} className={className}>
      {children}
    </motion.div>
  );
}

const label9 = "font-body text-[9px] uppercase tracking-[0.35em] text-shadow/50";
const sectionBorder = "py-20 md:py-28 border-t border-blush/20";

export function VillaDetailPage({ villaId, onNavigate, onReserve }: Props) {
  const villa = villas.find((v) => v.id === villaId) ?? villas[0];
  const [activeThumb, setActiveThumb] = useState(0);
  const [amenityTab, setAmenityTab] = useState<AmenityTab>("outdoor");
  const [thumbStart, setThumbStart] = useState(0);
  const [calStayType, setCalStayType] = useState<StayType>('dayStay');
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 80]);

  const allImages = [villa.coverImage, ...villa.thumbnails];
  const VISIBLE_THUMBS = 4;
  const galleryPreview = villa.galleryImages.slice(0, 6);

  return (
    <div className="bg-petal text-plum font-body min-h-screen">

      {/* ── Hero ── */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden md:h-[78vh]">
        <motion.div
          style={{ backgroundImage: `url(${allImages[activeThumb]})`, y: heroY }}
          className="absolute inset-0 bg-cover bg-center will-change-transform brightness-[0.5]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-plum/50 via-transparent to-plum/80" />

        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-10 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
              <span className={`${label9} text-blush/70`}>Private Villa</span>
              <h1 className="mt-3 font-display text-5xl italic text-petal sm:text-6xl md:text-7xl">{villa.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-5 font-body text-xs text-petal/60">
                <span className="flex items-center gap-2"><MapPin className="size-3" strokeWidth={1} />{villa.location}</span>
                <span className="flex items-center gap-2"><Users className="size-3" strokeWidth={1} />Up to {villa.capacity.max} guests</span>
              </div>
            </motion.div>

            <div className="mt-6 flex items-center gap-2">
              {allImages.length > VISIBLE_THUMBS && (
                <button onClick={() => setThumbStart(s => Math.max(0, s - 1))} disabled={thumbStart === 0}
                  className="flex size-9 items-center justify-center bg-plum/50 text-petal disabled:opacity-30 hover:bg-plum transition-colors backdrop-blur-sm">
                  <ChevronLeft className="size-4" strokeWidth={1} />
                </button>
              )}
              <div className="flex gap-2 overflow-hidden">
                {allImages.slice(thumbStart, thumbStart + VISIBLE_THUMBS).map((img, i) => {
                  const idx = thumbStart + i;
                  return (
                    <button key={img} onClick={() => setActiveThumb(idx)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden border transition-all md:h-16 md:w-24 ${activeThumb === idx ? 'border-petal opacity-100' : 'border-petal/25 opacity-50 hover:opacity-80'}`}>
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
              {allImages.length > VISIBLE_THUMBS && (
                <button onClick={() => setThumbStart(s => Math.min(allImages.length - VISIBLE_THUMBS, s + 1))} disabled={thumbStart >= allImages.length - VISIBLE_THUMBS}
                  className="flex size-9 items-center justify-center bg-plum/50 text-petal disabled:opacity-30 hover:bg-plum transition-colors backdrop-blur-sm">
                  <ChevronRight className="size-4" strokeWidth={1} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky bar ── */}
      <div className="sticky top-16 z-30 border-b border-blush/20 bg-petal/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5 md:px-12 lg:px-20">
          <div className="hidden flex-wrap gap-2 md:flex">
            {villa.highlights.map((h) => (
              <span key={h} className="border border-blush/30 px-4 py-1.5 font-body text-[9px] uppercase tracking-[0.2em] text-shadow/60">{h}</span>
            ))}
          </div>
          <span className="font-display text-xl italic text-plum md:hidden">{villa.name}</span>
          <button onClick={() => onReserve(villa.id)}
            className="flex items-center gap-2 bg-plum px-6 py-2.5 font-body text-[10px] uppercase tracking-[0.2em] text-petal transition-all hover:bg-shadow">
            Reserve <ArrowRight className="size-3" strokeWidth={1} />
          </button>
        </div>
      </div>

      {/* ── About ── */}
      <section className={sectionBorder}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
            <Reveal>
              <p className={`${label9} mb-4`}>About the Villa</p>
              <h2 className="font-display text-4xl italic text-plum md:text-5xl">{villa.tagline}</h2>
              <p className="mt-6 font-body text-sm text-shadow leading-relaxed">{villa.longDescription}</p>
              <div className="mt-8 border-l-2 border-blush pl-6">
                <p className={label9}>100% Private Property</p>
                <p className="mt-2 font-body text-sm text-shadow">The entire villa is exclusively yours — no shared spaces, no other guests.</p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="grid grid-cols-2 gap-3">
                {villa.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3 border border-blush/20 bg-white p-4">
                    <Check className="size-3 text-blush shrink-0" strokeWidth={2} />
                    <span className="font-body text-xs text-plum/80">{h}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Amenities ── */}
      <section className={`${sectionBorder} bg-white`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Reveal>
            <p className={`${label9} mb-4`}>What's Included</p>
            <h2 className="font-display text-4xl italic text-plum md:text-5xl">Villa Amenities</h2>
          </Reveal>
          <div className="mt-10 flex flex-wrap gap-2">
            {TAB_META.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setAmenityTab(key)}
                className={`flex items-center gap-2 border px-5 py-2.5 font-body text-[10px] uppercase tracking-[0.15em] transition-all ${amenityTab === key ? 'border-plum bg-plum text-petal' : 'border-blush/25 text-shadow hover:border-plum/40 hover:text-plum'}`}>
                <Icon className="size-3.5" strokeWidth={1} /> {label}
              </button>
            ))}
          </div>
          <motion.div key={amenityTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {villa.amenities[amenityTab].map((item) => (
              <div key={item} className="flex items-center gap-3 border border-blush/15 bg-petal p-4">
                <Check className="size-3 text-blush shrink-0" strokeWidth={2} />
                <span className="font-body text-xs text-plum/80">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Rates ── */}
      <section className={sectionBorder}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Reveal>
            <p className={`${label9} mb-4`}>Pricing</p>
            <h2 className="font-display text-4xl italic text-plum md:text-5xl">Rates & Packages</h2>
            <p className="mt-3 font-body text-xs text-shadow">All rates are for the entire villa. +₱500 per extra guest beyond 10 pax.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STAY_META.map(({ key, label, Icon }, i) => {
              const rate = villa.rates[key];
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: i * 0.1, ease }}
                  className="border border-blush/20 bg-white p-8 hover:border-blush/50 transition-colors">
                  <Icon className="size-5 text-blush mb-5" strokeWidth={1} />
                  <h3 className="font-display text-2xl italic text-plum">{label}</h3>
                  <p className="mt-1 font-body text-[9px] uppercase tracking-[0.2em] text-shadow/50">{rate.timeRange}</p>
                  <p className="font-body text-[9px] text-shadow/50">Up to {rate.capacity} guests</p>
                  <div className="mt-8 space-y-4 border-t border-blush/15 pt-5">
                    <div className="flex justify-between">
                      <span className="font-body text-[9px] uppercase tracking-[0.2em] text-shadow/60">Weekday</span>
                      <span className="font-display text-2xl italic text-gold">{fmt(rate.weekday)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-[9px] uppercase tracking-[0.2em] text-shadow/60">Weekend</span>
                      <span className="font-display text-2xl italic text-gold">{fmt(rate.weekend)}</span>
                    </div>
                  </div>
                  <button onClick={() => onReserve(villa.id)}
                    className="mt-8 w-full bg-plum py-4 font-body text-[10px] uppercase tracking-[0.2em] text-petal hover:bg-shadow transition-all shadow-lg shadow-plum/10">
                    Book {label}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Gallery Preview ── */}
      <section className={`${sectionBorder} bg-white`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Reveal className="flex items-end justify-between mb-10">
            <div>
              <p className={`${label9} mb-4`}>Photos</p>
              <h2 className="font-display text-4xl italic text-plum md:text-5xl">Gallery</h2>
            </div>
            <button onClick={() => onNavigate({ type: "gallery", villaId: villa.id })}
              className="plum-link hidden md:flex">View All →</button>
          </Reveal>
          <div className="grid auto-rows-[160px] grid-cols-3 gap-3 md:auto-rows-[200px] md:gap-4">
            {galleryPreview.map((img, index) => {
              const spans = ["col-span-2 row-span-2","col-span-1","col-span-1","col-span-1","col-span-1","col-span-1"];
              return (
                <motion.figure key={img} initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: index * 0.07 }}
                  className={`group overflow-hidden cursor-pointer border border-blush/10 ${spans[index]}`}
                  onClick={() => onNavigate({ type: "gallery", villaId: villa.id })}>
                  <img src={img} loading="lazy" alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </motion.figure>
              );
            })}
          </div>
          <div className="mt-8 text-center md:hidden">
            <button onClick={() => onNavigate({ type: "gallery", villaId: villa.id })} className="plum-link">View Full Gallery →</button>
          </div>
        </div>
      </section>

      {/* ── Availability ── */}
      <section className={sectionBorder}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Reveal>
            <p className={`${label9} mb-4`}>Booking</p>
            <h2 className="font-display text-4xl italic text-plum md:text-5xl">Check Availability</h2>
            <p className="mt-3 font-body text-xs text-shadow">Pick a package, then tap a date to see if it's available.</p>
          </Reveal>

          {/* Package filter */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { key: 'dayStay' as StayType,   label: 'Day Stay',   sub: '8am – 5pm',   Icon: Sun },
              { key: 'nightStay' as StayType, label: 'Night Stay', sub: '8pm – 5am',   Icon: Moon },
              { key: 'overnight' as StayType, label: 'Overnight',  sub: '2pm – 12pm',  Icon: Sunrise },
            ].map(({ key, label, sub, Icon }) => (
              <button
                key={key}
                onClick={() => setCalStayType(key)}
                className={`flex items-center gap-3 border px-5 py-3 transition-all ${
                  calStayType === key
                    ? 'border-plum bg-plum text-petal'
                    : 'border-blush/25 text-shadow hover:border-plum/40 hover:text-plum'
                }`}
              >
                <Icon className="size-4" strokeWidth={1} />
                <div className="text-left">
                  <p className="font-body text-[10px] uppercase tracking-[0.2em] leading-none">{label}</p>
                  <p className={`font-body text-[9px] mt-0.5 ${calStayType === key ? 'text-petal/60' : 'text-shadow/50'}`}>{sub}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
            <AvailabilityCalendar stayType={calStayType} />
            <div className="space-y-4">
              <div className="border border-blush/20 bg-white p-7">
                <p className={`${label9} mb-5`}>Quick Rates</p>
                <div className="space-y-3">
                  {[
                    { label: 'Day Stay (Weekday)', value: villa.rates.dayStay.weekday },
                    { label: 'Day Stay (Weekend)', value: villa.rates.dayStay.weekend },
                    { label: 'Overnight (Weekday)', value: villa.rates.overnight.weekday },
                    { label: 'Overnight (Weekend)', value: villa.rates.overnight.weekend },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between border-b border-blush/10 pb-3">
                      <span className="font-body text-xs text-shadow">{label}</span>
                      <span className="font-display text-lg italic text-gold">{fmt(value)}</span>
                    </div>
                  ))}
                  <p className="font-body text-[9px] text-shadow/40 uppercase tracking-wide pt-1">+₱500/extra guest past 10 pax</p>
                </div>
              </div>
              <button onClick={() => onReserve(villa.id)}
                className="w-full bg-plum py-4 font-body text-[11px] uppercase tracking-[0.25em] text-petal hover:bg-shadow transition-all">
                Reserve the Villa
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className={`${sectionBorder} bg-white`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Reveal>
            <p className={`${label9} mb-4`}>Location</p>
            <h2 className="font-display text-4xl italic text-plum md:text-5xl">Find the Villa</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px]">
            <div className="overflow-hidden border border-blush/15">
              <iframe
                title="Villa Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(villa.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="h-[400px] w-full border-0 md:h-[480px]"
                loading="lazy"
              />
            </div>
            <div className="space-y-4">
              <div className="border border-blush/15 bg-petal p-7 space-y-3">
                <p className={`${label9} mb-4`}>Get in Touch</p>
                {[
                  { href: `tel:${villa.contact.phone}`, icon: <Phone className="size-3.5" strokeWidth={1} />, text: villa.contact.phone },
                  { href: `mailto:${villa.contact.email}`, icon: <Mail className="size-3.5" strokeWidth={1} />, text: villa.contact.email },
                  { href: `https://${villa.contact.facebook}`, icon: <ExternalLink className="size-3.5" strokeWidth={1} />, text: villa.contact.facebook },
                  { href: `https://instagram.com/${villa.contact.instagram.replace('@','')}`, icon: <ExternalLink className="size-3.5" strokeWidth={1} />, text: villa.contact.instagram },
                ].map(({ href, icon, text }) => (
                  <a key={text} href={href}
                    className="flex items-center gap-3 border border-blush/15 bg-white p-3 font-body text-xs text-shadow hover:border-plum/30 hover:text-plum transition-colors">
                    {icon} {text}
                  </a>
                ))}
              </div>
              <div className="border border-blush/10 p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-blush/60" strokeWidth={1} />
                  <div>
                    <p className={`${label9} mb-1`}>Address</p>
                    <p className="font-body text-xs text-shadow/70 leading-relaxed">{villa.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="sticky bottom-0 z-30 border-t border-blush/20 bg-petal/95 px-5 py-4 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-body text-[9px] uppercase tracking-[0.2em] text-shadow/50">Starts at</span>
            <p className="font-display text-xl italic text-gold mt-0.5">{fmt(villa.rates.dayStay.weekday)}</p>
          </div>
          <button onClick={() => onReserve(villa.id)}
            className="flex-1 bg-plum py-3.5 font-body text-[11px] uppercase tracking-[0.2em] text-petal hover:bg-shadow transition-all">
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}
