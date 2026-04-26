import { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ConciergeBell,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Users,
  Waves,
  Wifi,
} from 'lucide-react';
import yuhrumLogo from '../assets/yuhrumlogo.png';
import { AmenityCard } from '../components/AmenityCard';
import { AnimatedText } from '../components/AnimatedText';
import { CTAButton } from '../components/CTAButton';
import { ParallaxSection } from '../components/ParallaxSection';
import { Reveal } from '../components/Reveal';
import { RoomCarousel } from '../components/RoomCarousel';
import { Section } from '../components/Section';
import { TestimonialCard } from '../components/TestimonialCard';
import { villas } from '../data/villas';
import type { PageView } from '../App';

type Props = {
  onNavigate: (p: PageView) => void;
  onReserve: (villaId: string) => void;
};

const amenities = [
  {
    icon: Waves,
    title: 'Private Pool',
    text: 'Your own pool — day or night. No scheduling, no sharing. Exclusive to your group.',
  },
  {
    icon: Users,
    title: 'Groups Up to 20',
    text: 'Both villas accommodate large groups — perfect for family trips and private events.',
  },
  {
    icon: ConciergeBell,
    title: 'On-Site Caretaker',
    text: 'A dedicated caretaker is on standby throughout your stay for anything you need.',
  },
  {
    icon: Sparkles,
    title: 'Events Ready',
    text: 'Indoor and outdoor spaces designed for birthdays, reunions, and team building.',
  },
  {
    icon: Wifi,
    title: 'WiFi & Entertainment',
    text: 'High-speed WiFi and smart TV throughout both properties — indoors and out.',
  },
  {
    icon: ConciergeBell,
    title: 'Full Kitchen Access',
    text: 'Fully equipped kitchen for every villa — cook your own meals or bring a caterer.',
  },
];

const occasions = [
  { icon: Sparkles, title: 'Birthdays', desc: 'Celebrate with your whole barkada in a space that is entirely yours.' },
  { icon: Users, title: 'Family Gatherings', desc: 'Reunions, holidays, and real quality time — no strangers around.' },
  { icon: Waves, title: 'Barkada Trips', desc: 'The ultimate group getaway — swim, eat, chill, repeat.' },
  { icon: ConciergeBell, title: 'Team Building', desc: 'Productive and fun, away from the office environment.' },
];

const testimonials = [
  {
    quote: 'Best family trip we have had in years. The whole place was ours — no strangers, just pure quality time.',
    guest: 'The Reyes Family',
    role: 'Family of 8, Laguna',
  },
  {
    quote: "Booked Villa Serena for our friend's birthday and it was perfect. Pool, space, vibe — all 10/10.",
    guest: 'Marga S.',
    role: 'Barkada Group, Manila',
  },
  {
    quote: 'Our team building at Villa Verde was a total hit. Private, comfortable, and truly memorable.',
    guest: 'Carlo T.',
    role: 'Team Lead, Quezon City',
  },
];

const gallery = [
  'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1501117716987-c8e1ecb21076?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1602002418672-43121356dc46?auto=format&fit=crop&w=900&q=80',
];

export function HomePage({ onNavigate, onReserve }: Props) {
  const { scrollYProgress } = useScroll();
  const heroBackgroundY = useTransform(scrollYProgress, [0, 0.35], [0, 60]);
  const heroBackgroundScale = useTransform(scrollYProgress, [0, 0.35], [1.14, 1.0]);
  const heroGradientY = useTransform(scrollYProgress, [0, 0.35], [0, 28]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.35], [0, 80]);
  const aboutImageY = useTransform(scrollYProgress, [0.1, 0.35], [20, -20]);
  const finalBgY = useTransform(scrollYProgress, [0.58, 1], [30, -80]);
  const finalBgScale = useTransform(scrollYProgress, [0.58, 1], [1.18, 1.0]);
  const finalGradientY = useTransform(scrollYProgress, [0.58, 1], [14, -52]);
  const finalContentY = useTransform(scrollYProgress, [0.58, 1], [50, -10]);
  const year = useMemo(() => new Date().getFullYear(), []);

  const villaCards = villas.map((v) => ({
    name: v.name,
    category: 'Private Villa',
    features: `Up to ${v.capacity.max} Guests · Private Pool · Full Kitchen · Events Ready`,
    price: `From ₱${Math.min(
      v.rates.dayStay.weekday,
      v.rates.nightStay.weekday,
      v.rates.overnight.weekday,
    ).toLocaleString()} / stay`,
    ctaLabel: 'View Villa',
    image: v.coverImage,
  }));

  return (
    <main className="relative bg-[#F7F6F4] text-neutral-900">
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-neutral-900"
      />

      <section className="relative min-h-[100vh] overflow-hidden border-b border-gray-200">
        {/* Layer 1 — photo: drifts up + zooms out as you scroll */}
        <motion.div
          style={{ y: heroBackgroundY, scale: heroBackgroundScale }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center will-change-transform"
        />
        {/* Layer 2 — gradient: drifts at a slower rate, separating depth from the photo */}
        <motion.div
          style={{ y: heroGradientY }}
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/60 will-change-transform"
        />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-6 pb-10 pt-32 sm:pt-40 md:pt-52 md:px-10 md:pb-12">
          <motion.div
            initial="hidden"
            animate="show"
            style={{ y: heroContentY }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              100% Private Villa Rentals
            </p>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.65, ease: 'easeInOut', delay: 0.2 }}
              className="mt-4 font-serif text-[2rem] leading-[1.05] text-white sm:text-5xl sm:leading-[0.96] md:text-6xl lg:text-7xl"
            >
              Your Private Villa,<br />Your Entire Escape.
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 34 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.3 }}
              className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 md:mt-8 md:text-base lg:text-lg"
            >
              Book the entire property for your family, barkada, or private event.
              No shared spaces. No strangers. Just yours.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 34 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center gap-3 md:mt-9"
            >
              <CTAButton href="#villas">Check Availability</CTAButton>
              <a
                href="#villas"
                className="flex w-fit items-center justify-center rounded-md border border-white/60 px-8 py-3 text-sm font-medium uppercase tracking-[0.15em] text-white/90 transition-colors hover:bg-white/10"
              >
                View Villas
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 9, 0], opacity: [0.42, 1, 0.42] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-auto self-center flex items-center gap-3 pt-16 text-xs uppercase tracking-[0.25em] text-white/70 md:pt-24"
          >
            <span className="h-px w-10 bg-white/50" />
            Scroll to Discover
            <span className="h-px w-10 bg-white/50" />
          </motion.div>
        </div>
      </section>

      <Section id="experience" className="overflow-visible bg-[#F7F6F4]">
        <div className="mx-auto grid max-w-[1240px] items-start gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal delay={0.05} className="relative">
            <motion.div
              style={{ y: aboutImageY }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="relative h-64 overflow-hidden border border-gray-200 sm:h-80 md:h-[420px] lg:h-[560px]"
            >
              <img
                src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80"
                alt="Private villa interior"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-10 -right-6 z-20 hidden max-w-[15rem] border border-gray-200 bg-white p-5 sm:block md:max-w-xs md:p-6 lg:-right-12"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Private Stay</p>
              <p className="mt-3 font-serif text-2xl text-neutral-900">The entire villa is yours alone.</p>
            </motion.div>
          </Reveal>
          <Reveal delay={0.18} className="pt-2 sm:pt-6 lg:pt-20">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">About the Experience</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl lg:text-6xl">
              No sharing.
              <br />
              Just your people.
            </h2>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-gray-700 md:text-lg">
              When you book, you get the whole place — not just a room. No other guests,
              no shared spaces. Just you, your family, or your group enjoying a completely
              private villa from check-in to check-out.
            </p>
            <div className="mt-10 border-l border-gray-300 pl-6">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Our Promise</p>
              <p className="mt-3 text-sm text-gray-700">
                100% Private Villa — No Sharing with Other Guests
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <ParallaxSection
        id="villas"
        image="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1900&q=80"
        imageAlt="Private villa exterior"
        className="border-y border-gray-200"
      >
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <Reveal delay={0.05} className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
              Our Properties
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Two Villas. One Standard. 
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              Both properties are 100% private. Swipe to explore each villa and find the
              one that fits your group.
            </p>
          </Reveal>
        </div>
        <div className="mt-14">
          <RoomCarousel
            rooms={villaCards}
            onSelect={(i) => onNavigate({ type: 'detail', villaId: villas[i].id })}
          />
        </div>
       
      </ParallaxSection>

      <Section id="amenities" className="border-t border-gray-200 bg-[#F7F6F4]">
        <div className="mx-auto grid max-w-[1240px] items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal delay={0.06} className="lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">What's Included</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl">
              Everything you need for a perfect stay.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-700">
              Both villas come fully set up — so you can focus on enjoying your time,
              not worrying about what is missing.
            </p>
          </Reveal>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            className="grid gap-4 sm:grid-cols-2 md:gap-6"
          >
            {amenities.map((amenity) => (
              <motion.div
                key={amenity.title}
                variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <AmenityCard {...amenity} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section id="gallery" className="border-t border-gray-200 bg-[#F7F6F4]">
        <div className="mx-auto max-w-[1240px]">
          <Reveal delay={0.05} className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Gallery</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl lg:text-6xl">
              A glimpse of your private escape.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-gray-700 md:text-lg">
              See the spaces, the pool, and the vibe that awaits you.
            </p>
          </Reveal>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="mt-8 grid grid-cols-1 gap-3 md:mt-14 md:grid-cols-12 md:gap-5"
          >
            {gallery.map((image, index) => (
              <motion.figure
                key={image}
                variants={{ hidden: { opacity: 0, scale: 0.96, y: 20 }, show: { opacity: 1, scale: 1, y: 0 } }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative overflow-hidden border border-gray-200 ${
                  index === 0
                    ? 'md:col-span-7 md:row-span-2'
                    : index === 1
                      ? 'md:col-span-5'
                      : index === 2
                        ? 'md:col-span-5 md:-mt-16'
                        : index === 3
                          ? 'md:col-span-4'
                          : 'md:col-span-8'
                }`}
              >
                <motion.img
                  src={image}
                  alt="Villa gallery"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.55, ease: 'easeInOut' }}
                  className={`w-full object-cover ${
                    index === 0
                      ? 'h-52 sm:h-72 md:h-[28rem] lg:h-[34rem]'
                      : index === 2
                        ? 'h-40 sm:h-52 md:h-[20rem]'
                        : 'h-44 sm:h-56 md:h-72 lg:h-80'
                  }`}
                />
              </motion.figure>
            ))}
          </motion.div>
          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate({ type: 'gallery', villaId: villas[0].id })}
              className="inline-flex items-center gap-2 border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              View Full Gallery
            </button>
          </div>
        </div>
      </Section>

      <Section className="border-t border-gray-200 bg-[#F7F6F4]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[1240px] border border-gray-200 bg-white p-7 md:p-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">Villa Pricing</p>
          <h3 className="mt-3 font-serif text-2xl leading-tight text-neutral-950 sm:text-3xl md:text-5xl">
            Rates & Capacity
          </h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 md:gap-6">
            {[
              { label: 'Day Stay', sub: '8AM – 5PM', wkd: villas[0].rates.dayStay.weekday, wke: villas[0].rates.dayStay.weekend },
              { label: 'Night Stay', sub: '8PM – 5AM', wkd: villas[0].rates.nightStay.weekday, wke: villas[0].rates.nightStay.weekend },
              { label: 'Overnight', sub: '2PM – 12PM', wkd: villas[0].rates.overnight.weekday, wke: villas[0].rates.overnight.weekend },
            ].map((item) => (
              <div key={item.label} className="border border-gray-200 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{item.label}</p>
                <p className="mt-1 text-xs text-gray-400">{item.sub}</p>
                <p className="mt-3 font-serif text-2xl text-neutral-900">
                  ₱{item.wkd.toLocaleString()}{' '}
                  <span className="font-sans text-sm text-gray-500">weekday</span>
                </p>
                <p className="mt-1 font-serif text-xl text-neutral-700">
                  ₱{item.wke.toLocaleString()}{' '}
                  <span className="font-sans text-sm text-gray-500">weekend</span>
                </p>
                <p className="mt-2 text-xs text-gray-400">Up to 20 guests · +₱500/extra</p>
              </div>
            ))}
          </div>
          <div className="mt-9">
            <CTAButton onClick={() => onReserve(villas[0].id)}>Book the Villa</CTAButton>
          </div>
        </motion.div>
      </Section>

      <Section className="border-t border-gray-200 bg-[#F7F6F4]">
        <div className="mx-auto max-w-[1240px]">
          <Reveal delay={0.05}>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Occasions</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl">
              Perfect for Every Occasion
            </h2>
          </Reveal>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {occasions.map((item) => (
              <motion.div
                key={item.title}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="border border-gray-200 p-5"
              >
                <item.icon className="size-6 text-neutral-700" />
                <p className="mt-3 font-serif text-lg text-neutral-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-20">
            <AnimatedText
              align="center"
              title="What Our Guests Say"
              description="Real stories from families, barkada groups, and event hosts who made the villa their own."
            />
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
              className="mt-12 -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:-mx-10 md:gap-6 md:px-10"
            >
              {testimonials.map((item) => (
                <motion.div
                  key={item.guest}
                  variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.75, ease: 'easeInOut' }}
                  className="snap-center"
                >
                  <TestimonialCard {...item} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </Section>

      <Section id="final-cta" className="relative min-h-[80vh] border-t border-gray-200 bg-[#F7F6F4]">
        {/* Clipping wrapper keeps scaled/translated layers inside section bounds */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Layer 1 — photo: zoom out on scroll */}
          <motion.div
            style={{ y: finalBgY, scale: finalBgScale }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center will-change-transform"
          />
          {/* Layer 2 — gradient: drifts faster than the photo for parallax depth */}
          <motion.div
            style={{ y: finalGradientY }}
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/75 will-change-transform"
          />
        </div>
        <motion.div
          style={{ y: finalContentY }}
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.25 }}
          className="relative z-10 mx-auto flex min-h-[65vh] max-w-[1240px] flex-col items-center justify-center px-6 text-center md:px-10"
        >
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.7, ease: 'easeInOut', delay: 0.35 }}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-white/90"
          >
            Private Villa Rental
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.45 }}
            className="mt-4 max-w-4xl font-serif text-3xl leading-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)] sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Ready for your private escape?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.75, ease: 'easeInOut', delay: 0.58 }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] md:text-lg"
          >
            Book the entire villa for your group. Exclusive access, complete privacy,
            and memories that last.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.7 }}
            className="mt-10"
          >
            <CTAButton
              large
              className=""
              onClick={() => onReserve(villas[0].id)}
            >
              Reserve the Villa
            </CTAButton>
          </motion.div>
        </motion.div>
      </Section>

      <footer className="border-t border-gray-200 bg-[#F7F6F4] px-6 py-10 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[1240px] gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
          <div>
            <img src={yuhrumLogo} alt="Yuhrum Villas" className="h-10 w-auto object-contain" />
            <p className="mt-3 text-sm text-neutral-600">
              Your private villa escape — for families, barkada, and special occasions.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Properties</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {villas.map((v) => (
                <li key={v.id}>
                  <button
                    onClick={() => onNavigate({ type: 'detail', villaId: v.id })}
                    className="transition-colors hover:text-neutral-950"
                  >
                    {v.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate({ type: 'gallery', villaId: villas[0].id })}
                  className="transition-colors hover:text-neutral-950"
                >
                  Gallery
                </button>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li className="flex items-center gap-2">
                <Phone className="size-4" /> {villas[0].contact.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" /> {villas[0].contact.email}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4" /> {villas[0].location}
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Villa Availability</p>
            <p className="mt-3 text-sm text-neutral-700">
              We respond within the day. Message us to check your preferred dates.
            </p>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-[1240px] border-t border-gray-200 pt-6 text-xs text-neutral-500">
          © {year} Yuhrum Villas. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
