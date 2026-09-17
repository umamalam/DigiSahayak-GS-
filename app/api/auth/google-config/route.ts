import { NextResponse } from 'next/server';

/**
 * Returns the Google OAuth client ID to the browser.
 * The Client ID is NOT a secret (it's always embedded in web pages in OAuth flows).
 * This avoids requiring NEXT_PUBLIC_GOOGLE_CLIENT_ID as a separate build-time variable.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || null;

  return NextResponse.json({
    clientId,
    configured: !!clientId,
  });
}
