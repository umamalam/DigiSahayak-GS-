import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tickets, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const allTicketsRaw = await db
      .select({
        ticketId: tickets.id,
        ticketNumber: tickets.ticketNumber,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        response: tickets.response,
        createdAt: tickets.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.userId, users.id))
      .orderBy(sql`${tickets.createdAt} DESC`);

    const allTickets = allTicketsRaw.map(t => ({
      id: t.ticketId,
      ticketNumber: t.ticketNumber || '',
      subject: t.subject || '',
      description: t.description,
      status: t.status,
      priority: t.priority || 'medium',
      response: t.response || '',
      userName: t.userName || 'Unknown',
      userEmail: t.userEmail || '',
      createdAt: t.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ tickets: allTickets });
  } catch (error) {
    console.error('Admin tickets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
