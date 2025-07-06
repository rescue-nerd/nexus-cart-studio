
import { NextResponse, type NextRequest } from 'next/server';
import { getStoreByDomain } from '@/lib/firebase-service.server';

// This function needs to be separate because middleware runs in the Edge runtime.
async function getStore(domain: string) {
    return getStoreByDomain(domain);
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = url.hostname;

  // Let static files and API routes pass through
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Find a store that matches the hostname.
  // NOTE: This makes a DB call on each request. Caching is needed for production.
  const store = await getStore(hostname).catch(err => {
    console.error("Middleware DB Error:", err);
    return null;
  });

  const requestHeaders = new Headers(request.headers);

  if (store) {
    requestHeaders.set('x-store-id', store.id);

    // Rewrite to the /store path for the root domain
    if (url.pathname === '/') {
      url.pathname = `/store`;
    }
    
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For app routes on the main domain (e.g., localhost/dashboard)
  const isAppRoute = ['/dashboard', '/products', '/orders', '/settings'].some(p => url.pathname.startsWith(p));
  if (isAppRoute && !store) {
    // On the main domain, we don't know which store to show.
    // A real app would have a store selector or redirect to a default.
    // For now, we deny access to prevent errors.
    // A better approach would be to redirect to a page explaining to use the store's domain.
    url.pathname = '/login'; // Redirect to login, a safe default
    return NextResponse.redirect(url);
  }
  
  // Allow access to /admin, /login, etc. on the main domain.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (pwa manifest)
     * - icons/ (pwa icons)
     * - api/ (API routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
  ],
};
