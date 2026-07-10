'use client';
import { useAuthStore } from './authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (requiredRole === 'ADMIN' && user?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated) return null;
  if (requiredRole === 'ADMIN' && user?.role !== 'ADMIN') return null;

  return <>{children}</>;
}