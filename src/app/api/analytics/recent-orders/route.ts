import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase';

async function getRecentOrders(db: ReturnType<typeof getFirestore>, storeId?: string, count = 5) {
  let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(count));
  if (storeId) {
    q = query(collection(db, 'orders'), where('storeId', '==', storeId), orderBy('createdAt', 'desc'), limit(count));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function GET(request: NextRequest) {
  if (!app) {
    return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });
  }
  const db = getFirestore(app);
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId') || undefined;
  try {
    const recentOrders = await getRecentOrders(db, storeId, 5);
    return NextResponse.json({ recentOrders });
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch recent orders';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 