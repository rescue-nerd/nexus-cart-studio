"use server"

import { revalidatePath } from 'next/cache';
import { stores, plans } from '@/lib/placeholder-data';
import { suggestSeoKeywords } from '@/ai/flows/seo-keyword-suggestion';

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

export async function updateSeoSettings(storeId: string, data: { title: string; description: string; keywords: string; }): Promise<{ success: boolean, message?: string }> {
  try {
    const store = stores.find(s => s.id === storeId);
    if (!store) {
      return { success: false, message: 'Store not found.' };
    }

    // In a real app, this would update the database.
    store.metaTitle = data.title;
    store.metaDescription = data.description;
    store.metaKeywords = data.keywords;

    revalidatePath('/store'); // Revalidate the public storefront
    revalidatePath('/settings'); // Revalidate the settings page

    return { success: true, message: 'SEO settings updated successfully.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}

export async function suggestKeywordsAction(description: string): Promise<{ success: boolean; keywords?: string[]; message?: string; }> {
    if (!description) {
        return { success: false, message: 'A store description is needed to suggest keywords.' };
    }
    try {
        const result = await suggestSeoKeywords({ productCatalogDescription: description });
        return { success: true, keywords: result.keywords };
    } catch (error) {
        console.error("AI Keyword Suggestion Error:", error);
        return { success: false, message: 'Failed to suggest keywords. Please try again.' };
    }
}
