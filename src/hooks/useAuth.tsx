import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { supabase } from '@/lib/supabase';
import {
  getInitialSession,
  getUserRole,
  initialAuthState,
  signInWithEmailPassword,
  signOutUser,
  type AuthState,
} from '@/lib/auth';

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(initialAuthState);

  async function hydrateFromSession() {
    setState((prev) => ({ ...prev, isLoading: true }));
    const session = await getInitialSession();
    const role = await getUserRole(session?.user ?? null);
    setState({
      isLoading: false,
      session,
      user: session?.user ?? null,
      role,
    });
  }

  useEffect(() => {
    let mounted = true;

    void hydrateFromSession().catch(() => {
      if (!mounted) return;
      setState({ isLoading: false, session: null, user: null, role: null });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        const role = await getUserRole(session?.user ?? null);
        if (!mounted) return;
        setState({
          isLoading: false,
          session: session ?? null,
          user: session?.user ?? null,
          role,
        });
      })();
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn: async (email: string, password: string) => {
        await signInWithEmailPassword(email, password);
      },
      signOut: async () => {
        await signOutUser();
      },
      refresh: hydrateFromSession,
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
