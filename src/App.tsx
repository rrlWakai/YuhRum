import { lazy, Suspense, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookingModal } from '@/components/BookingModal';
import { Header } from '@/components/Header';
import { CustomCursor } from '@/components/CustomCursor';
import { villas } from '@/data/villas';
import { AuthProvider } from '@/hooks/useAuth';
import { AdminRoute } from '@/routes/AdminRoute';
import { AdminLoginForm } from '@/admin/AdminLoginForm';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const VillaDetailPage = lazy(() => import('@/pages/VillaDetailPage').then((m) => ({ default: m.VillaDetailPage })));
const GalleryPage = lazy(() => import('@/pages/GalleryPage').then((m) => ({ default: m.GalleryPage })));
const AdminPage = lazy(() => import('@/admin/AdminPage').then((m) => ({ default: m.AdminPage })));
const Chatbot = lazy(() => import('@/components/Chatbot').then((m) => ({ default: m.Chatbot })));
const Loader = lazy(() => import('@/components/Loader').then((m) => ({ default: m.Loader })));

export type PageView =
  | { type: 'home' }
  | { type: 'detail'; villaId: string }
  | { type: 'gallery'; villaId: string };

function AppContent() {
  const [page, setPage] = useState<PageView>({ type: 'home' });
  const [bookingVillaId, setBookingVillaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  if (window.location.pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-bg" />}>
        <AdminRoute unauthenticated={<AdminLoginForm />}>
          <AdminPage />
        </AdminRoute>
      </Suspense>
    );
  }

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
      {isLoading && (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
          <Loader onComplete={() => setIsLoading(false)} />
        </Suspense>
      )}

      <CustomCursor />

      <Header
        page={page}
        onNavigate={navigate}
        onReserve={openBooking}
        villaName={currentVillaName}
      />

      <AnimatePresence mode="wait">
        {page.type === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <Suspense fallback={<div className="min-h-screen bg-bg" />}>
              <HomePage onNavigate={navigate} onReserve={openBooking} />
            </Suspense>
          </motion.div>
        )}

        {page.type === 'detail' && (
          <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <Suspense fallback={<div className="min-h-screen bg-bg" />}>
              <VillaDetailPage
                villaId={page.villaId}
                onNavigate={navigate}
                onReserve={openBooking}
              />
            </Suspense>
          </motion.div>
        )}

        {page.type === 'gallery' && (
          <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <Suspense fallback={<div className="min-h-screen bg-bg" />}>
              <GalleryPage villaId={page.villaId} onNavigate={navigate} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {bookingVillaId && (
        <BookingModal villaId={bookingVillaId} onClose={closeBooking} />
      )}

      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
