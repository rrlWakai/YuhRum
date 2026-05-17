import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  CreditCard,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  Home,
  Clock,
  Sparkles,
} from "lucide-react";
import { villas } from "../data/villas";
import { supabase } from "../lib/supabase";

type BookingDetails = {
  id: string;
  guest_name: string;
  email: string;
  phone?: string;
  villa_id: string;
  stay_type: "dayStay" | "nightStay" | "overnight";
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
};

const STAY_LABELS: Record<string, { label: string; time: string }> = {
  dayStay: { label: "Day Stay", time: "9:00 AM – 2:00 PM" },
  nightStay: { label: "Night Stay", time: "3:00 PM – 8:00 PM" },
  overnight: { label: "Overnight", time: "9:00 PM – 7:00 AM (Next Day)" },
};

function formatPrice(n: number) {
  return `₱${n.toLocaleString()}`;
}

type SuccessPageProps = {
  bookingId: string;
  onReturnHome: () => void;
};

export function SuccessPage({ bookingId, onReturnHome }: SuccessPageProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        const { data, error: apiError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single();

        if (apiError) throw apiError;
        setBooking(data);
      } catch (err: any) {
        console.error("Error fetching booking details:", err);
        setError("Unable to load booking details, but your transaction went through!");
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const selectedVilla = booking
    ? villas.find((v) => v.id === booking.villa_id)
    : null;

  return (
    <div className="min-h-screen bg-petal text-plum flex flex-col items-center justify-center px-4 py-16 md:py-24 font-body relative overflow-hidden select-none">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blush/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-plum/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white/60 backdrop-blur-md border border-plum/10 rounded-2xl shadow-xl min-h-[450px]">
            <Loader2 className="size-12 animate-spin text-blush mb-4" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-plum/60">
              Retrieving Booking Details...
            </p>
          </div>
        ) : error || !booking ? (
          <div className="p-8 md:p-12 bg-white/70 backdrop-blur-md border border-plum/10 rounded-2xl shadow-xl text-center">
            <div className="mx-auto flex size-20 items-center justify-center bg-gold/10 text-gold mb-8 rounded-full border border-gold/20">
              <Sparkles className="size-8" />
            </div>
            <h1 className="font-display italic text-4xl text-plum mb-4">
              Thank You!
            </h1>
            <p className="text-sm leading-relaxed text-plum/70 mb-8 max-w-md mx-auto">
              Your payment has been successfully processed! We had a slight issue retrieving the live reservation summary, but your spot is locked. Please check your email for the confirmation voucher.
            </p>
            <button
              onClick={onReturnHome}
              className="bg-plum text-petal px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] transition-all hover:bg-shadow rounded-full inline-flex items-center gap-3 shadow-lg shadow-plum/20"
            >
              <Home className="size-4" /> Return to Sanctuary
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Header Success Section */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="mx-auto flex size-20 items-center justify-center bg-plum text-petal mb-8 rounded-full border-4 border-petal shadow-2xl shadow-plum/10 relative"
              >
                <Check className="size-8" strokeWidth={2.5} />
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full border border-plum/30"
                />
              </motion.div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blush mb-2">
                Booking Confirmed
              </p>
              <h1 className="font-display italic text-4xl md:text-5xl text-plum mb-3">
                Your Sanctuary Awaits
              </h1>
              <p className="text-xs tracking-widest text-plum/50 uppercase">
                Reference ID: <span className="font-semibold text-plum">{booking.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>

            {/* Main Details Card */}
            <div className="bg-white/80 backdrop-blur-md border border-plum/10 rounded-3xl overflow-hidden shadow-2xl shadow-plum/5">
              {/* Cover Image of selected villa */}
              {selectedVilla && (
                <div className="h-44 md:h-52 w-full overflow-hidden relative">
                  <img
                    src={selectedVilla.coverImage}
                    alt={selectedVilla.name}
                    className="w-full h-full object-cover brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6 md:left-8">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/70 mb-1">
                      Selected Escape
                    </p>
                    <h2 className="font-display italic text-2xl md:text-3xl text-white">
                      {selectedVilla.name}
                    </h2>
                  </div>
                </div>
              )}

              {/* Booking specifications */}
              <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-plum/10 pb-6 md:pb-8">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-plum/40 block mb-1">
                      Guest Name
                    </span>
                    <span className="text-xs font-semibold text-plum truncate block">
                      {booking.guest_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-plum/40 block mb-1">
                      Stay Package
                    </span>
                    <span className="text-xs font-semibold text-plum block">
                      {STAY_LABELS[booking.stay_type]?.label || booking.stay_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-plum/40 block mb-1">
                      Date
                    </span>
                    <span className="text-xs font-semibold text-plum block">
                      {booking.check_in}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-plum/40 block mb-1">
                      Guests
                    </span>
                    <span className="text-xs font-semibold text-plum block">
                      {booking.guests} Pax
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Detailed specs */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs text-plum/70">
                      <Clock className="size-4 text-plum/40 shrink-0" />
                      <span>{STAY_LABELS[booking.stay_type]?.time}</span>
                    </div>
                    {booking.phone && (
                      <div className="flex items-center gap-3 text-xs text-plum/70">
                        <Phone className="size-4 text-plum/40 shrink-0" />
                        <span>{booking.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-plum/70">
                      <Mail className="size-4 text-plum/40 shrink-0" />
                      <span className="truncate">{booking.email}</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-plum/5 p-5 rounded-2xl border border-plum/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-blush block">
                          Transaction Due
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-plum/40 mt-1 block">
                          Status: Paid via PayMongo
                        </span>
                      </div>
                      <CreditCard className="size-5 text-blush" />
                    </div>
                    <div className="flex justify-between items-end mt-4 border-t border-plum/10 pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-plum/60">
                        Total Amount
                      </span>
                      <span className="font-display italic text-2xl md:text-3xl text-plum leading-none">
                        {formatPrice(booking.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps / Helpful details */}
            <div className="bg-white/40 border border-plum/5 rounded-2xl p-6 md:p-8 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-plum/80 flex items-center gap-2">
                <Sparkles className="size-4 text-blush" /> What happens next?
              </h3>
              <ul className="space-y-3 text-xs text-plum/70 leading-relaxed list-none pl-0">
                <li className="flex gap-2">
                  <span className="text-blush font-bold">•</span>
                  <span>A payment confirmation receipt has been sent to <strong className="text-plum">{booking.email}</strong> along with your entry details.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blush font-bold">•</span>
                  <span>Our resort concierges will reach out to you via SMS/call at <strong className="text-plum">{booking.phone || "your contact number"}</strong> to coordinate check-in instructions.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blush font-bold">•</span>
                  <span>Please present a digital copy of your voucher and one valid ID upon arrival.</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onReturnHome}
                className="w-full sm:w-auto bg-plum text-petal px-10 py-4.5 text-[11px] font-bold uppercase tracking-[0.25em] transition-all hover:bg-shadow rounded-full inline-flex items-center justify-center gap-3 shadow-lg shadow-plum/20"
              >
                Explore Sanctuary <ArrowRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
