import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import {
  MapPin, Users, ChevronLeft, ChevronRight, Sun, Moon, Sunrise,
  Trees, Sofa, UtensilsCrossed, LayoutGrid, Phone, Mail,
  ExternalLink, ArrowRight, Check,
} from 'lucide-react';
import { villas } from '../data/villas';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import type { PageView } from '../App';

type Props = {
  villaId: string;
  onNavigate: (p: PageView) => void;
  onReserve: (villaId: string) => void;
};

type AmenityTab = 'outdoor' | 'indoor' | 'kitchen' | 'spaces';

const TAB_META: { key: AmenityTab; label: string; Icon: React.ElementType }[] = [
  { key: 'outdoor', label: 'Outdoor', Icon: Trees },
  { key: 'indoor', label: 'Indoor', Icon: Sofa },
  { key: 'kitchen', label: 'Kitchen', Icon: UtensilsCrossed },
  { key: 'spaces', label: 'Villa Spaces', Icon: LayoutGrid },
];

const STAY_META = [
  { key: 'dayStay' as const, label: 'Day Stay', Icon: Sun },
  { key: 'nightStay' as const, label: 'Night Stay', Icon: Moon },
  { key: 'overnight' as const, label: 'Overnight', Icon: Sunrise },
];

function fmt(n: number) { return `₱${n.toLocaleString()}`; }

export function VillaDetailPage({ villaId, onNavigate, onReserve }: Props) {
  const villa = villas.find((v) => v.id === villaId) ?? villas[0];
  const [activeThumb, setActiveThumb] = useState(0);
  const [amenityTab, setAmenityTab] = useState<AmenityTab>('outdoor');
  const [thumbStart, setThumbStart] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 60]);

  const allImages = [villa.coverImage, ...villa.thumbnails];
  const VISIBLE_THUMBS = 4;

  function prevThumb() {
    setThumbStart((s) => Math.max(0, s - 1));
  }
  function nextThumb() {
    setThumbStart((s) => Math.min(allImages.length - VISIBLE_THUMBS, s + 1));
  }

  const galleryPreview = villa.galleryImages.slice(0, 6);

  return (
    <div className="bg-[#F7F6F4]">
      <section className="relative h-[65vh] min-h-[480px] overflow-hidden md:h-[75vh]">
        <motion.div
          style={{ backgroundImage: `url(${allImages[activeThumb]})`, y: heroY }}
          className="absolute inset-0 bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-10 md:px-10">
          <div className="mx-auto max-w-[1240px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-block bg-white/20 border border-white/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                Private Villa
              </span>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">{villa.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-white/85">
                <span className="flex items-center gap-2"><MapPin className="size-4" /> {villa.location}</span>
                <span className="flex items-center gap-2"><Users className="size-4" /> Up to {villa.capacity.max} guests</span>
              </div>
            </motion.div>

            <div className="mt-8 flex items-center gap-2">
              {allImages.length > VISIBLE_THUMBS && (
                <button onClick={prevThumb} disabled={thumbStart === 0} className="flex size-10 shrink-0 items-center justify-center bg-black/40 text-white disabled:opacity-30 hover:bg-black/60 transition-colors backdrop-blur-sm">
                  <ChevronLeft className="size-4" />
                </button>
              )}
              <div className="flex gap-2 overflow-hidden">
                {allImages.slice(thumbStart, thumbStart + VISIBLE_THUMBS).map((img, i) => {
                  const idx = thumbStart + i;
                  return (
                    <button
                      key={img}
                      onClick={() => setActiveThumb(idx)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden border transition-all md:h-20 md:w-32 ${
                        activeThumb === idx ? 'border-white opacity-100' : 'border-white/30 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
              {allImages.length > VISIBLE_THUMBS && (
                <button onClick={nextThumb} disabled={thumbStart >= allImages.length - VISIBLE_THUMBS} className="flex size-10 shrink-0 items-center justify-center bg-black/40 text-white disabled:opacity-30 hover:bg-black/60 transition-colors backdrop-blur-sm">
                  <ChevronRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4 md:px-10">
          <div className="hidden flex-wrap gap-2 md:flex">
            {villa.highlights.map((h) => (
              <span key={h} className="border border-gray-200 bg-[#F7F6F4] px-4 py-1.5 text-[10px] uppercase tracking-[0.15em] text-gray-600">{h}</span>
            ))}
          </div>
          <div className="md:hidden flex items-center gap-2">
            <span className="font-serif text-lg text-neutral-900">{villa.name}</span>
          </div>
          <button
            onClick={() => onReserve(villa.id)}
            className="flex shrink-0 items-center gap-2 btn-navy px-6 py-2.5 text-xs font-medium uppercase tracking-[0.15em]"
          >
            Reserve <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <Section id="about" className="bg-[#F7F6F4] border-b border-gray-200">
        <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal delay={0.05}>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">About the Villa</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl">{villa.tagline}</h2>
            <p className="mt-6 text-base leading-relaxed text-gray-700 md:text-lg">{villa.longDescription}</p>
            <div className="mt-8 border-l border-gray-300 pl-6">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">100% Private Property</p>
              <p className="mt-3 text-sm text-gray-700">The entire villa is exclusively yours — no shared spaces, no other guests.</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-4">
              {villa.highlights.map((h) => (
                <div key={h} className="flex items-center gap-4 border border-gray-200 bg-white p-5">
                  <div className="flex size-6 shrink-0 items-center justify-center border border-gray-200 bg-gray-50">
                    <Check className="size-3 text-neutral-800" />
                  </div>
                  <span className="text-sm text-neutral-800">{h}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      <Section id="amenities" className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1240px]">
          <Reveal delay={0.05}>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">What's Included</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl">Villa Amenities</h2>
          </Reveal>

          <div className="mt-10 flex flex-wrap gap-3">
            {TAB_META.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setAmenityTab(key)}
                className={`flex items-center gap-2 border px-6 py-3 text-xs font-medium uppercase tracking-[0.1em] transition-all duration-200 ${
                  amenityTab === key
                    ? 'border-[#0A192F] bg-[#0A192F] text-white'
                    : 'border-gray-200 bg-[#F7F6F4] text-gray-600 hover:border-neutral-900 hover:text-neutral-900'
                }`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          <motion.div
            key={amenityTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            {villa.amenities[amenityTab].map((item) => (
              <div key={item} className="flex items-center gap-4 border border-gray-200 bg-[#F7F6F4] p-5">
                <div className="flex size-6 shrink-0 items-center justify-center border border-gray-200 bg-white">
                  <Check className="size-3 text-neutral-800" />
                </div>
                <span className="text-sm text-neutral-800">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section id="rates" className="bg-[#F7F6F4] border-b border-gray-200">
        <div className="mx-auto max-w-[1240px]">
          <Reveal delay={0.05}>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Pricing</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl">Rates & Packages</h2>
            <p className="mt-4 text-gray-600">All rates are for the entire villa. +₱500 per extra guest beyond 10 pax.</p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STAY_META.map(({ key, label, Icon }) => {
              const rate = villa.rates[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  className="border border-gray-200 bg-white p-7 transition-shadow hover:shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                >
                  <div className="mb-6 inline-flex border border-gray-200 bg-[#F7F6F4] p-3">
                    <Icon className="size-5 text-neutral-800" />
                  </div>
                  <h3 className="font-serif text-2xl text-neutral-950">{label}</h3>
                  <p className="mt-3 text-xs text-gray-500">{rate.timeRange}</p>
                  <p className="mt-1 text-xs text-gray-500">Up to {rate.capacity} guests</p>

                  <div className="mt-8 space-y-5 border-t border-gray-200 pt-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Weekday</p>
                        <p className="mt-2 font-serif text-3xl text-neutral-900">{fmt(rate.weekday)}</p>
                      </div>
                      <span className="text-xs text-gray-400">Mon–Thu</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Weekend</p>
                        <p className="mt-2 font-serif text-3xl text-neutral-900">{fmt(rate.weekend)}</p>
                      </div>
                        <span className="text-xs text-gray-400">Fri–Sun</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onReserve(villa.id)}
                    className="mt-8 flex w-full items-center justify-center btn-navy px-6 py-3.5 text-xs font-medium uppercase tracking-[0.15em]"
                  >
                    Book {label}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section id="gallery-preview" className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1240px]">
          <Reveal delay={0.05}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Photos</p>
                <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl">Gallery</h2>
              </div>
              <button
                onClick={() => onNavigate({ type: 'gallery', villaId: villa.id })}
                className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-[0.1em] text-gray-700 hover:text-neutral-950"
              >
                View Full Gallery <ArrowRight className="size-4" />
              </button>
            </div>
          </Reveal>
          <div className="mt-10 grid auto-rows-[200px] grid-cols-3 gap-4 md:auto-rows-[260px] md:gap-5">
            {galleryPreview.map((img, index) => {
              const spans = [
                'col-span-2 row-span-2', 'col-span-1', 'col-span-1',
                'col-span-1', 'col-span-1', 'col-span-1 row-span-1',
              ];
              return (
                <motion.figure
                  key={img}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`group overflow-hidden border border-gray-200 bg-[#F7F6F4] cursor-pointer ${spans[index]}`}
                  onClick={() => onNavigate({ type: 'gallery', villaId: villa.id })}
                >
                  <img
                    src={img}
                    alt={`${villa.name} gallery`}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </motion.figure>
              );
            })}
          </div>
          <div className="mt-8 text-center md:hidden">
            <button
              onClick={() => onNavigate({ type: 'gallery', villaId: villa.id })}
              className="inline-flex items-center gap-2 border border-gray-200 bg-white px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] text-gray-800 transition-colors hover:bg-neutral-50"
            >
              View Full Gallery <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </Section>

      <Section id="availability" className="bg-[#F7F6F4] border-b border-gray-200">
        <div className="mx-auto max-w-[1240px]">
          <Reveal delay={0.05}>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Booking</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl">Check Availability</h2>
            <p className="mt-4 text-gray-600">Select your preferred dates to check if the villa is available.</p>
          </Reveal>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
            <AvailabilityCalendar />
            <div className="space-y-6">
              <div className="border border-gray-200 bg-white p-7">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Quick Rates</p>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Day Stay (Weekday)</span>
                    <span className="font-serif text-lg text-neutral-900">{fmt(villa.rates.dayStay.weekday)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Day Stay (Weekend)</span>
                    <span className="font-serif text-lg text-neutral-900">{fmt(villa.rates.dayStay.weekend)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Overnight (Weekday)</span>
                    <span className="font-serif text-lg text-neutral-900">{fmt(villa.rates.overnight.weekday)}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-600">Overnight (Weekend)</span>
                    <span className="font-serif text-lg text-neutral-900">{fmt(villa.rates.overnight.weekend)}</span>
                  </div>
                  <p className="pt-2 text-xs text-gray-400 uppercase tracking-wide">+₱500 per extra guest beyond 10 pax</p>
                </div>
              </div>
              <button
                onClick={() => onReserve(villa.id)}
                className="flex w-full items-center justify-center btn-navy px-6 py-4 text-sm font-medium uppercase tracking-[0.15em]"
              >
                Reserve the Villa
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section id="location" className="bg-white">
        <div className="mx-auto max-w-[1240px]">
          <Reveal delay={0.05}>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Location</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl">Find the Villa</h2>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden border border-gray-200 bg-[#F7F6F4]"
            >
              <iframe
                title="Villa Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=115.098%2C-8.876%2C115.296%2C-8.69&layer=mapnik"
                className="h-[400px] w-full border-0 md:h-[500px]"
                loading="lazy"
              />
            </motion.div>

            <Reveal delay={0.1} className="space-y-6">
              <div className="border border-gray-200 bg-[#F7F6F4] p-7">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Get in Touch</p>
                <div className="mt-6 space-y-3">
                  <a href={`tel:${villa.contact.phone}`} className="flex items-center gap-4 border border-gray-200 bg-white p-4 text-sm text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">
                    <Phone className="size-4 text-neutral-500" />
                    {villa.contact.phone}
                  </a>
                  <a href={`mailto:${villa.contact.email}`} className="flex items-center gap-4 border border-gray-200 bg-white p-4 text-sm text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">
                    <Mail className="size-4 text-neutral-500" />
                    {villa.contact.email}
                  </a>
                  <a href={`https://${villa.contact.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border border-gray-200 bg-white p-4 text-sm text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">
                    <ExternalLink className="size-4 text-neutral-500" />
                    {villa.contact.facebook}
                  </a>
                  <a href={`https://instagram.com/${villa.contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border border-gray-200 bg-white p-4 text-sm text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">
                    <ExternalLink className="size-4 text-neutral-500" />
                    {villa.contact.instagram}
                  </a>
                </div>
              </div>

              <div className="border border-gray-200 bg-white p-7">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 size-5 shrink-0 text-neutral-500" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Address</p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-700">{villa.location}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <div className="sticky bottom-0 z-30 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-md md:hidden">
        <button
          onClick={() => onReserve(villa.id)}
          className="flex w-full items-center justify-center btn-navy py-3.5 text-xs font-medium uppercase tracking-[0.15em]"
        >
          Reserve the Villa
        </button>
      </div>
    </div>
  );
}
