import { NextRequest, NextResponse } from 'next/server';
import { PlanService } from '@/lib/plan-service';
import type { PlanUpdate } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const plan = await PlanService.getPlan(id);

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const updates: PlanUpdate = body;

    // Validate required fields
    if (updates.name !== undefined && !updates.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Plan name cannot be empty' },
        { status: 400 }
      );
    }

    if (updates.price !== undefined && updates.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Plan price must be greater than 0' },
        { status: 400 }
      );
    }

    await PlanService.updatePlan(id, updates);

    return NextResponse.json({ success: true, message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Check if plan exists before deleting
    const plan = await PlanService.getPlan(id);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    await PlanService.deletePlan(id);

    return NextResponse.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
