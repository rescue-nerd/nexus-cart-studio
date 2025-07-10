// src/lib/rbac.ts

export type UserRole = 'super_admin' | 'store_owner' | 'staff' | 'customer';

export interface AuthUser {
  uid: string;
  role: UserRole;
  storeId?: string; // For store_owner/staff
}

export function requireRole(user: AuthUser | null | undefined, ...roles: UserRole[]): asserts user is AuthUser {
  if (!user) throw new Error('Not authenticated');
  if (!roles.includes(user.role)) throw new Error('Forbidden: Insufficient role');
}

export function requireStoreOwnership(user: AuthUser, storeId: string): void {
  if (user.role === 'super_admin') return;
  if (user.role === 'store_owner' && user.storeId === storeId) return;
  throw new Error('Forbidden: Not store owner or super admin');
}

export function isSuperAdmin(user: AuthUser): boolean {
  return user.role === 'super_admin';
}

export function isStoreOwner(user: AuthUser, storeId: string): boolean {
  return user.role === 'store_owner' && user.storeId === storeId;
}
