import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

async function getTopCategories(db: ReturnType<typeof getFirestore>, storeId?: string, count = 5) {
  let q = query(collection(db, 'orders'));
  if (storeId) {
    q = query(collection(db, 'orders'), where('storeId', '==', storeId));
  }
  const snapshot = await getDocs(q);
  const categorySales: Record<string, { name: string; quantity: number }> = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (Array.isArray(data.items)) {
      data.items.forEach((item: unknown) => {
        if (
          item &&
          typeof item === 'object' &&
          'categoryId' in item &&
          'categoryName' in item &&
          'quantity' in item &&
          typeof (item as any).categoryId === 'string' &&
          typeof (item as any).categoryName === 'string' &&
          typeof (item as any).quantity === 'number'
        ) {
          const typedItem = item as { categoryId: string; categoryName: string; quantity: number };
          if (!categorySales[typedItem.categoryId]) {
            categorySales[typedItem.categoryId] = { name: typedItem.categoryName, quantity: 0 };
          }
          categorySales[typedItem.categoryId].quantity += typedItem.quantity;
        }
      });
    }
  });
  // Sort by quantity sold
  const sorted = Object.entries(categorySales)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, count)
    .map(([categoryId, info]) => ({ categoryId, ...info }));
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
    const topCategories = await getTopCategories(db, storeId, 5);
    return NextResponse.json({ topCategories });
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch top categories';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 