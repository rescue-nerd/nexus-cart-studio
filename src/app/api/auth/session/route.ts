
import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { logActivity } from '@/lib/activity-log';

// This is a simplified session management example.
// In a real production app, consider using a library like next-auth or iron-session for more robust features.

const SESSION_COOKIE_NAME = 'session';
const SESSION_DURATION_DAYS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function POST(request: NextRequest) {
    let user = null;
    if (!adminAuth) {
        await logActivity(user, 'login_failed', '-', { error: 'Firebase Admin not configured' }, { headers: Object.fromEntries(request.headers.entries()) });
        return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    const { idToken } = await request.json();

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        user = { uid: decodedToken.uid, role: decodedToken.role, storeId: decodedToken.storeId };
        await logActivity(user, 'login', user.uid, {}, { headers: Object.fromEntries(request.headers.entries()) });

        const expiresIn = SESSION_DURATION_DAYS;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const isSecure = request.nextUrl.protocol === 'https';

        const options = {
            name: SESSION_COOKIE_NAME,
            value: sessionCookie,
            maxAge: expiresIn,
            httpOnly: true,
            secure: isSecure,
            path: '/',
            sameSite: 'lax' as const,
        };
        
        const response = NextResponse.json({ status: 'success' });
        response.cookies.set(options);
        
        return response;

    } catch (error: unknown) {
        let errorMessage = 'Unauthorized';
        if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
            errorMessage = (error as { message: string }).message;
        }
        await logActivity(user, 'login_failed', '-', { error: errorMessage }, { headers: Object.fromEntries(request.headers.entries()) });
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
}

export async function DELETE(request: NextRequest) {
    let user = null;
    const isSecure = request.nextUrl.protocol === 'https';
    
    const options = {
        name: SESSION_COOKIE_NAME,
        value: '',
        maxAge: -1,
        path: '/',
        secure: isSecure,
        sameSite: 'lax' as const,
    };
    
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set(options);

    try {
        const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
        if (!sessionCookie || !adminAuth) {
            await logActivity(user, 'logout_failed', '-', { error: 'No session cookie found or Firebase Admin not configured' }, { headers: Object.fromEntries(request.headers.entries()) });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        user = { uid: decodedToken.uid, role: decodedToken.role, storeId: decodedToken.storeId };
        await logActivity(user, 'logout', user.uid, {}, { headers: Object.fromEntries(request.headers.entries()) });
    } catch (error: unknown) {
        let errorMessage = 'Unauthorized';
        if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
            errorMessage = (error as { message: string }).message;
        }
        await logActivity(user, 'logout_failed', '-', { error: errorMessage }, { headers: Object.fromEntries(request.headers.entries()) });
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    return response;
}
