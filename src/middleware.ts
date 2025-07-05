import { NextResponse, type NextRequest } from 'next/server';
import { stores } from '@/lib/placeholder-data';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Use `url.hostname` which doesn't include the port, making matching reliable.
  const hostname = url.hostname;

  // Find a store that matches the hostname exactly.
  const store = stores.find(s => s.domain === hostname);

  if (store) {
    // It's a store domain. Add the store ID to headers and rewrite the URL.
    console.log(`Rewriting for store: ${store.name} on domain ${hostname}`);
    
    // Create new headers and set the store ID. This is the correct way to modify headers.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-store-id', store.id);

    // If accessing the root of a store's domain, show the storefront page.
    if (url.pathname === '/') {
      url.pathname = `/store`;
    }
    
    // Rewrite the request to the new URL, passing along the new headers.
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // If it's not a store domain (e.g., localhost), treat it as the main platform.
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
