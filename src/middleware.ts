
import { NextResponse, type NextRequest } from 'next/server';
import { getStoreByDomain } from '@/lib/firebase-service.server';

// This function needs to be separate because middleware runs in the Edge runtime.
async function getStore(domain: string) {
    return getStoreByDomain(domain);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.nextUrl.hostname;
  const sessionCookie = request.cookies.get('session')?.value;

  // Define route groups
  const appRoutes = ['/dashboard', '/products', '/orders', '/settings'];
  const adminRoutes = ['/admin'];
  const authRoutes = ['/login', '/signup'];

  const isAppRoute = appRoutes.some(p => pathname.startsWith(p));
  const isAdminRoute = adminRoutes.some(p => pathname.startsWith(p));
  const isAuthRoute = authRoutes.some(p => pathname.startsWith(p));

  // Get store context based on domain
  const store = await getStore(hostname).catch(err => {
    console.error("Middleware DB Error:", err);
    return null;
  });

  // --- Authentication & Authorization Logic ---

  // 1. If user is not logged in and tries to access a protected route (app or admin)
  if (!sessionCookie && (isAppRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // 2. If user is logged in
  if (sessionCookie) {
    // 2a. And is trying to access an auth route (login/signup)
    if (isAuthRoute) {
      // Redirect them to the appropriate dashboard
      return NextResponse.redirect(new URL(store ? '/dashboard' : '/admin', request.url));
    }

    // 2b. And is on a store domain but trying to access an admin route
    if (store && isAdminRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2c. And is on the main domain but trying to access an app route
    if (!store && isAppRoute) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // --- Multi-tenancy Rewriting Logic ---
  const requestHeaders = new Headers(request.headers);
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
