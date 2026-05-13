import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type UserRole = 'admin' | 'student' | 'moderator';

export type Profile = {
  id: string;
  role: UserRole;
};

export async function getProfileRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle<{ role: UserRole }>();

  if (error) {
    const message = String(error.message || '');
    const code = (error as { code?: string }).code;
    const tableMissing =
      code === 'PGRST205' ||
      message.toLowerCase().includes('profiles') &&
      (message.toLowerCase().includes('not found') || message.toLowerCase().includes('does not exist'));

    if (tableMissing) {
      return null;
    }

    throw new Error('Unable to load profile role.');
  }

  return data?.role ?? null;
}

export function hasRole(role: UserRole | null, allowed: readonly UserRole[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}

export function canAccessAdmin(user: User | null, role: UserRole | null): boolean {
  return Boolean(user) && role === 'admin';
}
