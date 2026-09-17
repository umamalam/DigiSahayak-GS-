import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userApplications, schemes, users } from '@/lib/db/schema';
import { eq, desc, like, or, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session || (session.role !== 'admin' && session.role !== 'employee')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const baseQuery = db
      .select({
        id: userApplications.id,
        applicationNumber: userApplications.applicationNumber,
        status: userApplications.status,
        appliedAt: userApplications.appliedAt,
        updatedAt: userApplications.updatedAt,
        reviewNotes: userApplications.reviewNotes,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        scheme: {
          id: schemes.id,
          title: schemes.title,
          ministry: schemes.ministry,
        },
      })
      .from(userApplications)
      .leftJoin(users, eq(userApplications.userId, users.id))
      .leftJoin(schemes, eq(userApplications.schemeId, schemes.id));

    const applications = statusFilter
      ? await baseQuery
          .where(eq(userApplications.status, statusFilter))
          .orderBy(desc(userApplications.appliedAt))
          .all()
      : await baseQuery.orderBy(desc(userApplications.appliedAt)).all();

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
