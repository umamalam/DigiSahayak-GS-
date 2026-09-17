'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyResetOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const debugOTP = searchParams.get('debugOTP') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/reset-password');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'OTP verification failed');
        return;
      }

      router.push(`/reset-password/new?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    setOtp(['', '', '', '', '', '']);

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend OTP');
        return;
      }

      setResendCooldown(30);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  const displayEmail = email ? `${email.substring(0, 3)}***${email.substring(email.length - 3)}` : '';

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
          <h1 className="text-3xl font-bold text-slate-900">Verify Your Identity</h1>
          <p className="text-slate-600 text-sm mt-3">
            Enter the 6-digit code sent to your email
          </p>
          <p className="text-slate-700 font-medium text-sm mt-2">Sent to {displayEmail}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {debugOTP && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-2xl text-sm">
              Debug OTP: <span className="font-mono font-bold">{debugOTP}</span>
            </div>
          )}

          {/* OTP Input Boxes */}
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            ))}
          </div>

          {/* Resend Info */}
          <div className="text-center">
            <p className="text-slate-600 text-sm">
              Didn't receive?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending || resendCooldown > 0}
                className="text-blue-600 hover:text-blue-700 disabled:text-slate-400 font-medium transition-colors"
              >
                Resend in {resendCooldown > 0 ? `${resendCooldown}s` : 'now'}
              </button>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-2xl transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm">
            <Link href="/reset-password" className="text-blue-600 hover:text-blue-700 font-semibold">
              Enter different email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
