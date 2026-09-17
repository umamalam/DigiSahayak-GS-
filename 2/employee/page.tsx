'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to employee dashboard
    router.push('/employee/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading employee dashboard...</p>
      </div>
    </div>
  );
}
