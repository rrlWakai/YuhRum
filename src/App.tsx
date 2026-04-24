import { useMemo, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ConciergeBell,
  Flame,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Phone,
  Sailboat,
  Send,
  Sparkles,
  Waves,
  X,
} from 'lucide-react';
import yuhrumLogo from './assets/yuhrumlogo.png';
import { AmenityCard } from './components/AmenityCard';
import { AdminPage } from './admin/AdminPage';
import { AnimatedText } from './components/AnimatedText';
import { CTAButton } from './components/CTAButton';
import { ParallaxSection } from './components/ParallaxSection';
import { Reveal } from './components/Reveal';
import { RoomCarousel } from './components/RoomCarousel';
import { Section } from './components/Section';
import { TestimonialCard } from './components/TestimonialCard';

const amenities = [
  {
    icon: Waves,
    title: 'Oceanfront Suites',
    text: 'Panoramic horizons, hand-finished interiors, and private terraces designed for still mornings.',
  },
  {
    icon: Flame,
    title: 'Sunset Dining',
    text: 'Chef-led tasting journeys curated around seasonal produce and candlelit coastal nights.',
  },
  {
    icon: Leaf,
    title: 'Restorative Wellness',
    text: 'Immersive spa rituals, volcanic stone therapies, and bespoke mindfulness experiences.',
  },
  {
    icon: Sailboat,
    title: 'Private Excursions',
    text: 'Sail at golden hour with dedicated hosts and tailored itineraries beyond the shoreline.',
  },
  {
    icon: ConciergeBell,
    title: 'Butler Service',
    text: 'Discreet personal care with curated arrivals, in-suite dining, and seamless every detail.',
  },
  {
    icon: Sparkles,
    title: 'Signature Evenings',
    text: 'Intimate performances and moonlit gatherings in spaces reserved only for resort guests.',
  },
];

const gallery = [
  'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1501117716987-c8e1ecb21076?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1602002418672-43121356dc46?auto=format&fit=crop&w=900&q=80',
 
];

const accommodations = [
  {
    name: 'Deluxe Room',
    category: 'Suites',
    description:
      'A quiet, sunlit retreat with tailored interiors and a private terrace for unhurried mornings.',
    features: '2 Guests · King Bed · Garden View · 45 sqm',
    price: 'From $780 / night',
    ctaLabel: 'View Details',
    image:
      'https://images.unsplash.com/photo-1615529162924-f8605388465d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Ocean Suite',
    category: 'Suites',
    description:
      'Floor-to-ceiling coastal views paired with a lounge made for intimate evenings and stillness.',
    features: '2 Guests · King Bed · Ocean View · 62 sqm',
    price: 'From $1,150 / night',
    ctaLabel: 'Book Now',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Private Villa',
    category: 'Villas',
    description:
      'A fully secluded residence with its own infinity pool, curated dining, and dedicated butler service.',
    features: '4 Guests · 2 Bedrooms · Private Pool · 128 sqm',
    price: 'From $2,480 / night',
    ctaLabel: 'View Details',
    image:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Family Suite',
    category: 'Family',
    description:
      'Spacious interconnected living with refined comfort, designed for shared moments and privacy alike.',
    features: '5 Guests · 2 Bedrooms · Partial Ocean View · 84 sqm',
    price: 'From $1,590 / night',
    ctaLabel: 'Book Now',
    image:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
  },
];

const testimonials = [
  {
    quote:
      'Every moment felt intentional, from arrival to departure. The atmosphere is quiet luxury without effort.',
    guest: 'Arielle M.',
    role: 'Private Client, Zurich',
  },
  {
    quote:
      'The level of detail is unmatched. It felt less like a hotel and more like stepping into a cinematic retreat.',
    guest: 'Daniel R.',
    role: 'Creative Director, London',
  },
  {
    quote:
      'A destination that balances calm, beauty, and service in a way very few places in the world can.',
    guest: 'Sofia L.',
    role: 'Founder, New York',
  },
];

const chatbotMessages = [
  { sender: 'assistant', text: 'Welcome to Yuhrum Resort. How can I tailor your stay today?' },
  { sender: 'user', text: 'I am planning a 4-night honeymoon escape.' },
  { sender: 'assistant', text: 'Perfect. I can curate oceanfront suites and private sunset rituals.' },
] as const;

function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminPage />;
  }

  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroBackgroundY = useTransform(scrollYProgress, [0, 0.35], [0, 40]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.35], [0, 80]);
  const aboutImageY = useTransform(scrollYProgress, [0.1, 0.35], [20, -20]);
  const finalBgY = useTransform(scrollYProgress, [0.58, 1], [30, -80]);
  const finalBgScale = useTransform(scrollYProgress, [0.58, 1], [1.15, 1]);
  const finalContentY = useTransform(scrollYProgress, [0.58, 1], [50, -10]);
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="relative bg-white text-neutral-900">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-6 md:px-10">
          <a href="#" className="flex items-center">
            <img src={yuhrumLogo} alt="Yuhrum Resort" className="h-10 w-auto object-contain" />
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
            <a href="#experience" className="transition-colors hover:text-neutral-950">Experience</a>
            <a href="#rooms" className="transition-colors hover:text-neutral-950">Rooms</a>
            <a href="#amenities" className="transition-colors hover:text-neutral-950">Amenities</a>
            <a href="#gallery" className="transition-colors hover:text-neutral-950">Gallery</a>
            <a href="#contact" className="transition-colors hover:text-neutral-950">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <CTAButton href="#final-cta" className="px-5 py-2 text-xs">
                Book Now
              </CTAButton>
            </div>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex size-10 items-center justify-center rounded-md border border-gray-200 text-neutral-700 transition-colors hover:bg-gray-50 md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-gray-200 bg-white md:hidden"
            >
              <div className="flex flex-col px-6 py-5 gap-1">
                {['experience', 'rooms', 'amenities', 'gallery', 'contact'].map((id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={() => setMenuOpen(false)}
                    className="py-3 text-sm font-medium capitalize text-gray-700 border-b border-gray-100 last:border-0 transition-colors hover:text-neutral-950"
                  >
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </a>
                ))}
                <div className="pt-4">
                  <CTAButton href="#final-cta" className="w-full justify-center" onClick={() => setMenuOpen(false)}>
                    Book Now
                  </CTAButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-neutral-900"
      />

      <section className="relative min-h-[100vh] border-b border-gray-200">
        <motion.div
          style={{ y: heroBackgroundY }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/60" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-6 pb-10 pt-32 sm:pt-40 md:pt-52 lg:pt-58 md:px-10 md:pb-12">
          <motion.div
            initial="hidden"
            animate="show"
            style={{ y: heroContentY }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">Yuhrum Resort</p>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.65, ease: 'easeInOut', delay: 0.2 }}
              className="mt-4 font-serif text-[2rem] leading-[1.05] text-white sm:text-5xl sm:leading-[0.96] md:text-6xl lg:text-7xl"
            >
              A sanctuary where every horizon is privately yours.
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 34 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.3 }}
              className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 md:mt-8 md:text-base lg:text-lg"
            >
              Enter an immersive coastline retreat crafted for those who value stillness, privacy,
              and effortless sophistication.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 34 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.4 }}
              className="mt-6 md:mt-9"
            >
              <CTAButton>Book Now</CTAButton>
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

      <Section id="experience" className="overflow-visible bg-white">
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
                alt="Resort suite interior"
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Editorial Stay</p>
              <p className="mt-3 font-serif text-2xl text-neutral-900">Architectural calm meets ocean ritual.</p>
            </motion.div>
          </Reveal>
          <Reveal delay={0.18} className="pt-2 sm:pt-6 lg:pt-20">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">The Yuhrum Narrative</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl lg:text-6xl">
              Curated moments,
              <br />
              naturally unfolding.
            </h2>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-gray-700 md:text-lg">
              Every touchpoint is designed to feel intuitive: coastal architecture, bespoke itineraries,
              and spaces that invite deep rest. Yuhrum is less a destination and more a private sequence
              of intentional experiences.
            </p>
            <div className="mt-10 border-l border-gray-300 pl-6">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Signature Detail</p>
              <p className="mt-3 text-sm text-gray-700">Sunrise tea ritual, private cove access, and dedicated hosts.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <ParallaxSection
        id="rooms"
        image="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1900&q=80"
        imageAlt="Coastal resort exterior at golden hour"
        className="border-y border-gray-200"
      >
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <Reveal delay={0.05} className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/90">Accommodation</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-black sm:text-4xl md:text-5xl lg:text-6xl">
              Rooms designed as private chapters.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-700/85 md:text-lg">
              Discover suites and residences with immersive views, intentional proportions, and refined
              details. Swipe horizontally to explore each room story.
            </p>
          </Reveal>
        </div>
        <div className="mt-14">
          <RoomCarousel rooms={accommodations} />
        </div>
      
      </ParallaxSection>

      <Section id="amenities" className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-[1240px] items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal delay={0.06} className="lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Signature Amenities</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl">
              Crafted details with purposeful restraint.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-700">
              Each amenity is composed to extend the emotional rhythm of your stay, balancing quiet luxury
              with meaningful experiences.
            </p>
          </Reveal>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="grid gap-4 sm:grid-cols-2 md:gap-6"
          >
            {amenities.map((amenity) => (
              <motion.div
                key={amenity.title}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <AmenityCard {...amenity} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section id="gallery" className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-[1240px]">
          <Reveal delay={0.05} className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Gallery</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl md:text-5xl lg:text-6xl">
              A visual passage through Yuhrum.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-gray-700 md:text-lg">
              An architectural rhythm of ocean, texture, and light.
            </p>
          </Reveal>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="mt-8 grid grid-cols-1 gap-3 md:mt-14 md:grid-cols-12 md:gap-5"
          >
            {gallery.map((image, index) => (
              <motion.figure
                key={image}
                variants={{
                  hidden: { opacity: 0, scale: 0.96, y: 20 },
                  show: { opacity: 1, scale: 1, y: 0 },
                }}
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
                  alt="Yuhrum resort gallery"
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
        </div>
      </Section>

      <Section className="border-t border-gray-200 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto -mb-8 max-w-[1240px] overflow-visible border border-gray-200 bg-white p-7 sm:-mb-12 md:-mb-20 md:p-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">Limited Release</p>
          <h3 className="mt-3 font-serif text-2xl leading-tight text-neutral-950 sm:text-3xl md:text-5xl">
            Reserve four nights, receive a private sunset voyage and spa ritual for two.
          </h3>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-700">
            Created for discerning travelers during the solstice season. Availability is curated
            and intentionally limited.
          </p>
          <div className="mt-9">
            <CTAButton href="#final-cta">
              Claim Offer
            </CTAButton>
          </div>
        </motion.div>
      </Section>

      <Section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-[1240px]">
          <AnimatedText
            align="center"
            title="Voices of Our Guests"
            description="A discreet collection of impressions from travelers who made Yuhrum part of their story."
          />
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } },
            }}
            className="mt-12 -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:-mx-10 md:gap-6 md:px-10"
          >
            {testimonials.map((item) => (
              <motion.div
                key={item.guest}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
                className="snap-center"
              >
                <TestimonialCard {...item} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section id="final-cta" className="relative min-h-[80vh] border-t border-gray-200 bg-white">
        <motion.div
          style={{ y: finalBgY, scale: finalBgScale }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/75" />
        </motion.div>
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
            Yuhrum Resort
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.45 }}
            className="mt-4 max-w-4xl font-serif text-3xl leading-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)] sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Your private chapter begins now.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.75, ease: 'easeInOut', delay: 0.58 }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] md:text-lg"
          >
            Choose stillness. Choose intention. Choose Yuhrum Resort. Limited availability this
            season.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.7 }}
            className="mt-10"
          >
            <CTAButton large className="border-white bg-black text-neutral-950 hover:bg-neutral-50">
              Book Now
            </CTAButton>
          </motion.div>
        </motion.div>
      </Section>

      <Section id="contact" className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-2 md:gap-12">
          <AnimatedText
            title="Contact Yuhrum Concierge"
            description="Tell us your travel dates and preferences. We will curate an itinerary designed around your pace, privacy, and purpose."
          />
          <motion.form
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="rounded-md border border-gray-200 bg-white p-7 md:p-9"
          >
            <div className="grid gap-4">
              <input
                className="rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-colors duration-300 focus:border-neutral-900"
                placeholder="Full Name"
              />
              <input
                className="rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-colors duration-300 focus:border-neutral-900"
                placeholder="Email Address"
              />
              <textarea
                className="min-h-32 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-colors duration-300 focus:border-neutral-900"
                placeholder="Tell us about your ideal stay"
              />
            </div>
            <div className="mt-6">
              <CTAButton href="#final-cta" className="w-full justify-center">
                Send Inquiry
              </CTAButton>
            </div>
          </motion.form>
        </div>
      </Section>

      <Section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-[1240px]">
          <AnimatedText
            align="center"
            title="Find Yuhrum Resort"
            description="Nestled on a secluded coastline, moments away from marine sanctuaries and private coves."
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="relative mt-12 overflow-hidden rounded-md border border-gray-200"
          >
            <iframe
              title="Yuhrum Resort Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=115.098%2C-8.876%2C115.296%2C-8.69&layer=mapnik"
              className="h-56 w-full border-0 sm:h-72 md:h-[390px]"
              loading="lazy"
            />
            <div className="absolute left-6 top-6 rounded-md border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-600">Resort Address</p>
              <p className="mt-2 text-sm text-neutral-700">Nusa Coastline, Bali, Indonesia</p>
            </div>
          </motion.div>
        </div>
      </Section>

      <footer className="border-t border-gray-200 bg-white px-6 py-10 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[1240px] gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
          <div>
            <p className="font-serif text-3xl text-neutral-900">Yuhrum</p>
            <p className="mt-3 text-sm text-neutral-600">Crafted coastal stays for intentional travelers.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Explore</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li>Suites</li>
              <li>Experiences</li>
              <li>Wellness</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li className="flex items-center gap-2">
                <Phone className="size-4" /> +62 411 882 701
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" /> concierge@velora.reserve
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4" /> Bali, Indonesia
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Hours</p>
            <p className="mt-3 text-sm text-neutral-700">Always available via private concierge assistant.</p>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-[1240px] border-t border-gray-200 pt-6 text-xs text-neutral-500">
          © {year} Yuhrum Resort. All rights reserved.
        </p>
      </footer>

      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        {chatOpen ? (
          <motion.aside
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-[calc(100vw-3rem)] max-w-[320px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm sm:max-w-[360px]"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white overflow-hidden">
                  <img src={yuhrumLogo} alt="Yuhrum" className="h-full w-full object-contain p-0.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Yuhrum Assistant</p>
                  <p className="text-xs text-neutral-500">Online</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="rounded-md p-1 text-neutral-500 hover:bg-gray-100"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3 px-4 py-4">
              {chatbotMessages.map((msg) => (
                <motion.div
                  key={msg.text}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.sender === 'assistant'
                      ? 'bg-gray-100 text-neutral-700'
                      : 'ml-auto bg-gray-200 text-neutral-800'
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              <div className="flex items-center gap-1 px-1">
                <span className="size-1.5 animate-pulse rounded-full bg-neutral-400" />
                <span className="size-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms]" />
              </div>
            </div>
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask about suites, dining, or offers..."
                  className="w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-500"
                />
                <button
                  className="rounded-md bg-neutral-900 p-2 text-white transition-transform duration-300 hover:scale-105"
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        ) : null}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setChatOpen((value) => !value)}
          className="ml-auto mt-4 flex size-14 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden"
          aria-label="Toggle chat assistant"
        >
          <img src={yuhrumLogo} alt="Yuhrum" className="h-10 w-10 object-contain" />
        </motion.button>
      </div>
    </main>
  );
}

export default App;
