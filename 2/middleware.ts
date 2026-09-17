export { middleware } from '@/lib/auth/middleware';
export const config = {
  matcher: ['/profile/:path*', '/updates/:path*', '/categories/:path*', '/schemes/:path*', '/search/:path*'],
};
