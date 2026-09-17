'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            config: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Fetch the Google Client ID from server (avoids needing NEXT_PUBLIC_ build-time var)
  useEffect(() => {
    fetch('/api/auth/google-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.configured && data.clientId) {
          console.log('[Google Login] Google OAuth is configured on server ✅');
          setClientId(data.clientId);
        } else {
          console.warn('[Google Login] GOOGLE_CLIENT_ID not set on server — button hidden.');
        }
        setConfigLoaded(true);
      })
      .catch((err) => {
        console.error('[Google Login] Failed to fetch Google config:', err);
        setConfigLoaded(true);
      });
  }, []);

  // Step 2: Once we have the client ID, handle the credential response
  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setIsLoading(true);
      setError('');

      console.log('[Google Login] Credential received, sending to server for verification...');

      try {
        const res = await fetch('/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token: response.credential }),
        });

        const data = await res.json();

        if (!res.ok) {
          console.error('[Google Login] Server error:', data.error);
          setError(data.error || 'Google login failed. Please try again.');
          return;
        }

        console.log(
          `[Google Login] ✅ Login successful — User: ${data.user?.email} | Role: ${data.user?.role}`
        );

        // Redirect based on user role (same logic as email/password login)
        if (data.user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user?.role === 'employee') {
          router.push('/employee/dashboard');
        } else {
          router.push('/profile');
        }
      } catch (err) {
        console.error('[Google Login] Network error:', err);
        setError('Connection error. Please check your internet and try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // Step 3: Initialize Google SDK and render the button
  const initializeGoogle = useCallback(() => {
    if (!window.google || !clientId) {
      console.warn('[Google Login] Cannot initialize: SDK or clientId not ready');
      return;
    }

    console.log('[Google Login] Initializing Google Sign-In SDK...');

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    const buttonEl = document.getElementById('google-signin-btn');
    if (buttonEl) {
      window.google.accounts.id.renderButton(buttonEl, {
        theme: 'outline',
        size: 'large',
        width: buttonEl.offsetWidth || 400,
        text: 'continue_with',
        shape: 'rectangular',
      });
      console.log('[Google Login] ✅ Button rendered successfully');
    } else {
      console.warn('[Google Login] #google-signin-btn container not found in DOM');
    }
  }, [clientId, handleCredentialResponse]);

  // Step 4: Load the Google SDK script once clientId is known
  useEffect(() => {
    if (!clientId) return;

    // SDK already loaded from previous navigation
    if (window.google) {
      initializeGoogle();
      return;
    }

    // Don't duplicate the script tag
    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle);
      return () => existingScript.removeEventListener('load', initializeGoogle);
    }

    console.log('[Google Login] Loading Google Sign-In SDK script...');
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => {
      console.error('[Google Login] ❌ Failed to load Google Sign-In SDK');
    };
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', initializeGoogle);
    };
  }, [clientId, initializeGoogle]);

  // Don't render until we've checked the server config
  if (!configLoaded) return null;

  // Don't render if Google OAuth is not configured on the server
  if (!clientId) return null;

  return (
    <>
      {/* Divider — only shown when Google OAuth is configured */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-slate-500 text-sm font-medium">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Error from server */}
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Google Sign-In button — rendered by the Google Identity Services SDK */}
      <div
        id="google-signin-btn"
        className="w-full flex justify-center min-h-[44px]"
        style={{
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
        }}
      />

      {isLoading && (
        <p className="text-center text-sm text-slate-500 mt-2">Signing you in with Google...</p>
      )}
    </>
  );
}
