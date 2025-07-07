import { NextResponse, type NextRequest } from 'next/server';
// import { getStoreByDomain } from '@/lib/firebase-service.server';
// getStoreByDomain uses firebase-admin, which is not compatible with Edge runtime (middleware)
// If you need store info, use a public API route or static config instead.

// async function getStore(domain: string) {
//     return getStoreByDomain(domain);
// }

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

  // --- Store Context: fetch storeId by domain (Edge-compatible) ---
  let storeId: string | null = null;
  try {
    const apiUrl = `${request.nextUrl.origin}/api/store-by-domain?domain=${hostname}`;
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      storeId = data.storeId;
    }
  } catch (e) {
    // ignore, storeId stays null
  }

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
      // Redirect them to the dashboard (cannot check admin/store context here)
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // 2b. And is on an admin route (cannot check store context here)
    // 2c. And is on an app route (cannot check main domain context here)
    // These checks require store context, which is not available in Edge runtime.
  }

  // --- Multi-tenancy Rewriting Logic ---
  const requestHeaders = new Headers(request.headers);
  if (storeId) {
    requestHeaders.set('x-store-id', storeId);
  }

  // Rewrite the root of a store domain to the /store path (disabled, needs store context)
  // if (store && pathname === '/') {
  //     const url = request.nextUrl.clone();
  //     url.pathname = '/store';
  //     return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  // }

  // For all other requests, just continue
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
