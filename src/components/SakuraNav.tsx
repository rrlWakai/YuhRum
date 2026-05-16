import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import type { PageView } from '../App';

type Props = {
  page: PageView;
  onNavigate: (p: PageView) => void;
  onReserve: (villaId?: string) => void;
  villaName?: string;
};

const NAV_LINKS = [
  { label: 'Experience', href: 'section:experience' },
  { label: 'Villas', href: 'section:villas' },
  { label: 'Gallery', href: 'section:gallery' },
  { label: 'About', href: 'section:feel' },
];

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export function SakuraNav({ page, onNavigate, onReserve, villaName }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const isHome = page.type === 'home';
  const isDetail = page.type === 'detail';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!pendingSection || !isHome) return;
    const el = document.getElementById(pendingSection);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 350);
    setPendingSection(null);
  }, [pendingSection, isHome]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function handleNavClick(href: string) {
    setMenuOpen(false);
    if (href.startsWith('section:')) {
      const sectionId = href.replace('section:', '');
      if (isHome) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate({ type: 'home' });
        setPendingSection(sectionId);
      }
    }
  }

  const reserveVillaId = isDetail && page.type === 'detail' ? page.villaId : undefined;

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-400 ${
          scrolled || menuOpen || !isHome
            ? 'bg-petal/95 backdrop-blur-md border-b border-blush/30'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-12 lg:px-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="font-display text-2xl italic text-plum tracking-wide"
          >
            Yuhrum
            {isDetail && villaName && (
              <span className="ml-2 font-body not-italic text-xs text-shadow/60 tracking-widest">/ {villaName}</span>
            )}
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="group relative font-body text-[10px] uppercase tracking-[0.22em] text-shadow transition-colors hover:text-plum"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-blush transition-transform duration-300 group-hover:scale-x-100" />
              </button>
            ))}
            <button
              onClick={() => onReserve(reserveVillaId)}
              className="font-body text-[10px] uppercase tracking-[0.22em] text-petal bg-plum px-6 py-2.5 transition-all duration-300 hover:bg-shadow"
            >
              Reserve
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex md:hidden items-center justify-center text-plum"
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <X className="size-5" strokeWidth={1} />
              : <Menu className="size-5" strokeWidth={1} />
            }
          </button>
        </nav>
      </motion.header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease }}
            className="fixed inset-0 z-30 bg-petal flex flex-col items-start justify-center px-10"
          >
            <nav className="flex flex-col gap-8 w-full">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.07, ease }}
                  onClick={() => handleNavClick(link.href)}
                  className="font-display text-4xl italic text-plum text-left hover:text-shadow transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: NAV_LINKS.length * 0.07, ease }}
                onClick={() => { setMenuOpen(false); onReserve(reserveVillaId); }}
                className="mt-4 font-body text-[10px] uppercase tracking-[0.25em] text-petal bg-plum w-fit px-8 py-3"
              >
                Reserve the Villa
              </motion.button>
            </nav>
            <p className="absolute bottom-8 left-10 font-body text-[9px] uppercase tracking-[0.3em] text-shadow/50">
              Where stillness finds you.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
