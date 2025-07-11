import { NextRequest, NextResponse } from 'next/server';
import { getActivityLogs, exportActivityLogs, type ActivityLogFilter } from '@/lib/activity-log';
import { getAuthUserFromServerAction } from '@/lib/auth-utils';
import { requireRole } from '@/lib/rbac';
import { z } from 'zod';

const filterSchema = z.object({
  userId: z.string().optional(),
  userRole: z.string().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  category: z.string().optional(),
  severity: z.string().optional(),
  success: z.boolean().optional(),
  storeId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromServerAction();
    requireRole(user, 'super_admin', 'store_owner');

    const { searchParams } = new URL(request.url);
    const filter: ActivityLogFilter = {};

    // Parse filter parameters
    if (searchParams.get('userId')) filter.userId = searchParams.get('userId')!;
    if (searchParams.get('userRole')) filter.userRole = searchParams.get('userRole')!;
    if (searchParams.get('action')) filter.action = searchParams.get('action')!;
    if (searchParams.get('targetType')) filter.targetType = searchParams.get('targetType')!;
    if (searchParams.get('category')) filter.category = searchParams.get('category')!;
    if (searchParams.get('severity')) filter.severity = searchParams.get('severity')!;
    if (searchParams.get('success')) filter.success = searchParams.get('success') === 'true';
    if (searchParams.get('storeId')) filter.storeId = searchParams.get('storeId')!;
    if (searchParams.get('dateFrom')) filter.dateFrom = searchParams.get('dateFrom')!;
    if (searchParams.get('dateTo')) filter.dateTo = searchParams.get('dateTo')!;
    if (searchParams.get('search')) filter.search = searchParams.get('search')!;
    if (searchParams.get('limit')) filter.limit = parseInt(searchParams.get('limit')!);
    if (searchParams.get('offset')) filter.offset = parseInt(searchParams.get('offset')!);

    // Validate filter
    const validatedFilter = filterSchema.parse(filter);

    // For store owners, only show their store's logs
    if (user.role === 'store_owner' && user.storeId) {
      validatedFilter.storeId = user.storeId;
    }

    const logs = await getActivityLogs(validatedFilter);

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromServerAction();
    requireRole(user, 'super_admin', 'store_owner');

    const body = await request.json();
    const { action } = body;

    if (action === 'export') {
      const filter: ActivityLogFilter = body.filter || {};
      
      // For store owners, only export their store's logs
      if (user.role === 'store_owner' && user.storeId) {
        filter.storeId = user.storeId;
      }

      const csvData = await exportActivityLogs(filter);
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="activity-logs.csv"',
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to export activity logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export activity logs' },
      { status: 500 }
    );
  }
} 