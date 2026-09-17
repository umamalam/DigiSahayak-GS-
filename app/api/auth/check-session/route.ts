import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, verified: false },
        { status: 200 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { authenticated: false, verified: false },
        { status: 200 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user.length) {
      return NextResponse.json(
        { authenticated: false, verified: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        authenticated: true, 
        verified: user[0].isVerified,
        user: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          role: user[0].role,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check session error:', error);
    return NextResponse.json(
      { authenticated: false, verified: false },
      { status: 200 }
    );
  }
}
