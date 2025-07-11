import { 
  logActivity, 
  logUserAction, 
  logSecurityEvent, 
  logFailedAction,
  getActivityLogs,
  getActivityLogStats,
  exportActivityLogs,
  type ActivityLog,
  type ActivityLogFilter
} from '@/lib/activity-log';

// Mock Firebase Admin
const mockAdd = jest.fn();
const mockWhere = jest.fn().mockReturnThis();
const mockOrderBy = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockOffset = jest.fn().mockReturnThis();
const mockGet = jest.fn();

const mockCollection = jest.fn().mockReturnValue({
  add: mockAdd,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  offset: mockOffset,
  get: mockGet,
});

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: mockCollection,
  },
}));

describe('Activity Log System', () => {
  const mockUser = {
    uid: 'user-123',
    role: 'store_owner' as const,
    storeId: 'store-123',
  };

  const mockReq = {
    headers: {
      'x-forwarded-for': '192.168.1.1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'x-session-id': 'session-123',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdd.mockResolvedValue({ id: 'log-123' });
  });

  describe('logActivity', () => {
    it('should log activity with all required fields', async () => {
      await logActivity(
        mockUser,
        'test_action',
        'test_target',
        { test: 'data' },
        mockReq,
        {
          category: 'product',
          severity: 'medium',
          targetType: 'product',
          storeId: 'store-123',
          success: true,
        }
      );

      expect(mockAdd).toHaveBeenCalledWith({
        userId: 'user-123',
        userRole: 'store_owner',
        userEmail: undefined,
        userName: undefined,
        action: 'test_action',
        target: 'test_target',
        targetType: 'product',
        details: { test: 'data' },
        timestamp: expect.any(String),
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session-123',
        storeId: 'store-123',
        severity: 'medium',
        category: 'product',
        success: true,
        errorMessage: undefined,
        duration: expect.any(Number),
      });
    });

    it('should handle anonymous users', async () => {
      await logActivity(null, 'anonymous_action', 'target', undefined, mockReq);

      expect(mockAdd).toHaveBeenCalledWith({
        userId: 'anonymous',
        userRole: 'unknown',
        userEmail: undefined,
        userName: undefined,
        action: 'anonymous_action',
        target: 'target',
        targetType: undefined,
        details: undefined,
        timestamp: expect.any(String),
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session-123',
        storeId: undefined,
        severity: 'low',
        category: 'system',
        success: true,
        errorMessage: undefined,
        duration: expect.any(Number),
      });
    });

    it('should not throw on Firebase errors', async () => {
      mockAdd.mockRejectedValue(new Error('Firebase error'));

      await expect(logActivity(mockUser, 'test', 'target')).resolves.not.toThrow();
    });
  });

  describe('logUserAction', () => {
    it('should log user action with proper categorization', async () => {
      await logUserAction(
        mockUser,
        'add_product',
        'product-123',
        { productName: 'Test Product' },
        mockReq,
        {
          category: 'product',
          severity: 'medium',
          targetType: 'product',
          storeId: 'store-123',
        }
      );

      expect(mockAdd).toHaveBeenCalledWith({
        userId: 'user-123',
        userRole: 'store_owner',
        userEmail: undefined,
        userName: undefined,
        action: 'add_product',
        target: 'product-123',
        targetType: 'product',
        details: { productName: 'Test Product' },
        timestamp: expect.any(String),
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session-123',
        storeId: 'store-123',
        severity: 'medium',
        category: 'product',
        success: true,
        errorMessage: undefined,
        duration: expect.any(Number),
      });
    });
  });

  describe('logSecurityEvent', () => {
    it('should log security events with high severity', async () => {
      await logSecurityEvent(
        mockUser,
        'failed_login',
        'user-123',
        { ip: '192.168.1.1' },
        mockReq,
        'high'
      );

      expect(mockAdd).toHaveBeenCalledWith({
        userId: 'user-123',
        userRole: 'store_owner',
        userEmail: undefined,
        userName: undefined,
        action: 'failed_login',
        target: 'user-123',
        targetType: 'security',
        details: { ip: '192.168.1.1' },
        timestamp: expect.any(String),
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session-123',
        storeId: 'store-123',
        severity: 'high',
        category: 'security',
        success: true,
        errorMessage: undefined,
        duration: expect.any(Number),
      });
    });
  });

  describe('logFailedAction', () => {
    it('should log failed actions with error details', async () => {
      await logFailedAction(
        mockUser,
        'add_product',
        'product-123',
        'Database connection failed',
        { productName: 'Test Product' },
        mockReq
      );

      expect(mockAdd).toHaveBeenCalledWith({
        userId: 'user-123',
        userRole: 'store_owner',
        userEmail: undefined,
        userName: undefined,
        action: 'add_product',
        target: 'product-123',
        targetType: undefined,
        details: { productName: 'Test Product' },
        timestamp: expect.any(String),
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session-123',
        storeId: 'store-123',
        severity: 'high',
        category: 'system',
        success: false,
        errorMessage: 'Database connection failed',
        duration: expect.any(Number),
      });
    });
  });

  describe('getActivityLogs', () => {
    const mockLogs = [
      {
        id: 'log-1',
        userId: 'user-123',
        userRole: 'store_owner',
        action: 'add_product',
        target: 'product-123',
        category: 'product',
        severity: 'medium',
        success: true,
        timestamp: '2024-01-10T10:00:00Z',
        storeId: 'store-123',
      },
      {
        id: 'log-2',
        userId: 'user-456',
        userRole: 'super_admin',
        action: 'delete_product',
        target: 'product-456',
        category: 'product',
        severity: 'high',
        success: false,
        timestamp: '2024-01-10T11:00:00Z',
        storeId: 'store-123',
      },
    ];

    beforeEach(() => {
      mockGet.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          mockLogs.forEach((log, index) => {
            callback({
              id: log.id,
              data: () => log,
            });
          });
        },
      });
    });

    it('should fetch logs with default filter', async () => {
      const logs = await getActivityLogs();

      expect(mockCollection).toHaveBeenCalledWith('activity_logs');
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(100);
      expect(logs).toEqual(mockLogs);
    });

    it('should apply filters correctly', async () => {
      const filter: ActivityLogFilter = {
        userId: 'user-123',
        category: 'product',
        severity: 'medium',
        success: true,
        storeId: 'store-123',
        limit: 50,
      };

      await getActivityLogs(filter);

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(mockWhere).toHaveBeenCalledWith('category', '==', 'product');
      expect(mockWhere).toHaveBeenCalledWith('severity', '==', 'medium');
      expect(mockWhere).toHaveBeenCalledWith('success', '==', true);
      expect(mockWhere).toHaveBeenCalledWith('storeId', '==', 'store-123');
      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('should apply search filter', async () => {
      const logs = await getActivityLogs({ search: 'product' });

      expect(logs).toEqual(mockLogs.filter(log => 
        log.action.toLowerCase().includes('product') ||
        log.target.toLowerCase().includes('product')
      ));
    });

    it('should return empty array when adminDb is not available', async () => {
      jest.doMock('@/lib/firebase-admin', () => ({
        adminDb: null,
      }));

      const logs = await getActivityLogs();
      expect(logs).toEqual([]);
    });
  });

  describe('getActivityLogStats', () => {
    const mockLogs = [
      {
        id: 'log-1',
        userId: 'user-123',
        userRole: 'store_owner',
        action: 'add_product',
        target: 'product-123',
        category: 'product',
        severity: 'medium',
        success: true,
        timestamp: '2024-01-10T10:00:00Z',
        storeId: 'store-123',
      },
      {
        id: 'log-2',
        userId: 'user-456',
        userRole: 'super_admin',
        action: 'delete_product',
        target: 'product-456',
        category: 'product',
        severity: 'high',
        success: false,
        timestamp: '2024-01-10T11:00:00Z',
        storeId: 'store-123',
      },
      {
        id: 'log-3',
        userId: 'user-789',
        userRole: 'store_owner',
        action: 'update_product',
        target: 'product-789',
        category: 'product',
        severity: 'low',
        success: true,
        timestamp: '2024-01-10T12:00:00Z',
        storeId: 'store-123',
      },
    ];

    beforeEach(() => {
      mockGet.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          mockLogs.forEach((log, index) => {
            callback({
              id: log.id,
              data: () => log,
            });
          });
        },
      });
    });

    it('should calculate stats correctly', async () => {
      const stats = await getActivityLogStats();

      expect(stats).toEqual({
        totalLogs: 3,
        logsByCategory: {
          product: 3,
        },
        logsBySeverity: {
          low: 1,
          medium: 1,
          high: 1,
        },
        logsByAction: {
          add_product: 1,
          delete_product: 1,
          update_product: 1,
        },
        recentActivity: mockLogs.slice(0, 10),
        failedActions: 1,
        successRate: (2 / 3) * 100,
      });
    });

    it('should handle empty logs', async () => {
      mockGet.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          // No logs
        },
      });

      const stats = await getActivityLogStats();

      expect(stats).toEqual({
        totalLogs: 0,
        logsByCategory: {},
        logsBySeverity: {},
        logsByAction: {},
        recentActivity: [],
        failedActions: 0,
        successRate: 0,
      });
    });
  });

  describe('exportActivityLogs', () => {
    const mockLogs = [
      {
        id: 'log-1',
        userId: 'user-123',
        userRole: 'store_owner',
        userEmail: 'user@example.com',
        userName: 'John Doe',
        action: 'add_product',
        target: 'product-123',
        targetType: 'product',
        category: 'product',
        severity: 'medium',
        success: true,
        errorMessage: '',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        storeId: 'store-123',
        timestamp: '2024-01-10T10:00:00Z',
        duration: 150,
      },
    ];

    beforeEach(() => {
      mockGet.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          mockLogs.forEach((log, index) => {
            callback({
              id: log.id,
              data: () => log,
            });
          });
        },
      });
    });

    it('should export logs as CSV', async () => {
      const csv = await exportActivityLogs();

      expect(csv).toContain('ID,User ID,User Role,User Email,User Name,Action,Target,Target Type,Category,Severity,Success,Error Message,IP Address,User Agent,Store ID,Timestamp,Duration (ms)');
      expect(csv).toContain('log-1,user-123,store_owner,user@example.com,John Doe,add_product,product-123,product,product,medium,true,,192.168.1.1,Mozilla/5.0,store-123,2024-01-10T10:00:00Z,150');
    });

    it('should handle special characters in CSV', async () => {
      const logsWithSpecialChars = [
        {
          id: 'log-1',
          userId: 'user-123',
          userRole: 'store_owner',
          userEmail: 'user@example.com',
          userName: 'John "Doe"',
          action: 'add_product',
          target: 'product with "quotes"',
          targetType: 'product',
          category: 'product',
          severity: 'medium',
          success: true,
          errorMessage: 'Error with "quotes"',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          storeId: 'store-123',
          timestamp: '2024-01-10T10:00:00Z',
          duration: 150,
        },
      ];

      mockGet.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          logsWithSpecialChars.forEach((log, index) => {
            callback({
              id: log.id,
              data: () => log,
            });
          });
        },
      });

      const csv = await exportActivityLogs();

      expect(csv).toContain('"John ""Doe"""');
      expect(csv).toContain('"product with ""quotes"""');
      expect(csv).toContain('"Error with ""quotes"""');
    });
  });
}); 