
'use client';

import { getOrder as fetchOrder, getStore as fetchStore } from '@/lib/firebase-client-data';
import type { Order, Store } from '@/lib/types';

export async function getOrder(orderId: string) {
    return await fetchOrder(orderId);
}

export async function getOrderAndStore(orderId: string): Promise<{order: Order | null, store: Store | null}> {
    const order = await fetchOrder(orderId);
    if (!order) {
        return { order: null, store: null };
    }
    const store = await fetchStore(order.storeId);
    return { order, store };
}
