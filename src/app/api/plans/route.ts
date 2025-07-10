import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Plan } from '@/lib/types';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';

// GET /api/plans - List all active plans
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = adminDb.collection('plans');

    // Filter by active status
    if (!includeInactive) {
      query = query.where('isActive', '==', true) as any;
    }

    // Order by display order
    query = query.orderBy('displayOrder') as any;

    const snapshot = await query.get();
    const plans: Plan[] = [];

    snapshot.forEach(doc => {
      plans.push({ id: doc.id, ...doc.data() } as Plan);
    });

    return NextResponse.json({ plans });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

// POST /api/plans - Create new plan (super_admin only)
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

    const decodedToken = await admin.auth().verifySessionCookie(session);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.price || !body.features || !body.limits) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, price, features, limits' 
      }, { status: 400 });
    }

    // Get next display order
    const maxOrderSnapshot = await adminDb
      .collection('plans')
      .orderBy('displayOrder', 'desc')
      .limit(1)
      .get();

    const nextOrder = maxOrderSnapshot.empty ? 1 : maxOrderSnapshot.docs[0].data().displayOrder + 1;

    const planData: Omit<Plan, 'id'> = {
      name: body.name,
      price: Number(body.price),
      billingCycle: body.billingCycle || 'monthly',
      features: body.features,
      limits: {
        maxProducts: Number(body.limits.maxProducts) || -1,
        maxOrders: Number(body.limits.maxOrders) || -1,
        maxStorage: Number(body.limits.maxStorage) || 1000,
        customDomain: Boolean(body.limits.customDomain),
        aiFeatures: Boolean(body.limits.aiFeatures),
        advancedAnalytics: Boolean(body.limits.advancedAnalytics),
        prioritySupport: Boolean(body.limits.prioritySupport)
      },
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || nextOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('plans').add(planData);
    const newPlan: Plan = { id: docRef.id, ...planData };

    return NextResponse.json({ plan: newPlan }, { status: 201 });

  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
