import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// Helper to sum order totals
async function getTotalSales(db: ReturnType<typeof getFirestore>, storeId?: string) {
  let q = query(collection(db, 'orders'), where('status', 'in', ['Delivered', 'Shipped', 'Processing']));
  if (storeId) {
    q = query(collection(db, 'orders'), where('storeId', '==', storeId), where('status', 'in', ['Delivered', 'Shipped', 'Processing']));
  }
  const snapshot = await getDocs(q);
  let total = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (typeof data.total === 'number') {
      total += data.total;
    }
  });
  return total;
}

async function getOrderVolume(db: ReturnType<typeof getFirestore>, storeId?: string) {
  let q = query(collection(db, 'orders'));
  if (storeId) {
    q = query(collection(db, 'orders'), where('storeId', '==', storeId));
  }
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function getRecentSignups(db: ReturnType<typeof getFirestore>, count = 5) {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(count));
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
    const [totalSales, orderVolume, recentSignups] = await Promise.all([
      getTotalSales(db, storeId),
      getOrderVolume(db, storeId),
      storeId ? Promise.resolve([]) : getRecentSignups(db, 5),
    ]);
    return NextResponse.json({
      totalSales,
      orderVolume,
      recentSignups,
    });
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch analytics overview';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 