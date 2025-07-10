import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Plan } from '@/lib/types';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/plans/[id] - Get single plan
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const { id } = await params;
    const planDoc = await adminDb.collection('plans').doc(id).get();

    if (!planDoc.exists) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const plan: Plan = { id: planDoc.id, ...planDoc.data() } as Plan;
    return NextResponse.json({ plan });

  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}

// PUT /api/plans/[id] - Update plan (super_admin only)
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

    if (!userData || userData.role !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if plan exists
    const planDoc = await adminDb.collection('plans').doc(id).get();
    if (!planDoc.exists) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const body = await request.json();
    
    const updateData: Partial<Plan> = {
      updatedAt: new Date().toISOString()
    };

    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.billingCycle !== undefined) updateData.billingCycle = body.billingCycle;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.limits !== undefined) {
      updateData.limits = {
        maxProducts: Number(body.limits.maxProducts) || -1,
        maxOrders: Number(body.limits.maxOrders) || -1,
        maxStorage: Number(body.limits.maxStorage) || 1000,
        customDomain: Boolean(body.limits.customDomain),
        aiFeatures: Boolean(body.limits.aiFeatures),
        advancedAnalytics: Boolean(body.limits.advancedAnalytics),
        prioritySupport: Boolean(body.limits.prioritySupport)
      };
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    await adminDb.collection('plans').doc(id).update(updateData);

    const updatedDoc = await adminDb.collection('plans').doc(id).get();
    const updatedPlan: Plan = { id: updatedDoc.id, ...updatedDoc.data() } as Plan;

    return NextResponse.json({ plan: updatedPlan });

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

// DELETE /api/plans/[id] - Delete plan (super_admin only)
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

    if (!userData || userData.role !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if plan exists
    const planDoc = await adminDb.collection('plans').doc(id).get();
    if (!planDoc.exists) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if plan is in use by any stores
    const storesSnapshot = await adminDb
      .collection('stores')
      .where('planId', '==', id)
      .limit(1)
      .get();

    if (!storesSnapshot.empty) {
      return NextResponse.json({ 
        error: 'Cannot delete plan that is currently in use by stores' 
      }, { status: 400 });
    }

    // Check if plan has active subscriptions
    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .where('planId', '==', id)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!subscriptionsSnapshot.empty) {
      return NextResponse.json({ 
        error: 'Cannot delete plan with active subscriptions' 
      }, { status: 400 });
    }

    await adminDb.collection('plans').doc(id).delete();

    return NextResponse.json({ message: 'Plan deleted successfully' });

  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
