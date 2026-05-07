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

export function useAvailability() {
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .in('status', ['confirmed', 'pending']);
        
      if (err) throw err;
      
      const blocked = new Set<string>();
      
      if (data) {
        data.forEach(booking => {
          const start = new Date(booking.check_in);
          const end = new Date(booking.check_out);
          
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          
          let current = new Date(start);
          while (current < end) {
            blocked.add(toKey(current.getFullYear(), current.getMonth(), current.getDate()));
            current.setDate(current.getDate() + 1);
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
