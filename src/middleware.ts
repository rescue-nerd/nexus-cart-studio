
import { NextResponse, type NextRequest } from 'next/server';
import { getStoreByDomain } from '@/lib/firebase-service.server';

// This function needs to be separate because middleware runs in the Edge runtime.
async function getStore(domain: string) {
    return getStoreByDomain(domain);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.nextUrl.hostname;

  // This session cookie is the standard way to check for authentication in middleware.
  // It would need to be set via a server endpoint after a successful Firebase login on the client.
  const sessionCookie = request.cookies.get('session')?.value;

  // --- Authentication Logic ---
  const protectedRoutes = ['/dashboard', '/products', '/orders', '/settings', '/admin'];
  const authRoutes = ['/login', '/signup'];

  const isProtectedRoute = protectedRoutes.some(p => pathname.startsWith(p));
  const isAuthRoute = authRoutes.some(p => pathname.startsWith(p));

  // If trying to access a protected route without a session, redirect to login
  if (!sessionCookie && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Store the intended destination to redirect back to after login
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // If logged in and trying to access login/signup page, redirect to dashboard
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }


  // --- Multi-tenancy & Rewriting Logic ---
  const requestHeaders = new Headers(request.headers);
  const store = await getStore(hostname).catch(err => {
    console.error("Middleware DB Error:", err);
    return null;
  });

  // Attach store ID to headers if a store domain is detected
  if (store) {
    requestHeaders.set('x-store-id', store.id);
  }

  // Rewrite the root of a store domain to the /store path
  if (store && pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/store';
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // For all other requests, just continue with the appropriate headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (pwa manifest)
     * - icons/ (pwa icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
  ],
};
