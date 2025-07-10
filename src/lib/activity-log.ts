import { adminDb } from './firebase-admin';
import { AuthUser } from './rbac';

export type ActivityLog = {
  userId: string;
  userRole: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
  timestamp: string;
  ip?: string;
};

export async function logActivity(
  user: AuthUser | null,
  action: string,
  target: string | null | undefined,
  details?: Record<string, unknown>,
  req?: { headers?: Record<string, string | string[] | undefined> }
) {
  if (!adminDb) return;
  const log: ActivityLog = {
    userId: user?.uid || 'anonymous',
    userRole: user?.role || 'unknown',
    action,
    target: String(target ?? ''),
    details,
    timestamp: new Date().toISOString(),
    ip: req?.headers?.['x-forwarded-for']?.toString() || req?.headers?.['x-real-ip']?.toString() || undefined,
  };
  await adminDb.collection('activity_logs').add(log);
} 