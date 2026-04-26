import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Sun, Moon, Sunrise, 
  CreditCard, Smartphone, Check, Shield, User, Phone, 
  Mail, MapPin, Calendar, Users, CalendarHeart 
} from 'lucide-react';
import { villas } from '../data/villas';
import { supabase } from '../lib/supabase';

type Props = {
  villaId: string | null;
  onClose: () => void;
};

type StayType = 'dayStay' | 'nightStay' | 'overnight';

const STAY_LABELS: Record<StayType, { label: string; sub: string; Icon: React.ElementType }> = {
  dayStay: { label: 'Day Stay', sub: '8:00 AM – 5:00 PM', Icon: Sun },
  nightStay: { label: 'Night Stay', sub: '8:00 PM – 5:00 AM', Icon: Moon },
  overnight: { label: 'Overnight', sub: '2:00 PM – 12:00 PM', Icon: Sunrise },
};

const STEP_LABELS = ['Guest Details', 'Booking Info', 'Review', 'Payment'];

function formatPrice(n: number) {
  return `₱${n.toLocaleString()}`;
}

function isWeekend(dateStr: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr).getDay();
  return d === 0 || d === 6;
}

export function BookingModal({ villaId, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    selectedVillaId: villaId ?? villas[0].id,
    date: '',
    stayType: 'overnight' as StayType,
    guests: 2,
    eventType: '',
    notes: '',
    payMethod: 'gcash' as 'gcash' | 'card',
    agree: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedVilla = villas.find((v) => v.id === form.selectedVillaId) ?? villas[0];
  const rate = selectedVilla.rates[form.stayType];
  const isWknd = isWeekend(form.date);
  const price = isWknd ? rate.weekend : rate.weekday;
  const extraGuests = Math.max(0, form.guests - selectedVilla.capacity.base);
  const extraFee = extraGuests * 500;
  const total = price + extraFee;

  function update<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function canProceed() {
    if (step === 1) return form.name.trim() && form.contact.trim() && form.email.trim();
    if (step === 2) return form.date && form.guests >= 1;
    if (step === 3) return form.agree;
    return true;
  }

  async function handleCompleteBooking() {
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const d = new Date(form.date);
      if (form.stayType === 'overnight') {
        d.setDate(d.getDate() + 1);
      }
      const checkOutDate = d.toISOString().split('T')[0];

      const { data: bookingData, error } = await supabase.from('bookings').insert([{
        guest_name: form.name,
        email: form.email,
        phone: form.contact,
        check_in: form.date,
        check_out: checkOutDate,
        guests: form.guests,
        total_price: total,
        status: 'pending'
      }]).select().single();

      if (error) throw error;

      // Invoke PayMongo Checkout Edge Function
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-paymongo-checkout', {
        body: {
          amount: total,
          description: `Booking for ${selectedVilla.name}`,
          name: form.name,
          email: form.email,
          phone: form.contact,
          referenceNumber: bookingData.id,
        },
      });

      if (edgeError) throw edgeError;
      if (edgeData?.error) throw new Error(edgeData.error);

      // Redirect to PayMongo Hosted Checkout Page
      if (edgeData?.checkoutUrl) {
        window.location.href = edgeData.checkoutUrl;
        return;
      }
      
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-lg bg-white border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {isSuccess ? (
            <div className="px-7 py-16 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#0A192F] text-white mb-6">
                <Check className="size-8" />
              </div>
              <h2 className="font-serif text-3xl text-neutral-950">Booking Requested!</h2>
              <p className="mt-4 text-sm text-gray-600">
                Your reservation request has been submitted. We will review it and send an email confirmation shortly.
              </p>
              <button onClick={onClose} className="mt-8 btn-navy px-8 py-3 text-xs font-medium uppercase tracking-[0.15em]">
                Close Window
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-7 py-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                Step {step} of {STEP_LABELS.length}
              </p>
              <p className="mt-1 font-serif text-2xl text-neutral-950">{STEP_LABELS[step - 1]}</p>
            </div>
            <button
              onClick={onClose}
              className="flex size-10 items-center justify-center border border-gray-200 text-neutral-500 hover:bg-neutral-950 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex bg-gray-100">
            {STEP_LABELS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 transition-colors duration-500 ${
                  i + 1 <= step ? 'bg-[#0A192F]' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Body */}
          <div className="max-h-[65vh] overflow-y-auto px-7 py-8 scrollbar-hide">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <User className="size-4" />
                      </div>
                      <input
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="Juan dela Cruz"
                        className="w-full border border-gray-200 bg-white pl-11 pr-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F]/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Contact Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <Phone className="size-4" />
                      </div>
                      <input
                        value={form.contact}
                        onChange={(e) => update('contact', e.target.value)}
                        placeholder="+63 912 345 6789"
                        className="w-full border border-gray-200 bg-white pl-11 pr-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F]/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <Mail className="size-4" />
                      </div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="juan@email.com"
                        className="w-full border border-gray-200 bg-white pl-11 pr-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F]/10"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Select Villa</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <MapPin className="size-4" />
                      </div>
                      <select
                        value={form.selectedVillaId}
                        onChange={(e) => update('selectedVillaId', e.target.value)}
                        className="w-full appearance-none border border-gray-200 bg-white pl-11 pr-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F]/10"
                      >
                        {villas.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Stay Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(Object.keys(STAY_LABELS) as StayType[]).map((type) => {
                        const { label, sub, Icon } = STAY_LABELS[type];
                        const active = form.stayType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => update('stayType', type)}
                            className={`flex flex-col items-center gap-2 border p-4 text-center transition-all duration-200 ${
                              active
                                ? 'border-[#0A192F] bg-[#F0F4F8] text-[#0A192F]'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="size-5" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-60">{sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <Calendar className="size-4" />
                      </div>
                      <input
                        type="date"
                        value={form.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => update('date', e.target.value)}
                        className="w-full border border-gray-200 bg-white pl-11 pr-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F]/10"
                      />
                    </div>
                    {form.date && (
                      <p className="mt-2 text-[10px] uppercase tracking-widest text-gray-500">
                        {isWknd ? 'Weekend rate applies' : 'Weekday rate applies'}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-gray-600">
                        Guests (Max {rate.capacity})
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                          <Users className="size-4" />
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={rate.capacity}
                          value={form.guests}
                          onChange={(e) => update('guests', Number(e.target.value))}
                          className="w-full border border-gray-200 bg-white pl-11 pr-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-gray-600">Event (Optional)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                          <CalendarHeart className="size-4" />
                        </div>
                        <input
                          value={form.eventType}
                          onChange={(e) => update('eventType', e.target.value)}
                          placeholder="Birthday..."
                          className="w-full border border-gray-200 bg-white pl-11 pr-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F]"
                        />
                      </div>
                    </div>
                  </div>

                  {form.date && (
                    <div className="border border-[#D1DEEA] bg-[#F0F4F8] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A192F]">Price Summary</p>
                      <div className="mt-4 space-y-2 text-sm text-[#0A192F]">
                        <div className="flex justify-between">
                          <span>{STAY_LABELS[form.stayType].label} ({isWknd ? 'Weekend' : 'Weekday'})</span>
                          <span className="font-medium">{formatPrice(price)}</span>
                        </div>
                        {extraGuests > 0 && (
                          <div className="flex justify-between">
                            <span>Extra guests ({extraGuests} × ₱500)</span>
                            <span className="font-medium">{formatPrice(extraFee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-[#D1DEEA] pt-3 font-serif text-lg">
                          <span>Total</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="border border-gray-200 bg-[#F7F6F4] p-6 space-y-5">
                    <div className="flex items-start justify-between border-b border-gray-200 pb-5">
                      <div>
                        <p className="font-serif text-2xl text-neutral-950">{selectedVilla.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-widest text-gray-500">{selectedVilla.location}</p>
                      </div>
                      <span className="border border-[#D1DEEA] bg-[#F0F4F8] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#0A192F]">
                        {STAY_LABELS[form.stayType].label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Guest</p>
                        <p className="mt-1 font-medium text-neutral-900">{form.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Contact</p>
                        <p className="mt-1 font-medium text-neutral-900">{form.contact}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Date</p>
                        <p className="mt-1 font-medium text-neutral-900">{form.date || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Guests</p>
                        <p className="mt-1 font-medium text-neutral-900">{form.guests} pax</p>
                      </div>
                      {form.eventType && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Event</p>
                          <p className="mt-1 font-medium text-neutral-900">{form.eventType}</p>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-5 flex items-end justify-between">
                      <p className="text-xs uppercase tracking-[0.15em] text-gray-500">Total Amount</p>
                      <p className="font-serif text-3xl text-neutral-950">{formatPrice(total)}</p>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-4 p-2">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={(e) => update('agree', e.target.checked)}
                      className="mt-1 size-4 rounded-none border-gray-300 accent-[#0A192F] focus:ring-[#0A192F]"
                    />
                    <span className="text-xs leading-relaxed text-gray-600">
                      I agree to the booking terms and cancellation policy. I understand this is a reservation request and requires confirmation.
                    </span>
                  </label>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="border border-[#D1DEEA] bg-[#F0F4F8] p-6 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#0A192F]">Amount Due</p>
                    <p className="font-serif text-3xl text-[#0A192F]">{formatPrice(total)}</p>
                  </div>

                  <div>
                    <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-gray-600">Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                      {(['gcash', 'card'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => update('payMethod', method)}
                          className={`flex items-center justify-center gap-3 border p-4 transition-all duration-200 ${
                            form.payMethod === method
                              ? 'border-[#0A192F] bg-[#0A192F] text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {method === 'gcash' ? (
                            <Smartphone className="size-5" />
                          ) : (
                            <CreditCard className="size-5" />
                          )}
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            {method === 'gcash' ? 'GCash' : 'Visa / Card'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.payMethod === 'gcash' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">GCash Number</label>
                        <input
                          placeholder="09XX XXX XXXX"
                          className="w-full border border-gray-200 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F]"
                        />
                      </div>
                      <div className="border border-dashed border-gray-300 bg-[#F7F6F4] p-8 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500">QR Code will appear here upon confirmation</p>
                        <div className="mx-auto mt-4 size-24 border border-gray-200 bg-white flex items-center justify-center text-gray-300 text-xs">QR</div>
                      </div>
                    </motion.div>
                  )}

                  {form.payMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Card Number</label>
                        <input
                          placeholder="0000 0000 0000 0000"
                          className="w-full border border-gray-200 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F]"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Cardholder Name</label>
                        <input
                          placeholder="JUAN DELA CRUZ"
                          className="w-full border border-gray-200 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Expiry</label>
                          <input
                            placeholder="MM / YY"
                            className="w-full border border-gray-200 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F]"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">CVV</label>
                          <input
                            placeholder="•••"
                            className="w-full border border-gray-200 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#0A192F]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                    <Shield className="size-3.5" />
                    <span>Secure payment powered by <strong className="text-gray-600 font-bold">PayMongo</strong></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 px-7 py-5 bg-[#F7F6F4]">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 border border-gray-200 bg-white px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="size-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => canProceed() && setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 btn-navy px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                onClick={handleCompleteBooking}
                disabled={isSubmitting}
                className="flex items-center gap-2 btn-navy px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : <><Check className="size-4" /> Complete Booking</>}
              </button>
            )}
          </div>
          {errorMsg && (
            <div className="px-7 pb-5 bg-[#F7F6F4]">
              <p className="text-xs text-red-600 border border-red-200 bg-red-50 p-3">{errorMsg}</p>
            </div>
          )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
