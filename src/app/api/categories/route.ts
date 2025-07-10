import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Category } from '@/lib/types';
import { requirePermission } from '@/lib/rbac';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';

// GET /api/categories - List all active categories
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = adminDb.collection('categories');
    
    // Filter by store (global categories have no storeId)
    if (storeId) {
      query = query.where('storeId', 'in', [storeId, null]) as any;
    } else {
      query = query.where('storeId', '==', null) as any;
    }

    // Filter by active status
    if (!includeInactive) {
      query = query.where('isActive', '==', true) as any;
    }

    // Order by display order
    query = query.orderBy('displayOrder') as any;

    const snapshot = await query.get();
    const categories: Category[] = [];

    snapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });

    return NextResponse.json({ categories });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Get session and validate permissions
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session and get user role
    const decodedToken = await admin.auth().verifySessionCookie(session);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions (super_admin or store_owner for their store)
    const body = await request.json();
    const { storeId } = body;

    if (userData.role !== 'super_admin') {
      if (userData.role !== 'store_owner' || userData.storeId !== storeId) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Get next display order
    const maxOrderSnapshot = await adminDb
      .collection('categories')
      .orderBy('displayOrder', 'desc')
      .limit(1)
      .get();

    const nextOrder = maxOrderSnapshot.empty ? 1 : maxOrderSnapshot.docs[0].data().displayOrder + 1;

    const categoryData: Omit<Category, 'id'> = {
      name: body.name,
      description: body.description || '',
      parentCategoryId: body.parentCategoryId || null,
      imageUrl: body.imageUrl || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || nextOrder,
      storeId: storeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('categories').add(categoryData);
    const newCategory: Category = { id: docRef.id, ...categoryData };

    return NextResponse.json({ category: newCategory }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
