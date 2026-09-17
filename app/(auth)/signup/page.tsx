'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'method' | 'form'>('method');
  const [contactMethod, setContactMethod] = useState<'email' | 'mobile'>('mobile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          sendVia: contactMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&method=${contactMethod}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'method') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-600 rounded-full p-4 mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">How would you like to create your DigiSahayak account?</h1>
          </div>

          {/* Method Selection */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setContactMethod('mobile');
                setStep('form');
              }}
              className="w-full border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 font-semibold py-3.5 rounded-2xl transition-colors"
            >
              Continue with Mobile Number
            </button>
            <button
              onClick={() => {
                setContactMethod('email');
                setStep('form');
              }}
              className="w-full border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 font-semibold py-3.5 rounded-2xl transition-colors"
            >
              Continue with Email ID
            </button>
          </div>

          {/* Google Sign-Up — includes its own "or" divider; hidden if not configured */}
          <GoogleLoginButton />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <button
            onClick={() => setStep('method')}
            className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Change method
          </button>
          <div className="inline-block bg-blue-600 rounded-full p-4 mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create your DigiSahayak account</h1>
          <p className="text-slate-600 text-sm mt-3">Register to access government scheme services</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-slate-700"
              />
              <div className="absolute right-4 top-3.5 text-slate-400">👤</div>
            </div>
          </div>

          {contactMethod === 'mobile' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-slate-700"
                />
                <div className="absolute right-4 top-3.5 text-slate-400">📱</div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email ID</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-slate-700"
                />
                <div className="absolute right-4 top-3.5 text-slate-400">📧</div>
              </div>
            </div>
          )}

          {contactMethod === 'mobile' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email ID</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-slate-700"
                />
                <div className="absolute right-4 top-3.5 text-slate-400">📧</div>
              </div>
            </div>
          )}

          {contactMethod === 'email' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-slate-700"
                />
                <div className="absolute right-4 top-3.5 text-slate-400">📱</div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-slate-700"
              />
              <div className="absolute right-4 top-3.5 text-slate-400">🔒</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-slate-700"
              />
              <div className="absolute right-4 top-3.5 text-slate-400">🔒</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-2xl transition-colors"
          >
            {loading ? 'Creating Account...' : 'Send OTP'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
