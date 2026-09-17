import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, generateOTP, getOTPExpiry, sendOTP, checkOTPRateLimit } from '@/lib/auth/utils';
import { eq, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, sendVia = 'email' } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Phone must be 10 digits' },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.phone, phone)))
      .limit(1);

    if (existingUser.length > 0) {
      const existing = existingUser[0];
      if (existing.email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
      if (existing.phone === phone) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 409 }
        );
      }
    }

    const identifier = sendVia === 'email' ? email : phone;
    const rateLimit = checkOTPRateLimit(identifier);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many OTP requests. Try again in ${rateLimit.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const passwordHash = await hashPassword(password);
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Determine role based on email
    let role = 'user';
    if (email === 'hardik.me.chadda@gmail.com') {
      role = 'employee';
    } else if (email === 'umamalam4@gmail.com') {
      role = 'admin';
    }

    await db.insert(users).values({
      name,
      email,
      phone,
      passwordHash,
      role,
      otp,
      otpExpiry,
      isVerified: false,
    });

    const destination = sendVia === 'email' ? email : phone;
    await sendOTP(destination, otp, sendVia);

    const isDev = process.env.NODE_ENV !== 'production';
    
    return NextResponse.json(
      { 
        message: `OTP sent via ${sendVia}. Please verify to complete signup.`,
        email,
        ...(isDev && { debugOTP: otp })
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed. Please try again.' },
      { status: 500 }
    );
  }
}
