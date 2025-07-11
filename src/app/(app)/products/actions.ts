
"use server";

import { redirect } from 'next/navigation'
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/storage-service";
import { addProduct as addProductToDb, deleteProduct as deleteProductFromDb, getProduct, updateProduct as updateProductInDb } from "@/lib/firebase-service";
import { generateProductDescription } from "@/ai/flows/product-description-generator";
import { requireRole, requireStoreOwnership } from '@/lib/rbac';
import { getAuthUserFromServerAction } from '@/lib/auth-utils';
import { logUserAction, logFailedAction } from '@/lib/activity-log';

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
    await logFailedAction(user, 'add_product', '-', 'Store ID missing');
    return { success: false, messageKey: "error.storeIdMissing" };
  }
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  if (!name || !description || isNaN(price) || isNaN(stock)) {
    await logFailedAction(user, 'add_product', '-', 'Invalid form data');
    return { success: false, messageKey: "error.invalidFields" };
  }
  
  try {
    const imageFile = formData.get('file') as File;
    if (!imageFile || imageFile.size === 0) {
      await logFailedAction(user, 'add_product', '-', 'Image file required');
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
    await logUserAction(user, 'add_product', name, { 
      product: newProduct,
      storeId 
    }, undefined, {
      category: 'product',
      severity: 'medium',
      targetType: 'product',
      storeId,
    });
    
    revalidatePath("/products");
    
  } catch (error: unknown) {
    const errorMessage = error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
    await logFailedAction(user, 'add_product', name, errorMessage, { 
      product: { name, description, price, stock },
      storeId 
    });
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
    await logFailedAction(user, 'update_product', productId, 'Product not found');
    return { success: false, messageKey: 'error.productNotFound' };
  }
  requireStoreOwnership(user, product.storeId);

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  if (!name || !description || isNaN(price) || isNaN(stock)) {
    await logFailedAction(user, 'update_product', productId, 'Invalid form data');
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
    await logUserAction(user, 'update_product', productId, { 
      updatedProduct,
      originalProduct: product,
      storeId: product.storeId
    }, undefined, {
      category: 'product',
      severity: 'medium',
      targetType: 'product',
      storeId: product.storeId,
    });
    revalidatePath("/products");
  } catch (error: unknown) {
    const errorMessage = error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
    await logFailedAction(user, 'update_product', productId, errorMessage, { 
      updatedProduct: { name, description, price, stock },
      originalProduct: product 
    });
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
        await logFailedAction(user, 'delete_product', productId, 'Store ID missing');
        return { success: false, messageKey: "error.storeIdMissing" };
    }

    const product = await getProduct(productId);
    if (!product || product.storeId !== storeId) {
        await logFailedAction(user, 'delete_product', productId, 'Product not found or access denied');
        return { success: false, messageKey: 'error.productNotFound' };
    }

    try {
        await deleteProductFromDb(productId, storeId);
        await logUserAction(user, 'delete_product', productId, { 
          product,
          storeId 
        }, undefined, {
          category: 'product',
          severity: 'high',
          targetType: 'product',
          storeId,
        });
        revalidatePath("/products");
        return { success: true, messageKey: "productActions.toast.deletedSuccess" };
    } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
        await logFailedAction(user, 'delete_product', productId, errorMessage, { 
          product 
        });
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
  } catch (error: unknown) {
    console.error("AI Description Generation Error:", error);
    return { success: false, messageKey: "error.unexpected" };
  }
}
