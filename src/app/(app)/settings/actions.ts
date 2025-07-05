"use server"

import { revalidatePath } from 'next/cache';
import { stores, plans } from '@/lib/placeholder-data';

export async function updateStorePlan(storeId: string, newPlanId: string): Promise<{ success: boolean; message?: string; newPlanName?: string; }> {
  try {
    const store = stores.find(s => s.id === storeId);
    const newPlan = plans.find(p => p.id === newPlanId);

    if (!store) {
      return { success: false, message: 'Store not found.' };
    }
    
    if (!newPlan) {
        return { success: false, message: 'Selected plan not found.' };
    }

    // In a real app, you would update the database and handle billing here.
    store.planId = newPlanId;
    
    // Revalidating the path will cause the server component data to be refetched on the next visit.
    revalidatePath('/settings');

    return { success: true, newPlanName: newPlan.name };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}
