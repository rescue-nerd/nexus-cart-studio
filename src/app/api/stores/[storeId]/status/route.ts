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
  } catch (error: unknown) {
    let errorMessage = 'Failed to update store status';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    console.error('Error updating store status:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}