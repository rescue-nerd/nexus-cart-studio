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
      data.items.forEach((item: any) => {
        if (item && typeof item.categoryId === 'string' && typeof item.categoryName === 'string' && typeof item.quantity === 'number') {
          if (!categorySales[item.categoryId]) {
            categorySales[item.categoryId] = { name: item.categoryName, quantity: 0 };
          }
          categorySales[item.categoryId].quantity += item.quantity;
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