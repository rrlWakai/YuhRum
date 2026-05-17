import type { Amenity, Room, Booking, Discount } from '../types/admin';
import { supabase } from '../lib/supabase';

// Helper to handle Supabase responses
const handleResponse = <T>(data: T | null, error: any): T => {
  if (error) throw new Error(error.message);
  if (!data) throw new Error('No data returned');
  return data;
};

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

// --- Backup System ---
export type Backup = {
  id: string;
  filename: string;
  backup_type: 'auto' | 'daily' | 'weekly' | 'manual';
  data: any;
  record_counts: {
    bookings: number;
    rooms: number;
    discounts: number;
    amenities: number;
  };
  created_at: string;
};

export type BackupSetting = {
  key: string;
  value: string;
  updated_at?: string;
};

export async function getBackups(): Promise<Backup[]> {
  try {
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Backup[];
  } catch {
    return JSON.parse(localStorage.getItem('yuhrum_local_backups') || '[]');
  }
}

export async function getBackupSettings(): Promise<BackupSetting[]> {
  try {
    const { data, error } = await supabase.from('backup_settings').select('*');
    if (error) throw error;
    return data as BackupSetting[];
  } catch {
    const freq = localStorage.getItem('yuhrum_backup_frequency') || 'daily';
    const auto = localStorage.getItem('yuhrum_auto_backup_on_booking') || 'true';
    return [
      { key: 'backup_frequency', value: freq },
      { key: 'auto_backup_on_booking', value: auto }
    ];
  }
}

export async function updateBackupSetting(key: string, value: string) {
  try {
    const { data, error } = await supabase
      .from('backup_settings')
      .upsert([{ key, value, updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch {
    if (key === 'backup_frequency') {
      localStorage.setItem('yuhrum_backup_frequency', value);
    } else if (key === 'auto_backup_on_booking') {
      localStorage.setItem('yuhrum_auto_backup_on_booking', value);
    }
    return { key, value };
  }
}

export async function deleteBackup(id: string) {
  try {
    const { error } = await supabase.from('backups').delete().eq('id', id);
    if (error) throw error;
  } catch {
    const localBackups = JSON.parse(localStorage.getItem('yuhrum_local_backups') || '[]');
    const filtered = localBackups.filter((b: any) => b.id !== id);
    localStorage.setItem('yuhrum_local_backups', JSON.stringify(filtered));
  }
  return { success: true };
}

export async function generateBackup(type: 'manual' | 'daily' | 'weekly') {
  // Fetch all databases
  const [roomsRes, amenitiesRes, bookingsRes, discountsRes] = await Promise.all([
    supabase.from('rooms').select('*'),
    supabase.from('amenities').select('*'),
    supabase.from('bookings').select('*'),
    supabase.from('discounts').select('*')
  ]);

  const rooms = roomsRes.data || [];
  const amenities = amenitiesRes.data || [];
  const bookings = bookingsRes.data || [];
  const discounts = discountsRes.data || [];

  const record_counts = {
    bookings: bookings.length,
    rooms: rooms.length,
    discounts: discounts.length,
    amenities: amenities.length
  };

  const data = {
    bookings,
    rooms,
    discounts,
    amenities
  };

  const filename = `${type}_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${Date.now().toString().slice(-4)}.json`;

  try {
    const { data: insertData, error } = await supabase
      .from('backups')
      .insert([{
        filename,
        backup_type: type,
        data,
        record_counts
      }])
      .select()
      .single();

    if (error) throw error;
    return insertData as Backup;
  } catch (err) {
    const localBackups = JSON.parse(localStorage.getItem('yuhrum_local_backups') || '[]');
    const newBackup: Backup = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      filename,
      backup_type: type,
      data,
      record_counts,
      created_at: new Date().toISOString()
    };
    localBackups.unshift(newBackup);
    localStorage.setItem('yuhrum_local_backups', JSON.stringify(localBackups));
    return newBackup;
  }
}

export async function restoreBackup(backup: Backup) {
  const { data } = backup;
  
  try {
    // 1. Restore Rooms
    if (data.rooms) {
      await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (data.rooms.length > 0) {
        await supabase.from('rooms').insert(data.rooms);
      }
    }
    // 2. Restore Amenities
    if (data.amenities) {
      await supabase.from('amenities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (data.amenities.length > 0) {
        await supabase.from('amenities').insert(data.amenities);
      }
    }
    // 3. Restore Discounts
    if (data.discounts) {
      await supabase.from('discounts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (data.discounts.length > 0) {
        await supabase.from('discounts').insert(data.discounts);
      }
    }
    // 4. Restore Bookings
    if (data.bookings) {
      await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (data.bookings.length > 0) {
        await supabase.from('bookings').insert(data.bookings);
      }
    }
    return { success: true };
  } catch (err) {
    console.error("Restore failed:", err);
    throw err;
  }
}
