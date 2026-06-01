import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/auth/callback'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('pb_token')?.value;
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some(p => path.startsWith(p));

  // No token and trying to access a protected page then redirect to landing
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Has token and on landing page then redirect to dashboard
  if (token && path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};