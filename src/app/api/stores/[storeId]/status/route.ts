import { NextResponse, type NextRequest } from 'next/server';
import { updateStore } from '@/lib/firebase-service';
import { adminAuth } from '@/lib/firebase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  // Verify authentication
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie || !adminAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the session cookie
    await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Get the request body
    const { status } = await request.json();
    
    // Update the store status
    await updateStore(params.storeId, { status });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating store status:', error);
    return NextResponse.json({ error: 'Failed to update store status' }, { status: 500 });
  }
}