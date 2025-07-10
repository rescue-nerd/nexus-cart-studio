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
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch category';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
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
    await logActivity(user, 'update_category', params.id, { updates: body }, { headers: Object.fromEntries(request.headers.entries()) });

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error: unknown) {
    let errorMessage = 'Failed to update category';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    await logActivity(user, 'update_category_failed', params.id, { error: errorMessage }, { headers: Object.fromEntries(request.headers.entries()) });
    return NextResponse.json(
      { success: false, error: errorMessage },
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
    await logActivity(user, 'delete_category', params.id, {}, { headers: Object.fromEntries(request.headers.entries()) });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: unknown) {
    let errorMessage = 'Failed to delete category';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    await logActivity(user, 'delete_category_failed', params.id, { error: errorMessage }, { headers: Object.fromEntries(request.headers.entries()) });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
