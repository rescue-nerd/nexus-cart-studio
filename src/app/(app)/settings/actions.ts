
"use server"

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { stores, plans } from '@/lib/placeholder-data';
import { suggestSeoKeywords } from '@/ai/flows/seo-keyword-suggestion';

type ActionResponse = {
  success: boolean;
  messageKey: string;
};

type PlanResponse = ActionResponse & {
  newPlanName?: string;
};

type KeywordsResponse = ActionResponse & {
  keywords?: string[];
};

// Zod schema now defined in client component

export async function updateStoreProfile(storeId: string, formData: FormData): Promise<ActionResponse> {
  const store = stores.find(s => s.id === storeId);
  if (!store) {
    return { success: false, messageKey: 'error.storeNotFound' };
  }
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name || name.length < 2) {
    return { success: false, messageKey: 'error.invalidFields' };
  }
  
  // In a real app, you'd update the database
  store.name = name;
  store.description = description;

  revalidatePath('/settings');
  revalidatePath('/dashboard'); // Name might be shown on dashboard
  
  return { success: true, messageKey: "settings.profile.toast.success" };
}

export async function updateStorePlan(storeId: string, newPlanId: string): Promise<PlanResponse> {
  try {
    const store = stores.find(s => s.id === storeId);
    const newPlan = plans.find(p => p.id === newPlanId);

    if (!store) {
      return { success: false, messageKey: 'error.storeNotFound' };
    }
    
    if (!newPlan) {
        return { success: false, messageKey: 'settings.billing.toast.planNotFound' };
    }

    // In a real app, you would update the database and handle billing here.
    store.planId = newPlanId;
    
    revalidatePath('/settings');

    return { success: true, messageKey: "settings.billing.toast.success", newPlanName: newPlan.name };
  } catch (error) {
    console.error("Failed to update store plan:", error);
    return { success: false, messageKey: 'error.unexpected' };
  }
}

export async function updateSeoSettings(storeId: string, data: { title: string; description: string; keywords: string; }): Promise<ActionResponse> {
  try {
    const store = stores.find(s => s.id === storeId);
    if (!store) {
      return { success: false, messageKey: 'error.storeNotFound' };
    }

    store.metaTitle = data.title;
    store.metaDescription = data.description;
    store.metaKeywords = data.keywords;

    revalidatePath('/store'); 
    revalidatePath('/settings');

    return { success: true, messageKey: 'settings.seo.toast.success' };
  } catch (error) {
    console.error("Failed to update SEO settings:", error);
    return { success: false, messageKey: 'settings.seo.toast.fail' };
  }
}

export async function suggestKeywordsAction(description: string): Promise<KeywordsResponse> {
    if (!description) {
        return { success: false, messageKey: 'settings.seo.toast.descriptionRequired' };
    }
    try {
        const result = await suggestSeoKeywords({ productCatalogDescription: description });
        return { success: true, messageKey: "settings.seo.toast.aiSuccess", keywords: result.keywords };
    } catch (error) {
        console.error("AI Keyword Suggestion Error:", error);
        return { success: false, messageKey: 'settings.seo.toast.aiFail' };
    }
}
