'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export default function AuthGuard({ children, requireProfile = false }: AuthGuardProps) {
  const { user, userProfile, loading, isAuthenticated, isProfileComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requireProfile && !isProfileComplete) {
        router.push('/setup/profile');
      }
    }
  }, [loading, isAuthenticated, isProfileComplete, requireProfile, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || (requireProfile && !isProfileComplete)) {
    return null;
  }

  return <>{children}</>;
}