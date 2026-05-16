import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function isWeekend(dateStr: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr).getDay();
  return d === 0 || d === 6;
}

export function isBefore(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number) {
  return new Date(y1, m1, d1) < new Date(y2, m2, d2);
}

export type StayType = 'dayStay' | 'nightStay' | 'overnight';

export function useAvailability() {
  const [blockedDates, setBlockedDates] = useState<Map<string, Set<StayType>>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('bookings')
        .select('check_in, stay_type')
        .in('status', ['confirmed', 'pending']);
        
      if (err) throw err;
      
      const blocked = new Map<string, Set<StayType>>();
      
      const block = (date: string, type: StayType) => {
        if (!blocked.has(date)) blocked.set(date, new Set());
        blocked.get(date)!.add(type);
      };

      if (data) {
        data.forEach(booking => {
          const date = booking.check_in;
          const type = booking.stay_type as StayType;
          
          if (type === 'overnight') {
            // Blocks Day X: All
            block(date, 'overnight');
            block(date, 'dayStay');
            block(date, 'nightStay');
            
            // Blocks Day X+1: Overnight & Day Stay
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            const nextDayKey = toKey(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());
            block(nextDayKey, 'overnight');
            block(nextDayKey, 'dayStay');
          } else if (type === 'dayStay') {
            // Blocks Day X: Day Stay & Overnight
            block(date, 'dayStay');
            block(date, 'overnight');
          } else if (type === 'nightStay') {
            // Blocks Day X: Night Stay & Overnight
            block(date, 'nightStay');
            block(date, 'overnight');
          }
        });
      }
      setBlockedDates(blocked);
    } catch (err: any) {
      console.error("Failed to fetch availability:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  return { blockedDates, isLoading, error, refetch: fetchAvailability };
}
