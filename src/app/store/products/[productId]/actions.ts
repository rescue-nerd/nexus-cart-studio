
'use client';

import { getProduct as fetchProduct } from '@/lib/firebase-client-data';

export async function getProduct(productId: string) {
    return await fetchProduct(productId);
}
