import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { generateOTP, getOTPExpiry, sendOTP, checkOTPRateLimit } from '@/lib/auth/utils';
import { eq, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { emailOrPhone, sendVia = 'email' } = await req.json();

    if (!emailOrPhone) {
      return NextResponse.json(
        { error: 'Email or phone required' },
        { status: 400 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(or(eq(users.email, emailOrPhone), eq(users.phone, emailOrPhone)))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const foundUser = user[0];

    if (foundUser.isVerified) {
      return NextResponse.json(
        { error: 'Account already verified. Please login.' },
        { status: 400 }
      );
    }

    const rateLimit = checkOTPRateLimit(emailOrPhone);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many OTP requests. Try again in ${rateLimit.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await db
      .update(users)
      .set({ otp, otpExpiry })
      .where(eq(users.id, foundUser.id));

    const destination = sendVia === 'email' ? foundUser.email : foundUser.phone;
    await sendOTP(destination, otp, sendVia);

    const isDev = process.env.NODE_ENV !== 'production';

    return NextResponse.json(
      { 
        message: `OTP sent via ${sendVia}`,
        ...(isDev && { debugOTP: otp })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to resend OTP' },
      { status: 500 }
    );
  }
}
