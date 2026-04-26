import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  blockedDates?: string[];
  onRangeSelect?: (start: string, end: string) => void;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isWeekend(year: number, month: number, day: number) {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6;
}

function isBefore(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number) {
  return new Date(y1, m1, d1) < new Date(y2, m2, d2);
}

function isInRange(y: number, m: number, d: number, start: string, end: string) {
  if (!start || !end) return false;
  const date = new Date(y, m, d);
  return date > new Date(start) && date < new Date(end);
}

const SAMPLE_BLOCKED: string[] = (() => {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  return [
    toKey(y, mo, 5), toKey(y, mo, 6), toKey(y, mo, 7),
    toKey(y, mo, 14), toKey(y, mo, 15),
    toKey(y, mo, 22), toKey(y, mo, 23), toKey(y, mo, 24),
  ];
})();

export function AvailabilityCalendar({ blockedDates = SAMPLE_BLOCKED, onRangeSelect }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [hovering, setHovering] = useState('');

  const blocked = new Set(blockedDates);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDayClick(day: number) {
    const key = toKey(viewYear, viewMonth, day);
    if (blocked.has(key)) return;
    const isPast = isBefore(viewYear, viewMonth, day, today.getFullYear(), today.getMonth(), today.getDate());
    if (isPast) return;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(key);
      setRangeEnd('');
    } else {
      if (key <= rangeStart) {
        setRangeStart(key);
        setRangeEnd('');
      } else {
        setRangeEnd(key);
        onRangeSelect?.(rangeStart, key);
      }
    }
  }

  function getDayClass(day: number): string {
    const key = toKey(viewYear, viewMonth, day);
    const isPast = isBefore(viewYear, viewMonth, day, today.getFullYear(), today.getMonth(), today.getDate());
    const isToday =
      viewYear === today.getFullYear() &&
      viewMonth === today.getMonth() &&
      day === today.getDate();

    if (blocked.has(key)) return 'cal-day-blocked rounded-lg';
    if (key === rangeStart || key === rangeEnd) return 'cal-day-selected font-semibold';
    if (rangeStart && !rangeEnd && key === hovering && hovering > rangeStart)
      return 'cal-day-available rounded-lg bg-[#EBF5EF] text-[#3D6B52]';
    if (rangeStart && !rangeEnd && isInRange(viewYear, viewMonth, day, rangeStart, hovering))
      return 'cal-day-in-range rounded-sm';
    if (rangeStart && rangeEnd && isInRange(viewYear, viewMonth, day, rangeStart, rangeEnd))
      return 'cal-day-in-range rounded-sm';
    if (isPast) return 'text-gray-300 cursor-not-allowed';
    if (isToday) return 'cal-day-available rounded-lg ring-1 ring-[#3D6B52] font-semibold text-[#3D6B52]';
    if (isWeekend(viewYear, viewMonth, day)) return 'cal-day-available cal-day-weekend rounded-lg';
    return 'cal-day-available rounded-lg text-neutral-700';
  }

  const effectiveEnd = rangeEnd || (rangeStart && hovering > rangeStart ? hovering : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="flex size-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="font-serif text-xl text-neutral-900">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          onClick={nextMonth}
          className="flex size-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = toKey(viewYear, viewMonth, day);
          return (
            <button
              key={key}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => setHovering(key)}
              onMouseLeave={() => setHovering('')}
              className={`aspect-square flex items-center justify-center text-sm transition-all duration-150 ${getDayClass(day)}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <span className="inline-block size-3 rounded-full bg-[#3D6B52]" />
          <span className="text-xs text-gray-500">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block size-3 rounded-full bg-[#EBF5EF] ring-1 ring-[#C3DEC9]" />
          <span className="text-xs text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block size-3 rounded-full bg-gray-200" />
          <span className="text-xs text-gray-500">Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block size-3 rounded-full ring-1 ring-[#3D6B52]" />
          <span className="text-xs text-gray-500">Today</span>
        </div>
      </div>

      {(rangeStart || effectiveEnd) && (
        <div className="mt-4 rounded-xl bg-[#EBF5EF] px-4 py-3 text-sm text-[#3D6B52]">
          {rangeStart && !effectiveEnd && (
            <span>Check-in: <strong>{rangeStart}</strong> — select check-out date</span>
          )}
          {rangeStart && effectiveEnd && (
            <span>
              <strong>{rangeStart}</strong> → <strong>{effectiveEnd}</strong>
              <button
                onClick={() => { setRangeStart(''); setRangeEnd(''); }}
                className="ml-3 text-xs underline opacity-70 hover:opacity-100"
              >
                Clear
              </button>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
