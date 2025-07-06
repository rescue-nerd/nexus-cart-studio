
'use client';

import { getProduct as fetchProduct } from '@/lib/firebase-service';

export async function getProduct(productId: string) {
    return await fetchProduct(productId);
}
