import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Category } from '@/lib/types';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/categories/[id] - Get single category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const { id } = await params;
    const categoryDoc = await adminDb.collection('categories').doc(id).get();

    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const category: Category = { id: categoryDoc.id, ...categoryDoc.data() } as Category;
    return NextResponse.json({ category });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const { id } = await params;
    
    // Get session and validate permissions
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifySessionCookie(session);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get existing category to check permissions
    const categoryDoc = await adminDb.collection('categories').doc(id).get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const existingCategory = categoryDoc.data() as Category;

    // Check permissions
    if (userData.role !== 'super_admin') {
      if (userData.role !== 'store_owner' || userData.storeId !== existingCategory.storeId) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    const body = await request.json();
    
    const updateData: Partial<Category> = {
      updatedAt: new Date().toISOString()
    };

    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.parentCategoryId !== undefined) updateData.parentCategoryId = body.parentCategoryId;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    await adminDb.collection('categories').doc(id).update(updateData);

    const updatedDoc = await adminDb.collection('categories').doc(id).get();
    const updatedCategory: Category = { id: updatedDoc.id, ...updatedDoc.data() } as Category;

    return NextResponse.json({ category: updatedCategory });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const { id } = await params;
    
    // Get session and validate permissions
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifySessionCookie(session);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get existing category to check permissions
    const categoryDoc = await adminDb.collection('categories').doc(id).get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const existingCategory = categoryDoc.data() as Category;

    // Check permissions
    if (userData.role !== 'super_admin') {
      if (userData.role !== 'store_owner' || userData.storeId !== existingCategory.storeId) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Check if category has products
    const productsSnapshot = await adminDb
      .collection('products')
      .where('category', '==', id)
      .limit(1)
      .get();

    if (!productsSnapshot.empty) {
      return NextResponse.json({ 
        error: 'Cannot delete category with existing products. Please move or delete products first.' 
      }, { status: 400 });
    }

    // Check if category has subcategories
    const subcategoriesSnapshot = await adminDb
      .collection('categories')
      .where('parentCategoryId', '==', id)
      .limit(1)
      .get();

    if (!subcategoriesSnapshot.empty) {
      return NextResponse.json({ 
        error: 'Cannot delete category with subcategories. Please delete subcategories first.' 
      }, { status: 400 });
    }

    await adminDb.collection('categories').doc(id).delete();

    return NextResponse.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
