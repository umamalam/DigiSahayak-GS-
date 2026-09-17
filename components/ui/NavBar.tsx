'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogout, setShowLogout] = useState(false);

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/profile/notifications', label: 'Updates', icon: Bell },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Hide navbar on login/signup/verify-otp pages
  if (['/login', '/signup', '/verify-otp'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="max-w-screen-sm md:max-w-4xl lg:max-w-6xl mx-auto px-2 md:px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href === '/home' && pathname === '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-4 transition-all rounded-xl ${
                  isActive
                    ? 'text-[#4568F0] bg-[#4568F0]/5'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <div className="relative">
            <button
              onClick={() => setShowLogout(!showLogout)}
              className="flex flex-col items-center justify-center gap-1 py-2 px-4 text-gray-500 hover:text-gray-700 transition-all rounded-xl"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-medium">Logout</span>
            </button>
            
            {showLogout && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50 px-3 py-2 rounded text-sm font-medium w-full text-left"
                >
                  Confirm Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
