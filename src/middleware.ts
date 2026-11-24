import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('staff_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // If visiting the public root '/' while already authenticated, forward directly to the portal gateway
  if (pathname === '/' && token) {
    const portalUrl = new URL('/portal', request.url);
    return NextResponse.redirect(portalUrl);
  }

  // Allow public landing page, portal gateway, auth routes, public availability & catalog APIs, and static assets
  if (
    pathname === '/' ||
    pathname === '/portal' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/availability') ||
    (request.method === 'GET' && (pathname === '/api/rooms' || pathname === '/api/laptops')) ||
    pathname.includes('.') // Any static asset file (e.g. .png, .jpg, .ico, .svg, .webp)
  ) {
    return NextResponse.next();
  }

  // If no auth token on protected routes (/dashboard, /rooms, /laptops, /api/*)
  if (!token) {
    // Return 401 JSON for unauthenticated API requests instead of an HTML redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized: Staff authentication required.' },
        { status: 401 }
      );
    }

    let portalParam = '';
    if (pathname.startsWith('/rooms')) portalParam = '?portal=rooms';
    else if (pathname.startsWith('/laptops')) portalParam = '?portal=laptops';
    else if (pathname.startsWith('/dashboard')) portalParam = '?portal=dashboard';

    const loginUrl = new URL(`/login${portalParam}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files with extensions (.png, .jpg, .svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
