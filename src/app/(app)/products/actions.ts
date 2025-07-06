
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

const productSchemaForUpdate = productSchema.extend({
  image: z.instanceof(File).optional(),
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
    const imageFile = formData.get('file') as File;
    if (!imageFile || imageFile.size === 0) {
      return { success: false, message: 'Product image is required.' };
    }

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


export async function updateProduct(productId: string, formData: FormData): Promise<{ success: boolean; message?: string }> {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    return { success: false, message: "Store ID is missing." };
  }
  
  const productIndex = allProducts.findIndex(p => p.id === productId && p.storeId === storeId);

  if (productIndex === -1) {
    return { success: false, message: "Product not found." };
  }

  const validatedFields = productSchemaForUpdate.safeParse({
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
    let imageUrl = allProducts[productIndex].imageUrl;
    const imageFile = formData.get('file') as File;

    if (imageFile && imageFile.size > 0) {
      // If a new image is uploaded, upload it and get the new URL
      const { url } = await uploadImage(formData);
      imageUrl = url;
    }
    
    // Update the product in the placeholder data array
    allProducts[productIndex] = {
      ...allProducts[productIndex],
      name,
      description,
      price,
      stock,
      imageUrl,
    };

    revalidatePath("/products");
    revalidatePath(`/products/edit/${productId}`);

  } catch (error) {
    console.error("Failed to update product:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message };
  }
  
  redirect('/products');
  return { success: true }; 
}

export async function deleteProduct(productId: string): Promise<{ success: boolean, message?: string }> {
    const headersList = headers();
    const storeId = headersList.get('x-store-id');

    if (!storeId) {
        return { success: false, message: "Store ID is missing." };
    }

    const productIndex = allProducts.findIndex(p => p.id === productId && p.storeId === storeId);

    if (productIndex === -1) {
        return { success: false, message: 'Product not found.' };
    }

    try {
        // In a real app, you would delete from the database.
        // For now, we splice from the placeholder data array.
        allProducts.splice(productIndex, 1);
        revalidatePath("/products");
        return { success: true, message: "Product deleted successfully." };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}
