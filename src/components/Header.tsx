import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import yuhrumLogo from '../assets/yuhrumlogo.png';
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
  { label: 'Amenities', href: 'section:amenities' },
  { label: 'Gallery', href: 'section:gallery' },
];

export function Header({ page, onNavigate, onReserve, villaName }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const isHome = page.type === 'home';
  const isDetail = page.type === 'detail';

  useEffect(() => {
    if (!pendingSection || !isHome) return;
    const el = document.getElementById(pendingSection);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 350);
    setPendingSection(null);
  }, [pendingSection, isHome]);

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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm">
      <nav className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-5 md:px-10">
        <div className="flex items-center gap-3">
          {!isHome && (
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="flex size-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors mr-1"
              aria-label="Back"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <button onClick={() => onNavigate({ type: 'home' })} className="flex items-center gap-2">
            <img src={yuhrumLogo} alt="Yuhrum Villas" className="h-9 w-auto object-contain" />
          </button>
          {isDetail && villaName && (
            <span className="hidden text-sm text-gray-400 md:inline">
              <span className="mx-2 text-gray-300">/</span>
              <span className="font-medium text-neutral-700">{villaName}</span>
            </span>
          )}
        </div>

        <div className="hidden items-center gap-7 text-sm font-medium text-gray-600 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="transition-colors hover:text-neutral-950"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onReserve(reserveVillaId)}
            className="hidden btn-navy px-6 py-2.5 text-xs font-medium uppercase tracking-[0.15em] md:flex items-center"
          >
            Reserve the Villa
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-xl border border-gray-200 text-neutral-700 transition-colors hover:bg-gray-50 md:hidden"
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
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-100 bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-100 last:border-0 transition-colors hover:text-neutral-950"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3">
                <button
                  onClick={() => { setMenuOpen(false); onReserve(reserveVillaId); }}
                  className="btn-navy w-full py-3.5 text-xs font-medium uppercase tracking-[0.15em]"
                >
                  Reserve the Villa
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
