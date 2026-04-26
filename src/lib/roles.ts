import { UserRole } from '@/types';

export const isAdmin = (role?: UserRole): boolean =>
  role === 'admin' || role === 'superadmin' || role === 'moderator';

export const isAdminOrHigher = (role?: UserRole): boolean =>
  role === 'admin' || role === 'superadmin';

export const isSuperadmin = (role?: UserRole): boolean =>
  role === 'superadmin';
