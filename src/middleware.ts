import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/analiz', '/harita', '/karsilastir', '/profil'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('kira-auth');
  let user: { email: string; role: string } | null = null;

  if (authCookie?.value) {
    try {
      user = JSON.parse(authCookie.value);
    } catch {
      user = null;
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/analiz', request.url));
  }

  // Protect routes that require login
  if (!user) {
    if (pathname.startsWith('/harita')) {
      return NextResponse.redirect(new URL('/kira-haritasi', request.url));
    }
    if (pathname.startsWith('/karsilastir')) {
      return NextResponse.redirect(new URL('/kira-karsilastirma', request.url));
    }
    if (pathname.startsWith('/analiz')) {
      return NextResponse.redirect(new URL('/kira-analizi', request.url));
    }
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users from teaser pages to dashboards
  if (user) {
    if (pathname === '/kira-haritasi') {
      return NextResponse.redirect(new URL('/harita', request.url));
    }
    if (pathname === '/kira-karsilastirma') {
      return NextResponse.redirect(new URL('/karsilastir', request.url));
    }
    if (pathname === '/kira-analizi') {
      return NextResponse.redirect(new URL('/analiz', request.url));
    }
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
