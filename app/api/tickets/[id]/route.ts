import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tickets as ticketsTable, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { message: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, priority, response, assignedTo } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (response) updateData.response = response;
    if (assignedTo) updateData.assignedTo = assignedTo;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await db
      .update(ticketsTable)
      .set(updateData)
      .where(eq(ticketsTable.id, ticketId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { message: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
