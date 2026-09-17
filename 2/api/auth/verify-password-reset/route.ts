import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { passwordReset } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Find password reset request
    const resetRequest = await db
      .select()
      .from(passwordReset)
      .where(eq(passwordReset.email, email))
      .limit(1);

    if (resetRequest.length === 0) {
      return NextResponse.json(
        { error: 'No password reset request found for this email' },
        { status: 404 }
      );
    }

    const request = resetRequest[0];

    // Check if OTP is expired
    if (new Date() > request.expiresAt) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (request.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'OTP verified successfully',
        verified: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
