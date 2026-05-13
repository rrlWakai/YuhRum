import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasRole } from '@/lib/admin';

type Props = {
  children: ReactNode;
  unauthenticated: ReactNode;
};

export function AdminRoute({ children, unauthenticated }: Props) {
  const { isLoading, user, role } = useAuth();

  useEffect(() => {
    if (!isLoading && user && !hasRole(role, ['admin'])) {
      window.location.replace('/');
    }
  }, [isLoading, user, role]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#F7F6F4]" />;
  }

  if (!user) {
    return <>{unauthenticated}</>;
  }

  if (!hasRole(role, ['admin'])) {
    return <div className="min-h-screen bg-[#F7F6F4]" />;
  }

  return <>{children}</>;
}
