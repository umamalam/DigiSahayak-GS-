import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './utils';

export function withAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return handler(req, decoded);
  };
}

// Middleware for protected routes
export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const pathname = req.nextUrl.pathname;

  // Protected routes
  const protectedRoutes = ['/profile', '/updates', '/categories', '/schemes', '/search'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isProtected && token) {
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/updates/:path*', '/categories/:path*', '/schemes/:path*', '/search/:path*'],
};
