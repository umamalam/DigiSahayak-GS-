import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordReset } from '@/lib/db/schema';
import { generateOTP, getOTPExpiry } from '@/lib/auth/utils';
import { sendPasswordResetOTP } from '@/lib/auth/email';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      // Don't reveal if email exists for security
      return NextResponse.json(
        { 
          success: true,
          message: 'If an account with this email exists, a password reset OTP will be sent.' 
        },
        { status: 200 }
      );
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Delete any existing reset requests for this email
    await db
      .delete(passwordReset)
      .where(eq(passwordReset.email, email));

    // Save OTP + expiry (10 min) in password_reset table
    await db.insert(passwordReset).values({
      email,
      otp,
      expiresAt,
    });

    // Send OTP to user's email using nodemailer
    const emailSent = await sendPasswordResetOTP(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send password reset OTP. Please try again.' },
        { status: 500 }
      );
    }

    const isDev = process.env.NODE_ENV !== 'production';

    return NextResponse.json(
      { 
        success: true,
        message: 'Password reset OTP sent to your email',
        ...(isDev && { debugOTP: otp })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
