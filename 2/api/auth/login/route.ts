import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { verifyPassword, generateToken } from '@/lib/auth/utils';
import { eq, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { emailOrPhone, password } = await req.json();

    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { error: 'Email/Phone and password required' },
        { status: 400 }
      );
    }

    // Find user by email or phone
    const user = await db
      .select()
      .from(users)
      .where(or(eq(users.email, emailOrPhone), eq(users.phone, emailOrPhone)))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const foundUser = user[0];

    // Check if verified
    if (!foundUser.isVerified) {
      return NextResponse.json(
        { error: 'Please verify your email/phone first', redirectTo: '/verify-otp' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, foundUser.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Determine role based on email
    let userRole = foundUser.role || 'user';
    if (emailOrPhone === 'hardik.me.chadda@gmail.com') {
      userRole = 'employee';
    } else if (emailOrPhone === 'umamalam4@gmail.com') {
      userRole = 'admin';
    }

    // Generate token with user data including role
    const token = generateToken({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: userRole
    });

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { message: 'Login successful', user: { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: userRole } },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
