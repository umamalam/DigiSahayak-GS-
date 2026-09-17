'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickFill = (email: string) => {
    setFormData(prev => ({
      ...prev,
      emailOrPhone: email
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.emailOrPhone || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.redirectTo) {
          router.push(`${data.redirectTo}?email=${encodeURIComponent(formData.emailOrPhone)}`);
          return;
        }
        setError(data.error || 'Login failed');
        return;
      }

      if (data.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (data.user?.role === 'employee') {
        router.push('/employee/dashboard');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-blue-600 rounded-full p-4 mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back to DigiSahayak</h1>
          <p className="text-slate-600 text-sm mt-3">Login to access your dashboard and scheme updates.</p>
          
          {/* Role Info */}
          <div className="mt-6 p-3 bg-blue-50 rounded-2xl border border-blue-200">
            <p className="text-xs text-slate-600 mb-2">Quick login (for testing):</p>
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => handleQuickFill('hardik.me.chadda@gmail.com')}
                className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('umamalam4@gmail.com')}
                className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('')}
                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              >
                User
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email / Phone</label>
            <input
              type="text"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              placeholder="Enter your registered email or mobile number"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-slate-700"
            />
          </div>

          <div className="text-right">
            <Link href="/reset-password" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-2xl transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Google Login — includes its own "or" divider; hidden if not configured */}
        <GoogleLoginButton />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
