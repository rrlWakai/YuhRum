import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Sun, Moon, Sunrise } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAvailability, toKey, isBefore, isWeekend, type StayType } from '../lib/hooks';

type Props = {
  /** Which package to highlight on the calendar. Undefined = show all packages per day. */
  stayType?: StayType;
  /** Currently selected date (single-pick mode) */
  selectedDate?: string;
  /** Called when user picks a date */
  onSelect?: (date: string) => void;
};

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const PACKAGE_META: { key: StayType; label: string; Icon: React.ElementType }[] = [
  { key: 'dayStay',   label: 'Day',   Icon: Sun },
  { key: 'nightStay', label: 'Night', Icon: Moon },
  { key: 'overnight', label: 'O/N',   Icon: Sunrise },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function AvailabilityCalendar({ stayType, selectedDate, onSelect }: Props) {
  const { blockedDates, isLoading } = useAvailability();

  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function isFullyBlocked(key: string) {
    const blocked = blockedDates.get(key);
    if (!blocked) return false;
    if (stayType) return blocked.has(stayType);
    return blocked.has('dayStay') && blocked.has('nightStay') && blocked.has('overnight');
  }

  function handleDayClick(day: number) {
    if (isLoading) return;
    const key = toKey(viewYear, viewMonth, day);
    if (isBefore(viewYear, viewMonth, day, today.getFullYear(), today.getMonth(), today.getDate())) return;
    if (isFullyBlocked(key)) return;
    onSelect?.(key);
  }

  function getDayStyle(day: number): { cellClass: string; badgePkgs: { key: StayType; blocked: boolean }[] } {
    const key   = toKey(viewYear, viewMonth, day);
    const isPast = isBefore(viewYear, viewMonth, day, today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
    const blocked = blockedDates.get(key);

    // Determine packages to show badges for
    const badgePkgs = stayType
      ? [] // In single-package mode, no per-day badges — just whole-cell state
      : PACKAGE_META.map(p => ({ key: p.key, blocked: blocked?.has(p.key) ?? false }));

    if (isPast) return { cellClass: 'text-shadow/20 cursor-not-allowed', badgePkgs };
    if (isFullyBlocked(key)) return { cellClass: 'cal-day-blocked', badgePkgs };
    if (key === selectedDate) return { cellClass: 'cal-day-selected font-semibold', badgePkgs };
    if (isToday) return { cellClass: 'cal-day-available ring-1 ring-blush font-semibold text-blush', badgePkgs };
    if (isWeekend(key)) return { cellClass: 'cal-day-available cal-day-weekend', badgePkgs };
    return { cellClass: 'cal-day-available text-plum', badgePkgs };
  }

  const pkgsToShow = stayType ? [PACKAGE_META.find(p => p.key === stayType)!] : PACKAGE_META;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="border border-blush/20 bg-white p-5 md:p-7 relative overflow-hidden"
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-petal/60 backdrop-blur-sm">
          <Loader2 className="size-7 animate-spin text-blush" />
        </div>
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth}
          className="flex size-8 items-center justify-center border border-blush/20 text-shadow hover:border-blush hover:text-plum transition-colors">
          <ChevronLeft className="size-4" strokeWidth={1} />
        </button>
        <p className="font-display text-xl italic text-plum">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button onClick={nextMonth}
          className="flex size-8 items-center justify-center border border-blush/20 text-shadow hover:border-blush hover:text-plum transition-colors">
          <ChevronRight className="size-4" strokeWidth={1} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="py-1 text-center font-body text-[9px] uppercase tracking-[0.2em] text-shadow/40">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = toKey(viewYear, viewMonth, day);
          const { cellClass, badgePkgs } = getDayStyle(day);

          return (
            <button
              key={key}
              onClick={() => handleDayClick(day)}
              className={`flex flex-col items-center justify-start pt-1.5 pb-1 min-h-[52px] text-sm transition-all duration-150 ${cellClass}`}
            >
              <span className="leading-none mb-1.5">{day}</span>

              {/* Package availability badges — only shown in "overview" mode (no stayType) */}
              {!stayType && badgePkgs.length > 0 && (
                <div className="flex gap-0.5">
                  {PACKAGE_META.map(({ key: pkg }) => {
                    const blocked = blockedDates.get(key)?.has(pkg);
                    const isPast = isBefore(viewYear, viewMonth, day, today.getFullYear(), today.getMonth(), today.getDate());
                    return (
                      <span
                        key={pkg}
                        title={pkg}
                        className={`w-1.5 h-1.5 ${blocked || isPast ? 'bg-blush/30' : 'bg-gold/60'}`}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 border-t border-blush/15 pt-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-plum/80" />
            <span className="font-body text-[9px] uppercase tracking-[0.2em] text-shadow/60">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blush/20 ring-1 ring-blush/40" />
            <span className="font-body text-[9px] uppercase tracking-[0.2em] text-shadow/60">Unavailable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-gold/30" />
            <span className="font-body text-[9px] uppercase tracking-[0.2em] text-shadow/60">Weekend</span>
          </div>
        </div>

        {/* Package key — always visible */}
        <div className="flex flex-wrap gap-3">
          {pkgsToShow.map(({ key: pkg, label, Icon }) => {
            const activeFilter = stayType === pkg || !stayType;
            return (
              <div key={pkg} className={`flex items-center gap-1.5 ${activeFilter ? 'opacity-100' : 'opacity-40'}`}>
                <Icon className="size-3 text-blush" strokeWidth={1} />
                <span className="font-body text-[9px] uppercase tracking-[0.2em] text-shadow/60">{label} Stay</span>
              </div>
            );
          })}
        </div>

        {/* Dot legend when in overview mode */}
        {!stayType && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-gold/60" />
              <span className="w-1.5 h-1.5 bg-gold/60" />
              <span className="w-1.5 h-1.5 bg-gold/60" />
            </div>
            <span className="font-body text-[9px] uppercase tracking-[0.2em] text-shadow/40">= Day / Night / Overnight available</span>
          </div>
        )}
      </div>

      {/* Selected date summary */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 border border-blush/20 bg-petal px-4 py-3 flex items-center justify-between"
        >
          <span className="font-body text-xs text-shadow">
            <span className="text-shadow/50 uppercase tracking-[0.2em] text-[9px] mr-2">Date</span>
            {selectedDate}
          </span>
          <button onClick={() => onSelect?.('')}
            className="font-body text-[9px] uppercase tracking-[0.2em] text-shadow/40 hover:text-plum transition-colors">
            Clear
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
