import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken, hashPassword, verifyPassword } from '@/lib/auth/utils';

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both current password and new password are required.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'New password is too long.' },
        { status: 400 }
      );
    }

    // Fetch admin's current password hash from DB
    const admin = await db
      .select({ id: users.id, password: users.passwordHash })
      .from(users)
      .where(eq(users.id, session.id))
      .get();

    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    // Verify the current password
    const isCorrect = await verifyPassword(oldPassword, admin.password);
    if (!isCorrect) {
      return NextResponse.json(
        { error: 'Current password is incorrect. Please try again.' },
        { status: 401 }
      );
    }

    // Prevent reuse of the same password
    const isSame = await verifyPassword(newPassword, admin.password);
    if (isSame) {
      return NextResponse.json(
        { error: 'New password must be different from your current password.' },
        { status: 400 }
      );
    }

    // Hash and save the new password
    const hashed = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash: hashed })
      .where(eq(users.id, admin.id))
      .run();

    console.log(`[Admin Settings] Password changed for admin #${admin.id} (${session.email})`);

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing admin password:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
