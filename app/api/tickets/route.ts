import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tickets as ticketsTable, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

// Seed demo tickets if they don't exist
async function seedDemoTickets() {
  try {
    const existingTickets = await db.select().from(ticketsTable).limit(1);
    if (existingTickets.length > 0) return; // Already seeded

    // Get user and scheme IDs from database
    const allUsers = await db.select().from(users);
    const userId = allUsers[0]?.id || 1;

    const demoTickets = [
      {
        ticketNumber: 'TKT-001',
        userId,
        schemeId: null,
        subject: 'Payment gateway issue',
        description: 'Unable to complete payment for scheme application',
        status: 'open' as const,
        priority: 'high' as const,
      },
      {
        ticketNumber: 'TKT-002',
        userId,
        schemeId: null,
        subject: 'Refund pending',
        description: 'Refund for cancelled application still pending',
        status: 'in_progress' as const,
        priority: 'medium' as const,
      },
      {
        ticketNumber: 'TKT-003',
        userId,
        schemeId: null,
        subject: 'Document verification',
        description: 'My documents are still under verification',
        status: 'open' as const,
        priority: 'high' as const,
      },
      {
        ticketNumber: 'TKT-004',
        userId,
        schemeId: null,
        subject: 'KYC not updated',
        description: 'KYC verification status not reflecting',
        status: 'in_progress' as const,
        priority: 'low' as const,
      },
      {
        ticketNumber: 'TKT-005',
        userId,
        schemeId: null,
        subject: 'Application status',
        description: 'Application shows pending but should be approved',
        status: 'open' as const,
        priority: 'medium' as const,
      },
      {
        ticketNumber: 'TKT-006',
        userId,
        schemeId: null,
        subject: 'Form submission error',
        description: 'Form keeps showing validation error',
        status: 'resolved' as const,
        priority: 'high' as const,
      },
    ];

    for (const ticket of demoTickets) {
      await db.insert(ticketsTable).values(ticket);
    }
  } catch (error) {
    console.error('Error seeding demo tickets:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    if (!user.length || (user[0].role !== 'employee' && user[0].role !== 'admin')) {
      return NextResponse.json({ message: 'Forbidden - Employee or Admin access required' }, { status: 403 });
    }

    // Seed demo tickets on first request
    await seedDemoTickets();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let allTickets;
    
    if (userId) {
      allTickets = await db
        .select({
          id: ticketsTable.id,
          ticketNumber: ticketsTable.ticketNumber,
          subject: ticketsTable.subject,
          title: ticketsTable.title,
          description: ticketsTable.description,
          status: ticketsTable.status,
          priority: ticketsTable.priority,
          response: ticketsTable.response,
          assignedTo: ticketsTable.assignedTo,
          schemeId: ticketsTable.schemeId,
          createdAt: ticketsTable.createdAt,
          updatedAt: ticketsTable.updatedAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(ticketsTable)
        .leftJoin(users, eq(ticketsTable.userId, users.id))
        .where(eq(ticketsTable.userId, parseInt(userId)));
    } else {
      allTickets = await db
        .select({
          id: ticketsTable.id,
          ticketNumber: ticketsTable.ticketNumber,
          subject: ticketsTable.subject,
          title: ticketsTable.title,
          description: ticketsTable.description,
          status: ticketsTable.status,
          priority: ticketsTable.priority,
          response: ticketsTable.response,
          assignedTo: ticketsTable.assignedTo,
          schemeId: ticketsTable.schemeId,
          createdAt: ticketsTable.createdAt,
          updatedAt: ticketsTable.updatedAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(ticketsTable)
        .leftJoin(users, eq(ticketsTable.userId, users.id));
    }

    return NextResponse.json(allTickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    if (!user.length || (user[0].role !== 'employee' && user[0].role !== 'admin')) {
      return NextResponse.json({ message: 'Forbidden - Employee or Admin access required' }, { status: 403 });
    }

    const { userId, subject, description, priority, schemeId } = await request.json();

    if (!userId || !subject || !description || !schemeId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}`;

    const newTicket = {
      userId,
      ticketNumber,
      subject,
      description,
      schemeId,
      status: 'open' as const,
      priority: (priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
    };

    const result = await db.insert(ticketsTable).values(newTicket).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
