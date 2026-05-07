import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AdminPage } from './admin/AdminPage';
import { Header } from './components/Header';
import { BookingModal } from './components/BookingModal';
import { HomePage } from './pages/HomePage';
import { VillaDetailPage } from './pages/VillaDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { Chatbot } from './components/Chatbot';
import { Loader } from './components/Loader';
import { villas } from './data/villas';

export type PageView =
  | { type: 'home' }
  | { type: 'detail'; villaId: string }
  | { type: 'gallery'; villaId: string };

function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminPage />;
  }

  const [page, setPage] = useState<PageView>({ type: 'home' });
  const [bookingVillaId, setBookingVillaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function navigate(p: PageView) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openBooking(villaId?: string) {
    setBookingVillaId(villaId ?? villas[0].id);
  }

  function closeBooking() {
    setBookingVillaId(null);
  }

  const currentVillaName =
    page.type === 'detail' || page.type === 'gallery'
      ? villas.find((v) => v.id === page.villaId)?.name
      : undefined;

  return (
    <>
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
      <Header
        page={page}
        onNavigate={navigate}
        onReserve={openBooking}
        villaName={currentVillaName}
      />

      <AnimatePresence mode="wait">
        {page.type === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <HomePage onNavigate={navigate} onReserve={openBooking} />
          </motion.div>
        )}

        {page.type === 'detail' && (
          <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <VillaDetailPage
              villaId={page.villaId}
              onNavigate={navigate}
              onReserve={openBooking}
            />
          </motion.div>
        )}

        {page.type === 'gallery' && (
          <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <GalleryPage villaId={page.villaId} onNavigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {bookingVillaId && (
        <BookingModal villaId={bookingVillaId} onClose={closeBooking} />
      )}

      <Chatbot />
    </>
  );
}

export default App;
