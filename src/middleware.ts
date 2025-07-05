
import { NextResponse, type NextRequest } from 'next/server';
import { stores } from '@/lib/placeholder-data';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = url.hostname;

  // Find a store that matches the hostname.
  let store = stores.find(s => s.domain === hostname);

  const isStoreAppRoute = [
    '/dashboard',
    '/products',
    '/orders',
    '/settings',
  ].some(path => url.pathname.startsWith(path));

  // If no store is found by domain, BUT the user is trying to access a store-specific
  // page (like /dashboard), default to the first store for preview/dev purposes.
  if (!store && isStoreAppRoute) {
    console.log(`No store found for hostname "${hostname}". Defaulting to first store for path "${url.pathname}".`);
    store = stores[0]; 
  }

  // If we have a store (either by domain or by fallback)
  if (store) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-store-id', store.id);

    // If accessing the root of a store's domain, show the storefront page.
    if (url.pathname === '/') {
      url.pathname = `/store`;
    }
    
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // If it's not a store domain and not a store-specific path, continue as normal.
  // This allows access to /admin, /login, etc. on the main domain.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (pwa manifest)
     * - icons/ (pwa icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
  ],
};
