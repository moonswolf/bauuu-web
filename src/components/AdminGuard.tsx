'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserRole, isAdmin } from '@/lib/admin';
import { UserRole } from '@/types';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'moderator' | 'admin' | 'superadmin';
}

export default function AdminGuard({ children, requiredRole = 'moderator' }: AdminGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    getUserRole(user.uid).then(r => {
      setRole(r);
      setLoading(false);
      if (!hasAccess(r, requiredRole)) {
        router.push('/app/discover');
      }
    });
  }, [user, authLoading, router, requiredRole]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!role || !hasAccess(role, requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

function hasAccess(userRole: UserRole, required: string): boolean {
  const hierarchy: Record<string, number> = {
    user: 0,
    moderator: 1,
    admin: 2,
    superadmin: 3,
  };
  return (hierarchy[userRole] || 0) >= (hierarchy[required] || 0);
}
