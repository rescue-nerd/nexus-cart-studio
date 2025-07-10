
"use server";

import { redirect } from 'next/navigation'
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/storage-service";
import { addProduct as addProductToDb, deleteProduct as deleteProductFromDb, getProduct, updateProduct as updateProductInDb } from "@/lib/firebase-service";
import { generateProductDescription } from "@/ai/flows/product-description-generator";
import { requireRole, requireStoreOwnership } from '@/lib/rbac';
import { getAuthUserFromServerAction } from '@/lib/auth-utils';

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

export async function addProduct(formData: FormData): Promise<ActionResponse> {
  const user = await getAuthUserFromServerAction();
  requireRole(user, 'super_admin', 'store_owner');
  const storeId = user.storeId;

  if (!storeId) {
    return { success: false, messageKey: "error.storeIdMissing" };
  }
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

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
      storeId,
      name,
      description,
      price,
      stock,
      imageUrl,
      category: "Uncategorized", // TODO: Implement category selection
      sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };
    
    await addProductToDb(newProduct);
    
    revalidatePath("/products");
    
  } catch (error) {
    console.error("Failed to add product:", error);
    return { success: false, messageKey: "error.unexpected" };
  }
  
  redirect('/products');
}


export async function updateProduct(productId: string, formData: FormData): Promise<ActionResponse> {
  const user = await getAuthUserFromServerAction();
  requireRole(user, 'super_admin', 'store_owner');
  const product = await getProduct(productId);
  if (!product) {
    return { success: false, messageKey: 'error.productNotFound' };
  }
  requireStoreOwnership(user, product.storeId);

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  if (!name || !description || isNaN(price) || isNaN(stock)) {
    return { success: false, messageKey: "error.invalidFields" };
  }

  try {
    const imageFile = formData.get('file') as File;
    let imageUrl = product.imageUrl;
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadImage(formData);
      imageUrl = uploadResult.url;
    }

    const updatedProduct = {
      name,
      description,
      price,
      stock,
      imageUrl,
      // Add other fields as needed
    };

    await updateProductInDb(productId, updatedProduct);
    revalidatePath("/products");
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, messageKey: "error.unexpected" };
  }

  redirect('/products');
}

export async function deleteProduct(productId: string): Promise<ActionResponse> {
    const user = await getAuthUserFromServerAction();
    requireRole(user, 'super_admin', 'store_owner');
    const storeId = user.storeId;

    if (!storeId) {
        return { success: false, messageKey: "error.storeIdMissing" };
    }

    const product = await getProduct(productId);
    if (!product || product.storeId !== storeId) {
        return { success: false, messageKey: 'error.productNotFound' };
    }

    try {
        await deleteProductFromDb(productId, storeId);
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
