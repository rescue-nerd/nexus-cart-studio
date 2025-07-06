"use server";

import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';
import { z } from "zod";
import { stores, type Store } from "@/lib/placeholder-data";

const addStoreSchema = z.object({
  name: z.string().min(2, "Store name is required."),
  ownerName: z.string().min(2, "Owner name is required."),
  ownerEmail: z.string().email("A valid email is required."),
  domain: z.string().min(3, "Domain is required.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Domain can only contain lowercase letters, numbers, and hyphens."),
});

export async function addStore(formData: FormData): Promise<{ success: boolean, message?: string }> {
  const validatedFields = addStoreSchema.safeParse({
    name: formData.get("name"),
    ownerName: formData.get("ownerName"),
    ownerEmail: formData.get("ownerEmail"),
    domain: formData.get("domain"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }
  
  const { name, ownerName, ownerEmail, domain } = validatedFields.data;
  const fullDomain = `${domain}.nexuscart.com`;

  // Check if domain already exists
  if (stores.some(s => s.domain === fullDomain)) {
    return { success: false, message: "This subdomain is already taken." };
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
      planId: 'plan_basic', // Default to basic plan
      description: `Welcome to ${name}!`,
    };

    // In a real app, this would insert into a database.
    stores.push(newStore);
    
    revalidatePath("/admin");
    
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message };
  }
  
  redirect('/admin');
}


export async function updateStoreStatus(storeId: string, status: Store['status']): Promise<{ success: boolean; message?: string }> {
  try {
    const store = stores.find(s => s.id === storeId);
    if (!store) {
      return { success: false, message: 'Store not found.' };
    }
    
    // In a real app, you would update the database.
    store.status = status;
    
    revalidatePath('/admin');
    
    return { success: true, message: `Store status updated to ${status}.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}
