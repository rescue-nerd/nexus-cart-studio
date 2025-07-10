import { adminDb } from './firebase-admin';
import { AuthUser } from './rbac';

export type ActivityLog = {
  userId: string;
  userRole: string;
  action: string;
  target: string;
  details?: any;
  timestamp: string;
  ip?: string;
};

export async function logActivity(
  user: AuthUser | null,
  action: string,
  target: string | null | undefined,
  details?: any,
  req?: { headers?: any }
) {
  if (!adminDb) return;
  const log: ActivityLog = {
    userId: user?.uid || 'anonymous',
    userRole: user?.role || 'unknown',
    action,
    target: String(target ?? ''),
    details,
    timestamp: new Date().toISOString(),
    ip: req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || undefined,
  };
  await adminDb.collection('activity_logs').add(log);
} 