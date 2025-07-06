"use server";

import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';
import { z } from "zod";
import { stores, type Store } from "@/lib/placeholder-data";

type ActionResponse = {
  success: boolean;
  messageKey: string;
};

const addStoreSchema = z.object({
  name: z.string().min(2, "Store name is required."),
  ownerName: z.string().min(2, "Owner name is required."),
  ownerEmail: z.string().email("A valid email is required."),
  domain: z.string().min(3, "Domain is required.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Domain can only contain lowercase letters, numbers, and hyphens."),
});

export async function addStore(formData: FormData): Promise<ActionResponse> {
  const validatedFields = addStoreSchema.safeParse({
    name: formData.get("name"),
    ownerName: formData.get("ownerName"),
    ownerEmail: formData.get("ownerEmail"),
    domain: formData.get("domain"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      messageKey: "error.invalidFields",
    };
  }
  
  const { name, ownerName, ownerEmail, domain } = validatedFields.data;
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
