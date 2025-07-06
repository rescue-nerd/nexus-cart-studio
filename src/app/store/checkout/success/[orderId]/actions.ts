
'use client';

import { getOrder as fetchOrder } from '@/lib/firebase-service';

export async function getOrder(orderId: string) {
    return await fetchOrder(orderId);
}
