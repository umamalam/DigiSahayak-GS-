import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, tickets } from '@/lib/db/schema';
import { eq, sql, and, or } from 'drizzle-orm';
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

    // Get total users (excluding employees and admins)
    const allUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.role, 'user'), eq(users.role, 'null')));
    
    const totalUsers = allUsers.length;

    // Get total employees (including admins)
    const allEmployees = await db
      .select()
      .from(users)
      .where(or(eq(users.role, 'employee'), eq(users.role, 'admin')));
    
    const totalEmployees = allEmployees.length;

    // Get all tickets
    const allTickets = await db
      .select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        userId: tickets.userId,
        createdAt: tickets.createdAt,
      })
      .from(tickets);

    const totalTickets = allTickets.length;
    const activeTickets = allTickets.filter(t => t.status === 'open').length;
    const pendingTickets = allTickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = allTickets.filter(t => t.status === 'resolved').length;

    // Get recent 5 users
    const recentUsersRaw = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(or(eq(users.role, 'user'), eq(users.role, 'null')))
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(5);

    const recentUsers = recentUsersRaw.map(u => ({
      ...u,
      createdAt: u.createdAt?.toISOString() || new Date().toISOString(),
    }));

    // Get recent 5 tickets with user info
    const recentTicketsRaw = await db
      .select({
        ticketId: tickets.id,
        ticketNumber: tickets.ticketNumber,
        subject: tickets.subject,
        status: tickets.status,
        priority: tickets.priority,
        createdAt: tickets.createdAt,
        userId: tickets.userId,
        userName: users.name,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.userId, users.id))
      .orderBy(sql`${tickets.createdAt} DESC`)
      .limit(5);

    const recentTickets = recentTicketsRaw.map(t => ({
      id: t.ticketId,
      ticketNumber: t.ticketNumber || '',
      subject: t.subject || '',
      status: t.status,
      priority: t.priority || 'medium',
      userName: t.userName || 'Unknown',
      createdAt: t.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      totalUsers,
      totalEmployees,
      totalTickets,
      activeTickets,
      pendingTickets,
      resolvedTickets,
      recentUsers,
      recentTickets,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
