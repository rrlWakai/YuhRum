import { lazy, Suspense, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookingModal } from '@/components/BookingModal';
import { SuccessPage } from '@/pages/SuccessPage';
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
const Loader = lazy(() => import('@/components/Loader').then((m) => ({ default: m.Loader })));
const Chatbot = lazy(() => import('@/components/Chatbot').then((m) => ({ default: m.Chatbot })));

export type PageView =
  | { type: 'home' }
  | { type: 'detail'; villaId: string }
  | { type: 'gallery'; villaId: string };

function AppContent() {
  const [page, setPage] = useState<PageView>({ type: 'home' });
  const [bookingVillaId, setBookingVillaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSuccessRef, setPaymentSuccessRef] = useState<string | null>(null);
  const [showCancelledToast, setShowCancelledToast] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const ref = params.get('ref');

    if (paymentStatus === 'success' && ref) {
      setPaymentSuccessRef(ref);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      setShowCancelledToast(true);
      window.history.replaceState({}, '', window.location.pathname);
      const timer = setTimeout(() => setShowCancelledToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleReturnHome() {
    setPaymentSuccessRef(null);
    setPage({ type: 'home' });
  }

  if (paymentSuccessRef) {
    return (
      <SuccessPage
        bookingId={paymentSuccessRef}
        onReturnHome={handleReturnHome}
      />
    );
  }

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

      {showCancelledToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] border border-plum/20 bg-petal/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-2xl text-xs font-semibold uppercase tracking-widest text-plum flex items-center gap-3">
          <span className="size-2 rounded-full bg-blush animate-pulse" />
          Reservation cancelled. Your spot is still available.
        </div>
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
