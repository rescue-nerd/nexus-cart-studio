import { NextResponse, type NextRequest } from 'next/server';
import { stores } from '@/lib/placeholder-data';

// This is a list of hostnames that are part of the main platform, not tenant stores.
// In a real app, this would be your main domain. For local dev, it's localhost.
const PLATFORM_HOSTNAMES = ['localhost:9002', 'nexuscart.com', 'www.nexuscart.com', 'app.nexuscart.com'];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host')!;

  const isPlatformHostname = PLATFORM_HOSTNAMES.some(h => hostname.startsWith(h));
  
  // Find the store data based on the hostname.
  const store = stores.find(s => s.domain === hostname);
  
  if (store) {
    // This is a tenant store.
    console.log(`Rewriting for store: ${store.name} on domain ${hostname}`);
    
    // Add x-store-id header to the request
    request.headers.set('x-store-id', store.id);

    // If the path is `/`, rewrite to the `/store` page.
    if (url.pathname === '/') {
      url.pathname = `/store`;
    }
    
    // Rewrite the request to the new URL but preserve the original headers
    return NextResponse.rewrite(url, { request });

  } else if (isPlatformHostname) {
    // This is the main platform.
    
    // If the path is `/`, rewrite to the `/admin` page (superadmin dashboard)
    if (url.pathname === '/') {
        url.pathname = `/admin`;
        return NextResponse.rewrite(url);
    }
    
    // Allow access to other platform routes like /admin, /login, /signup
    return NextResponse.next();
  }

  // If no store is found and it's not a platform domain, show a 404.
  // In a real app, you might want a dedicated "store not found" page.
  return new Response('Store not found.', { status: 404 });
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
