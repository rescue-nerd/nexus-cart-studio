// Enhanced Role-Based Access Control for NexusCart
// This file provides utilities for checking user roles and permissions

export type UserRole = 'super_admin' | 'store_owner' | 'customer';

export interface UserClaims {
  role: UserRole;
  storeId?: string; // For store_owner role
  permissions?: string[];
}

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
  storeId?: string;
  permissions?: string[];
}

// Permission constants
export const PERMISSIONS = {
  // Store management
  CREATE_STORE: 'create_store',
  DELETE_STORE: 'delete_store',
  UPDATE_STORE: 'update_store',
  VIEW_ALL_STORES: 'view_all_stores',
  
  // Product management
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',
  
  // Order management
  VIEW_ORDERS: 'view_orders',
  UPDATE_ORDER_STATUS: 'update_order_status',
  PROCESS_REFUNDS: 'process_refunds',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  
  // Settings
  UPDATE_PAYMENT_SETTINGS: 'update_payment_settings',
  UPDATE_SEO_SETTINGS: 'update_seo_settings',
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    PERMISSIONS.CREATE_STORE,
    PERMISSIONS.DELETE_STORE,
    PERMISSIONS.UPDATE_STORE,
    PERMISSIONS.VIEW_ALL_STORES,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.PROCESS_REFUNDS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.UPDATE_PAYMENT_SETTINGS,
    PERMISSIONS.UPDATE_SEO_SETTINGS,
  ],
  store_owner: [
    PERMISSIONS.UPDATE_STORE, // Only their own store
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.PROCESS_REFUNDS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.UPDATE_PAYMENT_SETTINGS,
    PERMISSIONS.UPDATE_SEO_SETTINGS,
  ],
  customer: [], // No admin permissions
};

export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  if (!user.permissions) {
    user.permissions = ROLE_PERMISSIONS[user.role] || [];
  }
  return user.permissions.includes(permission);
}

export function canAccessStore(user: AuthenticatedUser, storeId: string): boolean {
  if (user.role === 'super_admin') return true;
  if (user.role === 'store_owner') return user.storeId === storeId;
  return false;
}

export function requirePermission(user: AuthenticatedUser, permission: string): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Access denied: Missing permission ${permission}`);
  }
}

export function requireStoreAccess(user: AuthenticatedUser, storeId: string): void {
  if (!canAccessStore(user, storeId)) {
    throw new Error(`Access denied: Cannot access store ${storeId}`);
  }
}
