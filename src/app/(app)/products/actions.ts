"use server";

import { headers } from "next/headers";
import { redirect } from 'next/navigation'
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadImage } from "@/lib/storage-service";
import { products as allProducts } from "@/lib/placeholder-data";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
});

export async function addProduct(formData: FormData): Promise<{ success: boolean; message?: string }> {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    return { success: false, message: "Store ID is missing." };
  }

  const validatedFields = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.flatten().fieldErrors.toString(),
    };
  }
  
  const { name, description, price, stock } = validatedFields.data;

  try {
    const { url: imageUrl } = await uploadImage(formData);

    // In a real app, you would save this to a database.
    // For now, we push to the placeholder data array.
    const newProduct = {
      id: `prod_${Math.random().toString(36).substr(2, 9)}`,
      storeId,
      name,
      description,
      price,
      stock,
      imageUrl,
      category: "Uncategorized", // Default category
      sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };
    allProducts.unshift(newProduct);
    
    revalidatePath("/products");
    
  } catch (error) {
    console.error("Failed to add product:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message };
  }
  
  redirect('/products');
  // This return is technically unreachable due to redirect, but satisfies TypeScript
  return { success: true }; 
}
