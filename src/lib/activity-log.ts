import { adminDb } from './firebase-admin';
import { AuthUser } from './rbac';

export type ActivityLog = {
  id?: string;
  userId: string;
  userRole: string;
  userEmail?: string;
  userName?: string;
  action: string;
  target: string;
  targetType?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  storeId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'auth' | 'product' | 'order' | 'settings' | 'admin' | 'system' | 'security';
  success: boolean;
  errorMessage?: string;
  duration?: number; // in milliseconds
};

export type ActivityLogFilter = {
  userId?: string;
  userRole?: string;
  action?: string;
  targetType?: string;
  category?: string;
  severity?: string;
  success?: boolean;
  storeId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type ActivityLogStats = {
  totalLogs: number;
  logsByCategory: Record<string, number>;
  logsBySeverity: Record<string, number>;
  logsByAction: Record<string, number>;
  recentActivity: ActivityLog[];
  failedActions: number;
  successRate: number;
};

export async function logActivity(
  user: AuthUser | null,
  action: string,
  target: string | null | undefined,
  details?: Record<string, unknown>,
  req?: { headers?: Record<string, string | string[] | undefined> },
  options?: {
    category?: ActivityLog['category'];
    severity?: ActivityLog['severity'];
    targetType?: string;
    storeId?: string;
    success?: boolean;
    errorMessage?: string;
    duration?: number;
  }
) {
  if (!adminDb) return;
  
  const startTime = Date.now();
  const log: ActivityLog = {
    userId: user?.uid || 'anonymous',
    userRole: user?.role || 'unknown',
    userEmail: undefined, // Will be populated from Firebase Auth if needed
    userName: undefined, // Will be populated from Firebase Auth if needed
    action,
    target: String(target ?? ''),
    targetType: options?.targetType,
    details,
    timestamp: new Date().toISOString(),
    ip: req?.headers?.['x-forwarded-for']?.toString() || req?.headers?.['x-real-ip']?.toString() || undefined,
    userAgent: req?.headers?.['user-agent']?.toString(),
    sessionId: req?.headers?.['x-session-id']?.toString(),
    storeId: options?.storeId || user?.storeId,
    severity: options?.severity || 'low',
    category: options?.category || 'system',
    success: options?.success ?? true,
    errorMessage: options?.errorMessage,
    duration: options?.duration || (Date.now() - startTime),
  };
  
  try {
    await adminDb.collection('activity_logs').add(log);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging should never break the main flow
  }
}

export async function getActivityLogs(filter: ActivityLogFilter = {}): Promise<ActivityLog[]> {
  if (!adminDb) return [];
  
  let query = adminDb.collection('activity_logs').orderBy('timestamp', 'desc');
  
  // Apply filters
  if (filter.userId) {
    query = query.where('userId', '==', filter.userId);
  }
  
  if (filter.userRole) {
    query = query.where('userRole', '==', filter.userRole);
  }
  
  if (filter.action) {
    query = query.where('action', '==', filter.action);
  }
  
  if (filter.category) {
    query = query.where('category', '==', filter.category);
  }
  
  if (filter.severity) {
    query = query.where('severity', '==', filter.severity);
  }
  
  if (filter.success !== undefined) {
    query = query.where('success', '==', filter.success);
  }
  
  if (filter.storeId) {
    query = query.where('storeId', '==', filter.storeId);
  }
  
  if (filter.dateFrom) {
    query = query.where('timestamp', '>=', filter.dateFrom);
  }
  
  if (filter.dateTo) {
    query = query.where('timestamp', '<=', filter.dateTo);
  }
  
  // Apply limit
  const limit = filter.limit || 100;
  query = query.limit(limit);
  
  if (filter.offset) {
    query = query.offset(filter.offset);
  }
  
  const snapshot = await query.get();
  const logs: ActivityLog[] = [];
  
  snapshot.forEach((doc) => {
    logs.push({
      id: doc.id,
      ...doc.data(),
    } as ActivityLog);
  });
  
  // Apply search filter if provided
  if (filter.search) {
    const searchTerm = filter.search.toLowerCase();
    return logs.filter(log => 
      log.userId.toLowerCase().includes(searchTerm) ||
      log.userName?.toLowerCase().includes(searchTerm) ||
      log.userEmail?.toLowerCase().includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm) ||
      log.target.toLowerCase().includes(searchTerm) ||
      log.details?.toString().toLowerCase().includes(searchTerm)
    );
  }
  
  return logs;
}

export async function getActivityLogStats(filter: ActivityLogFilter = {}): Promise<ActivityLogStats> {
  const logs = await getActivityLogs({ ...filter, limit: 1000 });
  
  const stats: ActivityLogStats = {
    totalLogs: logs.length,
    logsByCategory: {},
    logsBySeverity: {},
    logsByAction: {},
    recentActivity: logs.slice(0, 10),
    failedActions: logs.filter(log => !log.success).length,
    successRate: logs.length > 0 ? (logs.filter(log => log.success).length / logs.length) * 100 : 0,
  };
  
  // Calculate category breakdown
  logs.forEach(log => {
    const category = log.category || 'unknown';
    stats.logsByCategory[category] = (stats.logsByCategory[category] || 0) + 1;
    
    const severity = log.severity || 'low';
    stats.logsBySeverity[severity] = (stats.logsBySeverity[severity] || 0) + 1;
    
    stats.logsByAction[log.action] = (stats.logsByAction[log.action] || 0) + 1;
  });
  
  return stats;
}

export async function exportActivityLogs(filter: ActivityLogFilter = {}): Promise<string> {
  const logs = await getActivityLogs({ ...filter, limit: 10000 });
  
  // Convert to CSV format
  const headers = [
    'ID', 'User ID', 'User Role', 'User Email', 'User Name', 'Action', 'Target', 
    'Target Type', 'Category', 'Severity', 'Success', 'Error Message', 'IP Address', 
    'User Agent', 'Store ID', 'Timestamp', 'Duration (ms)'
  ];
  
  const csvRows = [
    headers.join(','),
    ...logs.map(log => [
      log.id || '',
      log.userId,
      log.userRole,
      log.userEmail || '',
      log.userName || '',
      log.action,
      log.target,
      log.targetType || '',
      log.category || '',
      log.severity || '',
      log.success ? 'true' : 'false',
      log.errorMessage || '',
      log.ip || '',
      log.userAgent || '',
      log.storeId || '',
      log.timestamp,
      log.duration || '',
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ];
  
  return csvRows.join('\n');
}

// Helper function to log with better categorization
export async function logUserAction(
  user: AuthUser | null,
  action: string,
  target: string | null | undefined,
  details?: Record<string, unknown>,
  req?: { headers?: Record<string, string | string[] | undefined> },
  options?: {
    category?: ActivityLog['category'];
    severity?: ActivityLog['severity'];
    targetType?: string;
    storeId?: string;
    success?: boolean;
    errorMessage?: string;
  }
) {
  return logActivity(user, action, target, details, req, options);
}

// Helper function to log security events
export async function logSecurityEvent(
  user: AuthUser | null,
  action: string,
  target: string | null | undefined,
  details?: Record<string, unknown>,
  req?: { headers?: Record<string, string | string[] | undefined> },
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  return logActivity(user, action, target, details, req, {
    category: 'security',
    severity,
    targetType: 'security',
  });
}

// Helper function to log failed actions
export async function logFailedAction(
  user: AuthUser | null,
  action: string,
  target: string | null | undefined,
  errorMessage: string,
  details?: Record<string, unknown>,
  req?: { headers?: Record<string, string | string[] | undefined> }
) {
  return logActivity(user, action, target, details, req, {
    success: false,
    errorMessage,
    severity: 'high',
  });
} 