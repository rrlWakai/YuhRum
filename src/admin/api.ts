import type { Amenity, Room, Booking, Discount } from '../types/admin';
import { supabase } from '../lib/supabase';

// Helper to handle Supabase responses
const handleResponse = <T>(data: T | null, error: any): T => {
  if (error) throw new Error(error.message);
  if (!data) throw new Error('No data returned');
  return data;
};

// Rate limiting logic
const RATE_LIMIT_KEY = 'admin_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

interface RateLimitData {
  attempts: number;
  lockUntil: number | null;
}

function getRateLimitData(): RateLimitData {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return { attempts: 0, lockUntil: null };
}

function setRateLimitData(data: RateLimitData) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}

export function checkRateLimit(): { isLocked: boolean; timeRemainingMs: number } {
  const data = getRateLimitData();
  if (data.lockUntil && Date.now() < data.lockUntil) {
    return { isLocked: true, timeRemainingMs: data.lockUntil - Date.now() };
  }
  if (data.lockUntil && Date.now() >= data.lockUntil) {
    setRateLimitData({ attempts: 0, lockUntil: null });
  }
  return { isLocked: false, timeRemainingMs: 0 };
}

function recordFailedAttempt() {
  const data = getRateLimitData();
  data.attempts += 1;
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockUntil = Date.now() + LOCKOUT_MS;
  }
  setRateLimitData(data);
}

export function resetRateLimit() {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

export async function loginAdmin(email: string, password: string) {
  const { isLocked, timeRemainingMs } = checkRateLimit();
  if (isLocked) {
    const mins = Math.ceil(timeRemainingMs / 60000);
    throw new Error(`Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    recordFailedAttempt();
    throw new Error(error.message);
  }
  
  resetRateLimit();
  return data;
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
}

export function hasAdminToken() {
  const sessionData = localStorage.getItem('sb-' + new URL(import.meta.env.VITE_SUPABASE_URL || '').hostname.split('.')[0] + '-auth-token');
  return Boolean(sessionData);
}

export async function getAdminData() {
  const [roomsRes, amenitiesRes, bookingsRes, discountsRes] = await Promise.all([
    supabase.from('rooms').select('*').order('created_at', { ascending: false }),
    supabase.from('amenities').select('*').order('created_at', { ascending: false }),
    supabase.from('bookings').select('*').order('created_at', { ascending: false }),
    supabase.from('discounts').select('*').order('created_at', { ascending: false })
  ]);

  if (roomsRes.error) throw new Error(roomsRes.error.message);
  if (amenitiesRes.error) throw new Error(amenitiesRes.error.message);
  if (bookingsRes.error) throw new Error(bookingsRes.error.message);
  if (discountsRes.error) throw new Error(discountsRes.error.message);

  return {
    rooms: roomsRes.data as Room[],
    amenities: amenitiesRes.data as Amenity[],
    bookings: bookingsRes.data as Booking[],
    discounts: discountsRes.data as Discount[],
  };
}

// --- Rooms ---
export async function createRoom(room: Omit<Room, 'id'>) {
  const { data, error } = await supabase.from('rooms').insert([room]).select().single();
  return handleResponse<Room>(data, error);
}

export async function updateRoom(id: string, room: Omit<Room, 'id'>) {
  const { data, error } = await supabase.from('rooms').update(room).eq('id', id).select().single();
  return handleResponse<Room>(data, error);
}

export async function deleteRoom(id: string) {
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true as const };
}

// --- Amenities ---
export async function createAmenity(amenity: Omit<Amenity, 'id'>) {
  const { data, error } = await supabase.from('amenities').insert([amenity]).select().single();
  return handleResponse<Amenity>(data, error);
}

export async function updateAmenity(id: string, amenity: Omit<Amenity, 'id'>) {
  const { data, error } = await supabase.from('amenities').update(amenity).eq('id', id).select().single();
  return handleResponse<Amenity>(data, error);
}

export async function deleteAmenity(id: string) {
  const { error } = await supabase.from('amenities').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true as const };
}

// --- Bookings ---
export async function updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
  const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
  return handleResponse<Booking>(data, error);
}

export async function deleteBooking(id: string) {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true as const };
}

// --- Discounts ---
export async function createDiscount(discount: Omit<Discount, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('discounts').insert([discount]).select().single();
  return handleResponse<Discount>(data, error);
}

export async function toggleDiscountActive(id: string, is_active: boolean) {
  const { data, error } = await supabase.from('discounts').update({ is_active }).eq('id', id).select().single();
  return handleResponse<Discount>(data, error);
}

export async function deleteDiscount(id: string) {
  const { error } = await supabase.from('discounts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true as const };
}
