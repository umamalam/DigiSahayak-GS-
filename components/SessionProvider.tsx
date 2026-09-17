'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check session on app load and redirect if needed
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/check-session', { credentials: 'include' });
        const data = await res.json();

        // If user is on public auth pages, no need to check
        const publicPages = ['/login', '/signup', '/verify-otp', '/reset-password'];
        const isPublicPage = publicPages.some(page => pathname === page || pathname.startsWith(page + '/'));
        
        if (isPublicPage) {
          return;
        }

        // If not authenticated and on protected route, redirect to login
        if (!data.authenticated && pathname !== '/' && pathname !== '/') {
          router.push('/login');
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSession();
  }, [pathname, router]);

  return <>{children}</>;
}
