import { NextRequest, NextResponse } from 'next/server';
import { PlanService } from '@/lib/plan-service';
import type { PlanInput } from '@/lib/types';
import { requireRole } from '@/lib/rbac';
import { getAuthUserFromRequest } from '@/lib/auth-utils';
import { logActivity } from '@/lib/activity-log';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const billingCycle = searchParams.get('billingCycle') as 'monthly' | 'yearly' | null;

    let plans;
    
    if (billingCycle) {
      plans = await PlanService.getPlansByBillingCycle(billingCycle);
    } else {
      plans = await PlanService.getAllPlans(activeOnly);
    }

    return NextResponse.json({ success: true, data: plans });
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch plans';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let user = null;
  try {
    user = await getAuthUserFromRequest(request);
    requireRole(user, 'super_admin');
    const body = await request.json();
    const planData: PlanInput = body;

    // Validate required fields
    if (!planData.name) {
      return NextResponse.json(
        { success: false, error: 'Plan name is required' },
        { status: 400 }
      );
    }

    if (!planData.price || planData.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Plan price must be greater than 0' },
        { status: 400 }
      );
    }

    // Set default values
    const newPlanData: PlanInput = {
      name: planData.name,
      price: planData.price,
      billingCycle: planData.billingCycle || 'monthly',
      features: planData.features || [],
      limits: planData.limits || {
        maxProducts: 0,
        maxOrders: 0,
        maxStorage: 0,
        customDomain: false,
        aiFeatures: false,
        advancedAnalytics: false,
        prioritySupport: false,
      },
      isActive: planData.isActive !== undefined ? planData.isActive : true,
      displayOrder: planData.displayOrder || 1,
    };

    const plan = await PlanService.createPlan(newPlanData);
    await logActivity(user, 'create_plan', plan.id, { plan: newPlanData }, { headers: Object.fromEntries(request.headers.entries()) });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error: unknown) {
    let errorMessage = 'Failed to create plan';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    await logActivity(user, 'create_plan_failed', '-', { error: errorMessage }, { headers: Object.fromEntries(request.headers.entries()) });
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
