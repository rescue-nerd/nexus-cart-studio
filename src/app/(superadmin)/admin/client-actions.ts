
'use client';

import { getAllStores as fetchStores, updateStoreStatus as updateStatus } from '@/lib/firebase-service';
import type { Store } from '@/lib/types';

export async function getAllStores(): Promise<Store[]> {
  return await fetchStores();
}

export async function updateStoreStatus(storeId: string, status: Store['status']) {
  try {
    await updateStatus(storeId, { status });
    return { success: true, messageKey: 'superadmin.stores.toast.statusUpdated' };
  } catch (error) {
    console.error("Failed to update store status:", error);
    return { success: false, messageKey: 'superadmin.stores.toast.updateFailed' };
  }
}
