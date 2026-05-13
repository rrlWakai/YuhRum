import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { getProfileRole, type UserRole } from './admin';

export type AuthState = {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  role: UserRole | null;
};

export const initialAuthState: AuthState = {
  isLoading: true,
  session: null,
  user: null,
  role: null,
};

export async function getInitialSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error('Failed to load user session.');
  return data.session ?? null;
}

export async function getUserRole(user: User | null): Promise<UserRole | null> {
  if (!user) return null;
  return getProfileRole(user.id);
}

export async function signInWithEmailPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
