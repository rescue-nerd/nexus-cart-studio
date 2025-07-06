
'use client';

import { getAllStores as fetchStores } from '@/lib/firebase-client-data';
import type { Store } from '@/lib/types';

export async function getAllStores(): Promise<Store[]> {
  return await fetchStores();
}

export async function updateStoreStatus(storeId: string, status: Store['status']) {
  try {
    // Make a fetch request to the server action instead of directly calling the server function
    const response = await fetch(`/api/stores/${storeId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update store status');
    }
    
    return { success: true, messageKey: 'superadmin.stores.toast.statusUpdated' };
  } catch (error) {
    console.error("Failed to update store status:", error);
    return { success: false, messageKey: 'superadmin.stores.toast.updateFailed' };
  }
}
