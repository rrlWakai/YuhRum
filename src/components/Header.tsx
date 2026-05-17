import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';

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
        // A slight timeout ensures the mobile menu drawer collapse animation
        // doesn't interrupt or cancel the smooth scroll operation.
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } else {
        onNavigate({ type: 'home' });
        setPendingSection(sectionId);
      }
    }
  }

  const reserveVillaId = isDetail && page.type === 'detail' ? page.villaId : undefined;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-blush/30 bg-blush/95 backdrop-blur-md shadow-sm font-body">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-12 lg:px-20">
        <div className="flex items-center gap-4">
          {!isHome && (
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="flex size-9 items-center justify-center border border-plum/10 text-plum hover:bg-plum/5 transition-colors mr-1"
              aria-label="Back"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <button onClick={() => onNavigate({ type: 'home' })} className="flex items-center gap-2">
        <span className="font-display text-xl italic text-plum tracking-wide ml-1">Yuhrum</span>
          </button>
          {isDetail && villaName && (
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-plum/60 md:inline">
              <span className="mx-3 opacity-30">/</span>
              {villaName}
            </span>
          )}
        </div>

        <div className="hidden items-center gap-8 text-[10px] font-medium uppercase tracking-[0.2em] text-plum md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onReserve(reserveVillaId)}
            className="hidden bg-plum text-petal px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-all hover:bg-shadow md:flex items-center"
          >
            Reserve
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-10 items-center justify-center border border-plum/10 text-plum transition-colors hover:bg-plum/5 md:hidden"
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-plum/10 bg-blush md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="py-4 text-left text-sm font-medium text-plum border-b border-plum/5 last:border-0 transition-colors hover:text-white"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4">
                <button
                  onClick={() => { setMenuOpen(false); onReserve(reserveVillaId); }}
                  className="bg-plum text-petal w-full py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-shadow transition-all"
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
