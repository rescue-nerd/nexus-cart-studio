"use server";

import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';
import { stores, type Store } from "@/lib/placeholder-data";

type ActionResponse = {
  success: boolean;
  messageKey: string;
};

// Zod schema now defined in client component

export async function addStore(formData: FormData): Promise<ActionResponse> {
  const name = formData.get("name") as string;
  const ownerName = formData.get("ownerName") as string;
  const ownerEmail = formData.get("ownerEmail") as string;
  const domain = formData.get("domain") as string;

  // Basic server-side validation
  if (!name || !ownerName || !ownerEmail || !domain) {
    return {
      success: false,
      messageKey: "error.invalidFields",
    };
  }

  const fullDomain = `${domain}.nexuscart.com`;

  if (stores.some(s => s.domain === fullDomain)) {
    return { success: false, messageKey: "superadmin.newStore.toast.domainTaken" };
  }

  try {
    const newStore: Store = {
      id: `store_${Math.random().toString(36).substr(2, 9)}`,
      name,
      ownerName,
      ownerEmail,
      domain: fullDomain,
      status: 'Active',
      productCount: 0,
      orderCount: 0,
      planId: 'plan_basic',
      description: `Welcome to ${name}!`,
    };

    stores.push(newStore);
    revalidatePath("/admin");
    
  } catch (error) {
    console.error("Failed to add store:", error);
    return { success: false, messageKey: "error.unexpected" };
  }
  
  redirect('/admin');
}


export async function updateStoreStatus(storeId: string, status: Store['status']): Promise<ActionResponse> {
  try {
    const store = stores.find(s => s.id === storeId);
    if (!store) {
      return { success: false, messageKey: 'error.storeNotFound' };
    }
    
    store.status = status;
    revalidatePath('/admin');
    
    return { success: true, messageKey: 'superadmin.stores.toast.statusUpdated' };
  } catch (error) {
    console.error("Failed to update store status:", error);
    return { success: false, messageKey: 'superadmin.stores.toast.updateFailed' };
  }
}
