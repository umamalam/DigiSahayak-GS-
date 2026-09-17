'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashScreen() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let splashTimer: NodeJS.Timeout;
    let isMounted = true;

    const handleRedirect = async () => {
      try {
        const res = await fetch('/api/auth/check-session');
        const data = await res.json();

        if (!isMounted) return;

        // Give splash screen minimum 3 seconds display time
        splashTimer = setTimeout(() => {
          if (!isMounted) return;
          
          if (data.authenticated && data.verified) {
            // User is logged in and verified → go to dashboard
            router.push('/home');
          } else if (data.authenticated && !data.verified) {
            // User is logged in but not verified → go to OTP verification
            router.push(`/(auth)/verify-otp?email=${encodeURIComponent(data.email || '')}`);
          } else {
            // No valid session → go to welcome
            router.push('/(auth)/welcome');
          }
          setCheckingAuth(false);
        }, 3000);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (!isMounted) return;
        
        // On error, redirect to welcome as fallback
        splashTimer = setTimeout(() => {
          if (!isMounted) return;
          router.push('/(auth)/welcome');
          setCheckingAuth(false);
        }, 3000);
      }
    };

    handleRedirect();

    return () => {
      isMounted = false;
      if (splashTimer) clearTimeout(splashTimer);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-orange-400 via-orange-300 to-emerald-300 flex flex-col items-center justify-center">
      <div className="animate-fade-in">
        <div className="text-center flex flex-col items-center">
          <div className="mb-6">
            <Image 
              src="/logo.png" 
              alt="DigiSahayak" 
              width={120} 
              height={120}
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-blue-700 mb-2">DigiSahayak</h1>
          <p className="text-base text-gray-700 font-medium">Aapka Digital Saathi for Every Sarkari Yojna</p>
        </div>
      </div>
    </div>
  );
}
