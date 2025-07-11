import { NextRequest, NextResponse } from 'next/server';
import { getActivityLogStats, type ActivityLogFilter } from '@/lib/activity-log';
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

    // Validate filter
    const validatedFilter = filterSchema.parse(filter);

    // For store owners, only show their store's stats
    if (user.role === 'store_owner' && user.storeId) {
      validatedFilter.storeId = user.storeId;
    }

    const stats = await getActivityLogStats(validatedFilter);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Failed to fetch activity log stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity log stats' },
      { status: 500 }
    );
  }
} 