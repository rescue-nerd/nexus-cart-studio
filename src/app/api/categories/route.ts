import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/category-service';
import type { CategoryInput } from '@/lib/types';
import { logActivity } from '@/lib/activity-log';
import { getAuthUserFromRequest } from '@/lib/auth-utils';
import { requireRole } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const includeCounts = searchParams.get('includeCounts') === 'true';

    let categories;
    
    if (includeCounts) {
      categories = await CategoryService.getCategoriesWithCounts(storeId ?? undefined);
    } else {
      categories = await CategoryService.getAllCategories(storeId ?? undefined, activeOnly);
    }

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let user = null;
  try {
    user = await getAuthUserFromRequest(request);
    requireRole(user, 'super_admin', 'store_owner');
    const body = await request.json();
    const categoryData: CategoryInput = body;

    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Set default values
    const newCategoryData: CategoryInput = {
      name: categoryData.name,
      description: categoryData.description || '',
      parentCategoryId: categoryData.parentCategoryId || null,
      imageUrl: categoryData.imageUrl || '',
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      displayOrder: categoryData.displayOrder || 1,
      storeId: categoryData.storeId || null,
    };

    const newCategory = await CategoryService.createCategory(newCategoryData);
    await logActivity(user, 'create_category', String(newCategory.id || ''), { category: newCategory }, request);

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error) {
    await logActivity(user, 'create_category_failed', String(''), { error: error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error) }, request);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
