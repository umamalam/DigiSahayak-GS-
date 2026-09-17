import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import { generateToken } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

  try {
    // Check if Google OAuth is configured on server
    if (!GOOGLE_CLIENT_ID) {
      console.error('❌ [Google Login] GOOGLE_CLIENT_ID is not set. Google login disabled.');
      return NextResponse.json(
        { error: 'Google login is not configured on this server.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      console.error('[Google Login] No token provided in request body');
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify the Google ID token
    const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

    let payload;
    try {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('❌ [Google Login] Token verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Invalid or expired Google token. Please try again.' },
        { status: 401 }
      );
    }

    if (!payload) {
      console.error('[Google Login] Empty token payload after verification');
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
    }

    const { email, name } = payload;
    const userName = name || 'Google User';

    if (!email) {
      console.error('[Google Login] Google did not provide email in token');
      return NextResponse.json(
        { error: 'Email not provided by Google. Please ensure your Google account has an email.' },
        { status: 400 }
      );
    }

    console.log(`🔐 [Google Login] Login attempt for: ${email}`);

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let currentUser;

    if (!existingUsers.length) {
      // New user — create account automatically
      console.log(`👤 [Google Login] Creating new account for: ${email}`);

      // Use email-based placeholder for phone since phone is NOT NULL + UNIQUE
      // Using 'google:email' format ensures uniqueness (email is already unique)
      const phonePlaceholder = `google:${email}`;

      const result = await db
        .insert(users)
        .values({
          email,
          name: userName,
          phone: phonePlaceholder,
          passwordHash: '',
          isVerified: true,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      currentUser = result[0];
      console.log(`✅ [Google Login] New user created: ${email} (ID: ${currentUser.id})`);
    } else {
      currentUser = existingUsers[0];
      console.log(`✅ [Google Login] Existing user found: ${email} (ID: ${currentUser.id}, role: ${currentUser.role})`);

      // Auto-verify if somehow not verified
      if (!currentUser.isVerified) {
        await db
          .update(users)
          .set({ isVerified: true, updatedAt: new Date() })
          .where(eq(users.id, currentUser.id));

        currentUser = { ...currentUser, isVerified: true };
        console.log(`✅ [Google Login] Marked existing user as verified: ${email}`);
      }
    }

    // Generate JWT using the same system as email/password login
    const authToken = generateToken({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
    });

    console.log(`🎟️ [Google Login] Session token generated for: ${email} (role: ${currentUser.role})`);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        },
      },
      { status: 200 }
    );

    // Set cookie exactly the same way as the normal login
    response.cookies.set('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('❌ [Google Login] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
