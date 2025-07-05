import { NextResponse, type NextRequest } from 'next/server';
import { stores } from '@/lib/placeholder-data';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host')!;

  // Check if the hostname is a store domain from our data
  const store = stores.find(s => s.domain === hostname);

  if (store) {
    // It's a store domain. Add the store ID to headers and rewrite the URL.
    console.log(`Rewriting for store: ${store.name} on domain ${hostname}`);
    request.headers.set('x-store-id', store.id);

    // If accessing the root of a store's domain, show the storefront page.
    if (url.pathname === '/') {
      url.pathname = `/store`;
    }
    
    // Rewrite the request to the new URL, preserving original headers and URL.
    return NextResponse.rewrite(url, { request });
  }

  // If it's not a store domain, treat it as the main platform and let Next.js handle routing.
  // This is more robust for preview environments.
  // Requests for `/`, `/admin`, `/login` etc. will be handled by their respective pages.
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
