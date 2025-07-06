import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

// This is a simplified session management example.
// In a real production app, consider using a library like next-auth or iron-session for more robust features.

const SESSION_COOKIE_NAME = 'session';
const SESSION_DURATION_DAYS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function POST(request: NextRequest) {
    if (!adminAuth) {
        return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    const { idToken } = await request.json();

    try {
        const expiresIn = SESSION_DURATION_DAYS;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const options = {
            name: SESSION_COOKIE_NAME,
            value: sessionCookie,
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        };
        
        const response = NextResponse.json({ status: 'success' });
        response.cookies.set(options);
        
        return response;

    } catch (error) {
        console.error("Error creating session cookie:", error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export async function DELETE() {
    const options = {
        name: SESSION_COOKIE_NAME,
        value: '',
        maxAge: -1,
    };
    
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set(options);

    return response;
}
