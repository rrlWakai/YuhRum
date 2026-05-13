import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ProtectedRoute({ children, fallback = null }: Props) {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-[#F7F6F4]" />;
  }

  if (!user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
