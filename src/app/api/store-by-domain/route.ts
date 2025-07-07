import { NextResponse } from 'next/server';
import { getStoreByDomain } from '@/lib/firebase-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  if (!domain) {
    return NextResponse.json({ error: 'Missing domain' }, { status: 400 });
  }
  const store = await getStoreByDomain(domain);
  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }
  return NextResponse.json({ storeId: store.id });
} 