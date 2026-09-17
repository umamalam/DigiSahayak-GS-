import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userDocuments } from '@/lib/db/schema';
import { verifyToken } from '@/lib/auth/utils';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const documents = await db
      .select()
      .from(userDocuments)
      .where(eq(userDocuments.userId, decoded.id));

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
