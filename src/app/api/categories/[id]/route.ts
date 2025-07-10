import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/category-service';
import type { CategoryUpdate } from '@/lib/types';
import { logActivity } from '@/lib/activity-log';
import { getAuthUserFromRequest } from '@/lib/auth-utils';
import { requireRole } from '@/lib/rbac';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const category = await CategoryService.getCategory(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  let user = null;
  try {
    user = await getAuthUserFromRequest(request);
    requireRole(user, 'super_admin', 'store_owner');
    const body = await request.json();
    const updates: CategoryUpdate = body;

    // Validate required fields
    if (updates.name !== undefined && !updates.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name cannot be empty' },
        { status: 400 }
      );
    }

    const updatedCategory = await CategoryService.updateCategory(params.id, body);
    await logActivity(user, 'update_category', params.id, { updates: body }, request);

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error) {
    await logActivity(user, 'update_category_failed', params.id, { error: error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error) }, request);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  let user = null;
  try {
    user = await getAuthUserFromRequest(request);
    requireRole(user, 'super_admin', 'store_owner');
    
    // Check if category has products before deleting
    const category = await CategoryService.getCategory(params.id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.productCount && category.productCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with existing products' },
        { status: 400 }
      );
    }

    await CategoryService.deleteCategory(params.id);
    await logActivity(user, 'delete_category', params.id, {}, request);

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    await logActivity(user, 'delete_category_failed', params.id, { error: error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error) }, request);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
