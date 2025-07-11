import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

async function getTopProducts(db: ReturnType<typeof getFirestore>, storeId?: string, count = 5) {
  let q = query(collection(db, 'orders'));
  if (storeId) {
    q = query(collection(db, 'orders'), where('storeId', '==', storeId));
  }
  const snapshot = await getDocs(q);
  const productSales: Record<string, { name: string; quantity: number }> = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (Array.isArray(data.items)) {
      data.items.forEach((item: unknown) => {
        if (
          item &&
          typeof item === 'object' &&
          'productId' in item &&
          'name' in item &&
          'quantity' in item &&
          typeof (item as any).productId === 'string' &&
          typeof (item as any).name === 'string' &&
          typeof (item as any).quantity === 'number'
        ) {
          const typedItem = item as { productId: string; name: string; quantity: number };
          if (!productSales[typedItem.productId]) {
            productSales[typedItem.productId] = { name: typedItem.name, quantity: 0 };
          }
          productSales[typedItem.productId].quantity += typedItem.quantity;
        }
      });
    }
  });
  // Sort by quantity sold
  const sorted = Object.entries(productSales)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, count)
    .map(([productId, info]) => ({ productId, ...info }));
  return sorted;
}

export async function GET(request: NextRequest) {
  if (!app) {
    return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });
  }
  const db = getFirestore(app);
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId') || undefined;
  try {
    const topProducts = await getTopProducts(db, storeId, 5);
    return NextResponse.json({ topProducts });
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch top products';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 