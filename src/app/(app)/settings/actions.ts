
"use server"

import { revalidatePath } from 'next/cache';
import { updateStore, getStore } from '@/lib/firebase-service';
import { suggestSeoKeywords } from '@/ai/flows/seo-keyword-suggestion';
import { getPlans } from '@/lib/firebase-service';
import type { PaymentSettings, Store } from '@/lib/types';
import { uploadImage } from '@/lib/storage-service';

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

export async function updateStoreProfile(storeId: string, formData: FormData): Promise<ActionResponse> {
  const store = await getStore(storeId);
  if (!store) {
    return { success: false, messageKey: 'error.storeNotFound' };
  }
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string;

  if (!name || name.length < 2) {
    return { success: false, messageKey: 'error.invalidFields' };
  }
  
  await updateStore(storeId, { name, description, whatsappNumber });

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  
  return { success: true, messageKey: "settings.profile.toast.success" };
}

export async function updateStorePlan(storeId: string, newPlanId: string): Promise<PlanResponse> {
  try {
    const store = await getStore(storeId);
    const plans = await getPlans();
    const newPlan = plans.find(p => p.id === newPlanId);

    if (!store) {
      return { success: false, messageKey: 'error.storeNotFound' };
    }
    
    if (!newPlan) {
        return { success: false, messageKey: 'settings.billing.toast.planNotFound' };
    }

    await updateStore(storeId, { planId: newPlanId });
    
    revalidatePath('/settings');

    return { success: true, messageKey: "settings.billing.toast.success", newPlanName: newPlan.id };
  } catch (error) {
    console.error("Failed to update store plan:", error);
    return { success: false, messageKey: 'error.unexpected' };
  }
}

export async function updatePaymentSettings(storeId: string, formData: FormData): Promise<ActionResponse> {
    try {
        const store = await getStore(storeId);
        if (!store) {
            return { success: false, messageKey: 'error.storeNotFound' };
        }

        const qrCodeFile = formData.get('qrCode') as File;
        let qrCodeUrl = store.paymentSettings?.qrCodeUrl;

        if (qrCodeFile && qrCodeFile.size > 0) {
            const { url } = await uploadImage(formData, 'qrCode');
            qrCodeUrl = url;
        }

        const paymentSettings: PaymentSettings = {
            ...store.paymentSettings,
            qrCodeUrl: qrCodeUrl,
            bankDetails: {
                bankName: formData.get('bankName') as string,
                accountName: formData.get('accountName') as string,
                accountNumber: formData.get('accountNumber') as string,
                branch: formData.get('branch') as string,
            },
            khaltiSecretKey: formData.get('khaltiSecretKey') as string,
            khaltiTestMode: formData.get('khaltiTestMode') === 'on',
            eSewaMerchantCode: formData.get('eSewaMerchantCode') as string,
            eSewaSecretKey: formData.get('eSewaSecretKey') as string,
            eSewaTestMode: formData.get('eSewaTestMode') === 'on',
        };

        await updateStore(storeId, { paymentSettings });
        revalidatePath('/settings');
        return { success: true, messageKey: 'settings.payments.toast.success' };

    } catch (error) {
        console.error("Failed to update payment settings:", error);
        return { success: false, messageKey: 'settings.payments.toast.fail' };
    }
}

export async function updateSeoSettings(storeId: string, data: { title: string; description: string; keywords: string; }): Promise<ActionResponse> {
  try {
    const store = await getStore(storeId);
    if (!store) {
      return { success: false, messageKey: 'error.storeNotFound' };
    }

    await updateStore(storeId, {
        metaTitle: data.title,
        metaDescription: data.description,
        metaKeywords: data.keywords,
    });

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
