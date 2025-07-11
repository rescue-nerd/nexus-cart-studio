import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase';

async function getRecentSignups(db: ReturnType<typeof getFirestore>, count = 5) {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function GET() {
  if (!app) {
    return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });
  }
  const db = getFirestore(app);
  try {
    const recentSignups = await getRecentSignups(db, 5);
    return NextResponse.json({ recentSignups });
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch recent signups';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 