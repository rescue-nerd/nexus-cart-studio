
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';
import { addStore as addStoreToDb, getAllStores, updateStore, getStore } from "@/lib/firebase-service";
import type { Store } from '@/lib/types';

type ActionResponse = {
  success: boolean;
  messageKey: string;
};

export async function addStore(formData: FormData): Promise<ActionResponse> {
  const name = formData.get("name") as string;
  const ownerName = formData.get("ownerName") as string;
  const ownerEmail = formData.get("ownerEmail") as string;
  const domain = formData.get("domain") as string;
  const userId = formData.get("userId") as string; // This should be retrieved from a secure session

  if (!name || !ownerName || !ownerEmail || !domain || !userId) {
    return {
      success: false,
      messageKey: "error.invalidFields",
    };
  }

  const fullDomain = `${domain}.nexuscart.com`;
  
  const allStores = await getAllStores();
  if (allStores.some(s => s.domain === fullDomain)) {
    return { success: false, messageKey: "superadmin.newStore.toast.domainTaken" };
  }

  try {
    const newStoreData = {
      name,
      ownerName,
      ownerEmail,
      userId,
      domain: fullDomain,
      status: 'Active' as const,
      planId: 'plan_basic',
      description: `Welcome to ${name}!`,
    };

    await addStoreToDb(newStoreData);
    revalidatePath("/admin");
    
  } catch (error) {
    console.error("Failed to add store:", error);
    return { success: false, messageKey: "error.unexpected" };
  }
  
  redirect('/admin');
}


export async function updateStoreStatus(storeId: string, status: Store['status']): Promise<ActionResponse> {
  try {
    const store = await getStore(storeId);
    if (!store) {
      return { success: false, messageKey: 'error.storeNotFound' };
    }
    
    await updateStore(storeId, { status });
    revalidatePath('/admin');
    
    return { success: true, messageKey: 'superadmin.stores.toast.statusUpdated' };
  } catch (error) {
    console.error("Failed to update store status:", error);
    return { success: false, messageKey: 'superadmin.stores.toast.updateFailed' };
  }
}
