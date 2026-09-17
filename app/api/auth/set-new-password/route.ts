import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordReset } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/utils';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword, confirmPassword } = await req.json();

    if (!email || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password reset request exists and is valid
    const resetRequest = await db
      .select()
      .from(passwordReset)
      .where(eq(passwordReset.email, email))
      .limit(1);

    if (resetRequest.length === 0) {
      return NextResponse.json(
        { error: 'No valid password reset request found' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.email, email));

    // Delete password reset request
    await db
      .delete(passwordReset)
      .where(eq(passwordReset.email, email));

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Set new password error:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
