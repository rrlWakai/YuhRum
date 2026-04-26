import { useState } from 'react';
import { AdminPage } from './admin/AdminPage';
import { Header } from './components/Header';
import { BookingModal } from './components/BookingModal';
import { HomePage } from './pages/HomePage';
import { VillaDetailPage } from './pages/VillaDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { Chatbot } from './components/Chatbot';
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
      <Header
        page={page}
        onNavigate={navigate}
        onReserve={openBooking}
        villaName={currentVillaName}
      />

      {page.type === 'home' && (
        <HomePage onNavigate={navigate} onReserve={openBooking} />
      )}

      {page.type === 'detail' && (
        <VillaDetailPage
          villaId={page.villaId}
          onNavigate={navigate}
          onReserve={openBooking}
        />
      )}

      {page.type === 'gallery' && (
        <GalleryPage villaId={page.villaId} onNavigate={navigate} />
      )}

      {bookingVillaId && (
        <BookingModal villaId={bookingVillaId} onClose={closeBooking} />
      )}

      <Chatbot />
    </>
  );
}

export default App;
