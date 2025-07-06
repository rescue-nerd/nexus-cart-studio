
"use server";

import { headers } from "next/headers";
import { redirect } from 'next/navigation'
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/storage-service";
import { products as allProducts } from "@/lib/placeholder-data";
import { generateProductDescription } from "@/ai/flows/product-description-generator";

type ActionResponse = {
  success: boolean;
  messageKey: string;
  productName?: string;
};

type DescriptionResponse = {
  success: boolean;
  messageKey: string;
  description?: string;
}

// Zod schemas are now defined in the client components to access the translation hook.

export async function addProduct(formData: FormData): Promise<ActionResponse> {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    return { success: false, messageKey: "error.storeIdMissing" };
  }
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  // Basic server-side check for presence, detailed validation is on the client
  if (!name || !description || isNaN(price) || isNaN(stock)) {
      return { success: false, messageKey: "error.invalidFields" };
  }
  
  try {
    const imageFile = formData.get('file') as File;
    if (!imageFile || imageFile.size === 0) {
      return { success: false, messageKey: 'products.toast.imageRequired' };
    }

    const { url: imageUrl } = await uploadImage(formData);

    const newProduct = {
      id: `prod_${Math.random().toString(36).substr(2, 9)}`,
      storeId,
      name,
      description,
      price,
      stock,
      imageUrl,
      category: "Uncategorized",
      sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };
    allProducts.unshift(newProduct);
    
    revalidatePath("/products");
    
  } catch (error) {
    console.error("Failed to add product:", error);
    return { success: false, messageKey: "error.unexpected" };
  }
  
  redirect('/products');
  // This return is technically unreachable due to redirect, but satisfies TypeScript
  return { success: true, messageKey: "products.toast.addSuccess" , productName: name }; 
}


export async function updateProduct(productId: string, formData: FormData): Promise<ActionResponse> {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    return { success: false, messageKey: "error.storeIdMissing" };
  }
  
  const productIndex = allProducts.findIndex(p => p.id === productId && p.storeId === storeId);

  if (productIndex === -1) {
    return { success: false, messageKey: "error.productNotFound" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  if (!name || !description || isNaN(price) || isNaN(stock)) {
      return { success: false, messageKey: "error.invalidFields" };
  }

  try {
    let imageUrl = allProducts[productIndex].imageUrl;
    const imageFile = formData.get('file') as File;

    if (imageFile && imageFile.size > 0) {
      const { url } = await uploadImage(formData);
      imageUrl = url;
    }
    
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
    return { success: false, messageKey: "error.unexpected" };
  }
  
  redirect('/products');
  return { success: true, messageKey: 'products.toast.updateSuccess' }; 
}

export async function deleteProduct(productId: string): Promise<ActionResponse> {
    const headersList = headers();
    const storeId = headersList.get('x-store-id');

    if (!storeId) {
        return { success: false, messageKey: "error.storeIdMissing" };
    }

    const productIndex = allProducts.findIndex(p => p.id === productId && p.storeId === storeId);

    if (productIndex === -1) {
        return { success: false, messageKey: 'error.productNotFound' };
    }

    try {
        allProducts.splice(productIndex, 1);
        revalidatePath("/products");
        return { success: true, messageKey: "productActions.toast.deletedSuccess" };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, messageKey: "error.unexpected" };
    }
}


export async function generateDescriptionAction(
  productName: string
): Promise<DescriptionResponse> {
  if (!productName) {
    return { success: false, messageKey: "products.toast.nameRequired" };
  }

  try {
    const result = await generateProductDescription({ productName });
    if (result.description) {
      return { success: true, description: result.description, messageKey: "products.toast.aiSuccess" };
    } else {
      return { success: false, messageKey: "products.toast.aiFail" };
    }
  } catch (error) {
    console.error("AI Description Generation Error:", error);
    return { success: false, messageKey: "error.unexpected" };
  }
}
