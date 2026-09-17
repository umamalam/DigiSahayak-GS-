import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const pathname = req.nextUrl.pathname;

  // PUBLIC auth routes - no authentication required (always allow)
  const publicAuthRoutes = ['/login', '/signup', '/verify-otp', '/reset-password'];
  const isPublicAuthRoute = publicAuthRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // If it's a public auth route, allow access without token
  if (isPublicAuthRoute) {
    return NextResponse.next();
  }

  // PROTECTED routes - require authentication
  const protectedRoutes = ['/home', '/profile', '/updates', '/categories', '/schemes', '/search', '/dashboard'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  // If protected route and no token, redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/updates/:path*',
    '/categories/:path*',
    '/schemes/:path*',
    '/search/:path*',
    '/login/:path*',
    '/signup/:path*',
    '/verify-otp/:path*',
    '/reset-password/:path*',
  ],
};
