import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Sunrise,
  CreditCard,
  Smartphone,
  Check,
  Shield,
  User,
  Phone,
  Mail,
  CalendarHeart,
  Users,
  Loader2,
  Home,
} from "lucide-react";
import { villas } from "../data/villas";
import { supabase } from "../lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { isWeekend, useAvailability } from "../lib/hooks";
import { toUserFacingError } from "../lib/api-errors";

type Props = {
  villaId: string | null;
  onClose: () => void;
};

type StayType = "dayStay" | "nightStay" | "overnight";

const STAY_LABELS: Record<
  StayType,
  { label: string; sub: string; Icon: React.ElementType }
> = {
  dayStay: { label: "Day Stay", sub: "8:00 AM – 5:00 PM", Icon: Sun },
  nightStay: { label: "Night Stay", sub: "8:00 PM – 5:00 AM", Icon: Moon },
  overnight: { label: "Overnight", sub: "2:00 PM – 12:00 PM", Icon: Sunrise },
};

const STEP_LABELS = ["Stay Details", "Guest Info", "Review & Pay"];

function formatPrice(n: number) {
  return `₱${n.toLocaleString()}`;
}

export function BookingModal({ villaId, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    selectedVillaId: villaId ?? villas[0].id,
    date: "",
    stayType: "overnight" as StayType,
    guests: 2,
    eventType: "",
    payMethod: "gcash" as "gcash" | "card",
    agree: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const { blockedDates, refetch } = useAvailability();

  const selectedVilla =
    villas.find((v) => v.id === form.selectedVillaId) ?? villas[0];
  const rate = selectedVilla.rates[form.stayType];
  const isWknd = isWeekend(form.date);
  const basePrice = form.date ? (isWknd ? rate.weekend : rate.weekday) : 0;
  const extraGuests = Math.max(0, form.guests - selectedVilla.capacity.base);
  const extraFee = extraGuests * 500;
  const total = basePrice + extraFee;

  function update<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  useEffect(() => {
    // When modal opens, pre-fetch latest availability
    refetch();
  }, []);

  useEffect(() => {
    // Keep guests within selected villa capacity when changing villa.
    if (form.guests > rate.capacity) {
      update("guests", rate.capacity);
    }
  }, [form.selectedVillaId]);

  function canProceed() {
    if (step === 1)
      return form.date && !blockedDates.get(form.date)?.has(form.stayType) && form.guests >= 1;
    if (step === 2)
      return form.name.trim() && form.contact.trim() && form.email.trim();
    if (step === 3) return form.agree;
    return true;
  }

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleNext() {
    setErrorMsg("");
    if (step === 1) {
      // Validate date again before proceeding
      setIsSubmitting(true);
      await refetch();
      if (blockedDates.get(form.date)?.has(form.stayType)) {
        setErrorMsg(
          "Sorry, this package was just booked by someone else for this date. Please select another date or package.",
        );
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }
    setStep((s) => s + 1);
  }

  async function handleCompleteBooking() {
    setIsSubmitting(true);
    setErrorMsg("");
    setToastMsg("");

    try {
      // Final availability check before inserting
      await refetch();
      if (blockedDates.get(form.date)?.has(form.stayType)) {
        throw new Error(
          "This date and package is no longer available. Please select another.",
        );
      }
      if (!isValidEmail(form.email)) {
        throw new Error("Please enter a valid email address.");
      }
      if (!Number.isFinite(total) || total <= 0) {
        throw new Error("Invalid booking total. Please review your booking details.");
      }

      const d = new Date(form.date);
      // DB enforces check_out > check_in; date-only stays still need next-day checkout date.
      d.setDate(d.getDate() + 1);
      const checkOutDate = d.toISOString().split("T")[0];

      const { data: bookingData, error } = await supabase
        .from("bookings")
        .insert([
          {
            guest_name: form.name,
            email: form.email,
            phone: form.contact,
            villa_id: form.selectedVillaId,
            stay_type: form.stayType,
            check_in: form.date,
            check_out: checkOutDate,
            guests: form.guests,
            total_price: total,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Invoke PayMongo Checkout Edge Function
      const { data: edgeData, error: edgeError } =
        await supabase.functions.invoke("create-paymongo-checkout", {
          body: {
            amount: total,
            description: `Booking for ${selectedVilla.name} (${STAY_LABELS[form.stayType].label})`,
            name: form.name,
            email: form.email,
            phone: form.contact,
            referenceNumber: bookingData.id,
          },
        });

      if (edgeError) {
        if (edgeError instanceof FunctionsHttpError) {
          try {
            const body = await edgeError.context.json();
            const message =
              body?.error?.message ||
              body?.message ||
              "Unable to create checkout session.";
            throw new Error(message);
          } catch {
            throw new Error("Unable to create checkout session.");
          }
        }
        throw edgeError;
      }
      if (edgeData?.error) {
        const providerMessage = typeof edgeData.error === "string" ? edgeData.error : edgeData.error?.message;
        throw new Error(providerMessage || "Unable to create checkout session.");
      }

      if (edgeData?.checkoutUrl) {
        window.location.href = edgeData.checkoutUrl;
        return;
      }

      setIsSuccess(true);
    } catch (err: any) {
      const parsed = toUserFacingError(err);
      setErrorMsg(parsed.message);
      setToastMsg(parsed.retryable ? "Payment session failed. Please retry." : "Please update the form and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Sticky Summary Component ---
  const SummaryContent = () => (
    <div className="flex flex-col h-full">
      <h3 className="font-serif text-2xl text-[#0A192F] mb-6 hidden md:block">
        Booking Summary
      </h3>

      <div className="flex-1 space-y-6">
        <div className="flex items-start gap-4">
          <img
            src={selectedVilla.coverImage}
            alt={selectedVilla.name}
            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
          />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Private Villa
            </p>
            <p className="font-serif text-lg text-[#0A192F]">
              {selectedVilla.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {STAY_LABELS[form.stayType].label}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-4 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Date</span>
            <span className="font-medium text-[#0A192F]">
              {form.date || "Not selected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Guests</span>
            <span className="font-medium text-[#0A192F]">
              {form.guests} pax
            </span>
          </div>
        </div>

        {form.date && (
          <div className="border-t border-gray-200 pt-6 space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>
                {STAY_LABELS[form.stayType].label} (
                {isWknd ? "Weekend" : "Weekday"})
              </span>
              <span>{formatPrice(basePrice)}</span>
            </div>
            {extraGuests > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Extra guests ({extraGuests} × ₱500)</span>
                <span>{formatPrice(extraFee)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-[#D1DEEA] pt-6">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
            Total Due
          </span>
          <span className="font-serif text-3xl text-[#0A192F]">
            {formatPrice(total)}
          </span>
        </div>
        <p className="text-xs text-gray-500 text-right">
          Includes all taxes and fees
        </p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 lg:p-10"
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full h-full md:h-[85vh] md:max-h-800px md:max-w-4xl lg:max-w-5xl bg-white md:rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {isSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-white">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#EBF5EF] text-[#3D6B52] mb-8 ring-8 ring-[#EBF5EF]/50">
                <Check className="size-10" />
              </div>
              <h2 className="font-serif text-4xl text-[#0A192F]">
                Booking Request Sent
              </h2>
              <p className="mt-4 max-w-sm text-gray-600 leading-relaxed">
                Your reservation request is confirmed. We've sent a detailed
                email with your itinerary and payment instructions.
              </p>
              <button
                onClick={onClose}
                className="mt-10 btn-navy px-10 py-4 text-xs font-semibold uppercase tracking-[0.15em]"
              >
                Return to Website
              </button>
            </div>
          ) : (
            <>
              {/* LEFT SIDE: Form Steps */}
              <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
                {toastMsg && (
                  <div className="absolute top-4 left-4 right-4 z-30">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-700 shadow-sm">
                      {toastMsg}
                    </div>
                  </div>
                )}
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white z-10 md:px-10 md:py-6 md:border-none">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A192F]/60">
                      Step {step} of {STEP_LABELS.length}
                    </p>
                    <p className="font-serif text-2xl text-[#0A192F] mt-1">
                      {STEP_LABELS[step - 1]}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex size-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="flex bg-gray-100 h-1 w-full">
                  {STEP_LABELS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 transition-colors duration-500 ${i + 1 <= step ? "bg-[#0A192F]" : "bg-transparent"}`}
                    />
                  ))}
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-5 py-6 md:px-10 md:py-8 pb-32 md:pb-8 scrollbar-hide relative">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                      >
                        <div>
                          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
                            1. Choose Villa
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-[#0A192F]/40">
                              <Home className="size-5" />
                            </div>
                            <select
                              value={form.selectedVillaId}
                              onChange={(e) =>
                                update("selectedVillaId", e.target.value)
                              }
                              className="w-full appearance-none rounded-xl border-2 border-gray-100 bg-white pl-14 pr-5 py-4 text-sm font-medium text-[#0A192F] outline-none transition-all focus:border-[#0A192F] focus:ring-4 focus:ring-[#0A192F]/10"
                            >
                              {villas.map((villa) => (
                                <option key={villa.id} value={villa.id}>
                                  {villa.name} (up to {villa.capacity.max}{" "}
                                  guests)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
                            2. Choose Your Package
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {(Object.keys(STAY_LABELS) as StayType[]).map(
                              (type) => {
                                const { label, sub, Icon } = STAY_LABELS[type];
                                const active = form.stayType === type;
                                return (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => update("stayType", type)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                      active
                                        ? "border-[#0A192F] bg-[#0A192F] text-white shadow-md"
                                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                    }`}
                                  >
                                    <Icon
                                      className={`size-5 mb-2 ${active ? "text-white" : "text-[#0A192F]"}`}
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                      {label}
                                    </span>
                                    <span
                                      className={`text-[9px] uppercase tracking-widest mt-1 ${active ? "text-white/70" : "text-gray-400"}`}
                                    >
                                      {sub}
                                    </span>
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
                            3. Select Date
                          </label>
                          {/* We use our premium Availability Calendar */}
                          <div className="bg-[#F7F6F4] p-1 rounded-2xl border border-gray-100">
                            <AvailabilityCalendar
                              mode="single"
                              stayType={form.stayType}
                              selectedDate={form.date}
                              onSelect={(d) => update("date", d)}
                            />
                          </div>
                          {form.date && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 text-[11px] font-medium uppercase tracking-widest text-[#3D6B52] flex items-center gap-1.5"
                            >
                              <Check className="size-3" /> Date selected.{" "}
                              {isWknd ? "Weekend" : "Weekday"} rate applies.
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
                            4. Guest Count
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-[#0A192F]/40">
                              <Users className="size-5" />
                            </div>
                            <input
                              type="number"
                              min={1}
                              max={rate.capacity}
                              value={form.guests}
                              onChange={(e) =>
                                update("guests", Number(e.target.value))
                              }
                              className="w-full rounded-xl border-2 border-gray-100 bg-white pl-14 pr-5 py-4 text-sm font-medium text-[#0A192F] outline-none transition-all focus:border-[#0A192F] focus:ring-4 focus:ring-[#0A192F]/10"
                            />
                          </div>
                          <p className="mt-2 text-[10px] uppercase tracking-widest text-gray-500">
                            Max {rate.capacity} guests. +₱500 per extra guest
                            after {selectedVilla.capacity.base}.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-[#0A192F]/40">
                              <User className="size-5" />
                            </div>
                            <input
                              value={form.name}
                              onChange={(e) => update("name", e.target.value)}
                              placeholder="Juan dela Cruz"
                              className="w-full rounded-xl border-2 border-gray-100 bg-white pl-14 pr-5 py-4 text-sm font-medium text-[#0A192F] outline-none transition-all focus:border-[#0A192F] focus:ring-4 focus:ring-[#0A192F]/10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
                            Contact Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-[#0A192F]/40">
                              <Phone className="size-5" />
                            </div>
                            <input
                              value={form.contact}
                              onChange={(e) =>
                                update("contact", e.target.value)
                              }
                              placeholder="+63 912 345 6789"
                              className="w-full rounded-xl border-2 border-gray-100 bg-white pl-14 pr-5 py-4 text-sm font-medium text-[#0A192F] outline-none transition-all focus:border-[#0A192F] focus:ring-4 focus:ring-[#0A192F]/10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-[#0A192F]/40">
                              <Mail className="size-5" />
                            </div>
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) => update("email", e.target.value)}
                              placeholder="juan@email.com"
                              className="w-full rounded-xl border-2 border-gray-100 bg-white pl-14 pr-5 py-4 text-sm font-medium text-[#0A192F] outline-none transition-all focus:border-[#0A192F] focus:ring-4 focus:ring-[#0A192F]/10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
                            Special Event? (Optional)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-[#0A192F]/40">
                              <CalendarHeart className="size-5" />
                            </div>
                            <input
                              value={form.eventType}
                              onChange={(e) =>
                                update("eventType", e.target.value)
                              }
                              placeholder="e.g. Birthday, Team Building..."
                              className="w-full rounded-xl border-2 border-gray-100 bg-white pl-14 pr-5 py-4 text-sm font-medium text-[#0A192F] outline-none transition-all focus:border-[#0A192F] focus:ring-4 focus:ring-[#0A192F]/10"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                      >
                        {/* Mobile Summary shows here since right panel is hidden */}
                        <div className="md:hidden">
                          <SummaryContent />
                        </div>

                        <div>
                          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]">
                            Payment Method
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            {(["gcash", "card"] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => update("payMethod", method)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                  form.payMethod === method
                                    ? "border-[#0A192F] bg-[#0A192F] text-white shadow-md"
                                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                }`}
                              >
                                {method === "gcash" ? (
                                  <Smartphone
                                    className={`size-6 mb-2 ${form.payMethod === method ? "text-white" : "text-[#0A192F]"}`}
                                  />
                                ) : (
                                  <CreditCard
                                    className={`size-6 mb-2 ${form.payMethod === method ? "text-white" : "text-[#0A192F]"}`}
                                  />
                                )}
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  {method === "gcash" ? "GCash" : "Visa / Card"}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <label className="flex cursor-pointer items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                          <input
                            type="checkbox"
                            checked={form.agree}
                            onChange={(e) => update("agree", e.target.checked)}
                            className="mt-1 size-5 rounded-md border-gray-300 accent-[#0A192F] focus:ring-[#0A192F]"
                          />
                          <span className="text-xs leading-relaxed text-gray-600">
                            I agree to the booking terms and cancellation
                            policy. I understand this is a reservation request
                            and requires confirmation before the payment is
                            fully settled.
                          </span>
                        </label>

                        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
                          <Shield className="size-4" /> Secure payment
                          processing powered by{" "}
                          <strong className="text-[#0A192F] font-bold">
                            PayMongo
                          </strong>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5 md:static md:p-6 md:border-none flex items-center justify-between z-20">
                  {step > 1 ? (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="flex items-center gap-2 rounded-xl bg-gray-50 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0A192F] hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="size-4" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <button
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                      className="flex items-center gap-2 rounded-xl bg-[#0A192F] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#0A192F]/20 hover:bg-[#0A192F]/90 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Continue"
                      )}{" "}
                      <ChevronRight className="size-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteBooking}
                      disabled={!canProceed() || isSubmitting}
                      className="flex items-center gap-2 rounded-xl bg-[#0A192F] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#0A192F]/20 hover:bg-[#0A192F]/90 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Confirm & Pay"
                      )}
                    </button>
                  )}
                </div>

                {errorMsg && (
                  <div className="absolute top-20 left-4 right-4 z-30">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600 shadow-md"
                    >
                      {errorMsg}
                    </motion.div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: Sticky Summary (Desktop Only) */}
              <div className="hidden md:block w-380px bg-[#F7F6F4] p-10 border-l border-gray-100">
                <SummaryContent />
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
