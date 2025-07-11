import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/activity-logs/route';
import { GET as GETStats } from '@/app/api/activity-logs/stats/route';

// Mock the activity log functions
jest.mock('@/lib/activity-log', () => ({
  getActivityLogs: jest.fn(),
  getActivityLogStats: jest.fn(),
  exportActivityLogs: jest.fn(),
}));

// Mock auth utilities
jest.mock('@/lib/auth-utils', () => ({
  getAuthUserFromServerAction: jest.fn(),
}));

// Mock RBAC
jest.mock('@/lib/rbac', () => ({
  requireRole: jest.fn(),
}));

const { getActivityLogs, getActivityLogStats, exportActivityLogs } = require('@/lib/activity-log');
const { getAuthUserFromServerAction } = require('@/lib/auth-utils');
const { requireRole } = require('@/lib/rbac');

describe('Activity Logs API', () => {
  const mockUser = {
    uid: 'user-123',
    role: 'store_owner' as const,
    storeId: 'store-123',
  };

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
      timestamp: '2024-01-10T10:00:00Z',
      storeId: 'store-123',
    },
    {
      id: 'log-2',
      userId: 'user-456',
      userRole: 'super_admin',
      action: 'delete_product',
      target: 'product-456',
      targetType: 'product',
      category: 'product',
      severity: 'high',
      success: false,
      timestamp: '2024-01-10T11:00:00Z',
      storeId: 'store-123',
    },
  ];

  const mockStats = {
    totalLogs: 2,
    logsByCategory: { product: 2 },
    logsBySeverity: { medium: 1, high: 1 },
    logsByAction: { add_product: 1, delete_product: 1 },
    recentActivity: mockLogs.slice(0, 10),
    failedActions: 1,
    successRate: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuthUserFromServerAction.mockResolvedValue(mockUser);
    requireRole.mockImplementation(() => {});
    getActivityLogs.mockResolvedValue(mockLogs);
    getActivityLogStats.mockResolvedValue(mockStats);
    exportActivityLogs.mockResolvedValue('csv,data,here');
  });

  describe('GET /api/activity-logs', () => {
    it('should return logs with default parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/activity-logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockLogs);
      expect(data.count).toBe(2);
      expect(getActivityLogs).toHaveBeenCalledWith({});
    });

    it('should apply filters correctly', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/activity-logs?category=product&severity=high&success=false&limit=50'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(getActivityLogs).toHaveBeenCalledWith({
        category: 'product',
        severity: 'high',
        success: false,
        limit: 50,
      });
    });

    it('should filter by store for store owners', async () => {
      const storeOwnerUser = { ...mockUser, role: 'store_owner' as const, storeId: 'store-123' };
      getAuthUserFromServerAction.mockResolvedValue(storeOwnerUser);

      const request = new NextRequest('http://localhost:3000/api/activity-logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getActivityLogs).toHaveBeenCalledWith({
        storeId: 'store-123',
      });
    });

    it('should handle authentication errors', async () => {
      getAuthUserFromServerAction.mockRejectedValue(new Error('Not authenticated'));

      const request = new NextRequest('http://localhost:3000/api/activity-logs');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it('should handle authorization errors', async () => {
      requireRole.mockImplementation(() => {
        throw new Error('Forbidden');
      });

      const request = new NextRequest('http://localhost:3000/api/activity-logs');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it('should handle database errors', async () => {
      getActivityLogs.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/activity-logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch activity logs');
    });
  });

  describe('POST /api/activity-logs', () => {
    it('should export logs as CSV', async () => {
      const request = new NextRequest('http://localhost:3000/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          filter: {
            category: 'product',
            severity: 'high',
          },
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="activity-logs.csv"');
      expect(exportActivityLogs).toHaveBeenCalledWith({
        category: 'product',
        severity: 'high',
      });
    });

    it('should filter export by store for store owners', async () => {
      const storeOwnerUser = { ...mockUser, role: 'store_owner' as const, storeId: 'store-123' };
      getAuthUserFromServerAction.mockResolvedValue(storeOwnerUser);

      const request = new NextRequest('http://localhost:3000/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          filter: {},
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(exportActivityLogs).toHaveBeenCalledWith({
        storeId: 'store-123',
      });
    });

    it('should handle invalid action', async () => {
      const request = new NextRequest('http://localhost:3000/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invalid_action',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid action');
    });

    it('should handle export errors', async () => {
      exportActivityLogs.mockRejectedValue(new Error('Export error'));

      const request = new NextRequest('http://localhost:3000/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          filter: {},
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to export activity logs');
    });
  });

  describe('GET /api/activity-logs/stats', () => {
    it('should return stats with default parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/activity-logs/stats');
      const response = await GETStats(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
      expect(getActivityLogStats).toHaveBeenCalledWith({});
    });

    it('should apply filters to stats', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/activity-logs/stats?category=product&severity=high&dateFrom=2024-01-01&dateTo=2024-01-31'
      );
      const response = await GETStats(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(getActivityLogStats).toHaveBeenCalledWith({
        category: 'product',
        severity: 'high',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      });
    });

    it('should filter stats by store for store owners', async () => {
      const storeOwnerUser = { ...mockUser, role: 'store_owner' as const, storeId: 'store-123' };
      getAuthUserFromServerAction.mockResolvedValue(storeOwnerUser);

      const request = new NextRequest('http://localhost:3000/api/activity-logs/stats');
      const response = await GETStats(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getActivityLogStats).toHaveBeenCalledWith({
        storeId: 'store-123',
      });
    });

    it('should handle stats errors', async () => {
      getActivityLogStats.mockRejectedValue(new Error('Stats error'));

      const request = new NextRequest('http://localhost:3000/api/activity-logs/stats');
      const response = await GETStats(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch activity log stats');
    });
  });

  describe('Authorization', () => {
    it('should require super_admin or store_owner role', async () => {
      const unauthorizedUser = { ...mockUser, role: 'customer' as const };
      getAuthUserFromServerAction.mockResolvedValue(unauthorizedUser);

      const request = new NextRequest('http://localhost:3000/api/activity-logs');
      const response = await GET(request);

      expect(requireRole).toHaveBeenCalledWith(unauthorizedUser, 'super_admin', 'store_owner');
    });

    it('should handle missing user', async () => {
      getAuthUserFromServerAction.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/activity-logs');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Input Validation', () => {
    it('should validate boolean parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/activity-logs?success=invalid'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getActivityLogs).toHaveBeenCalledWith({
        success: false, // Should be false for invalid boolean
      });
    });

    it('should validate numeric parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/activity-logs?limit=invalid&offset=invalid'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getActivityLogs).toHaveBeenCalledWith({
        // Should not include invalid numeric parameters
      });
    });

    it('should handle empty parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/activity-logs?category=&severity=&search='
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getActivityLogs).toHaveBeenCalledWith({});
    });
  });
}); 