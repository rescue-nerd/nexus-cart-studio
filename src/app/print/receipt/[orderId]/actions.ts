
'use server';

import { getOrder, getStore } from '@/lib/firebase-service';
import type { Order, Store } from '@/lib/types';

type ReceiptData = {
    order: Order | null;
    store: Store | null;
}

export async function getReceiptData(orderId: string): Promise<ReceiptData> {
    const order = await getOrder(orderId);
    if (!order) {
        return { order: null, store: null };
    }
    const store = await getStore(order.storeId);
    return { order, store };
}
