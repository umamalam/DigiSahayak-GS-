import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userApplications, notifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session || (session.role !== 'admin' && session.role !== 'employee')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, reviewNotes } = body;
    const { id } = await params;
    const applicationId = parseInt(id);

    const application = await db
      .select()
      .from(userApplications)
      .where(eq(userApplications.id, applicationId))
      .get();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updated = await db
      .update(userApplications)
      .set({
        status: status || application.status,
        reviewNotes: reviewNotes !== undefined ? reviewNotes : application.reviewNotes,
        reviewedBy: session.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userApplications.id, applicationId))
      .returning()
      .get();

    const statusMessages: Record<string, string> = {
      under_review: 'is now under review',
      approved: 'has been approved',
      rejected: 'has been rejected',
      on_hold: 'has been put on hold',
    };

    if (status && status !== application.status) {
      await db.insert(notifications).values({
        userId: application.userId,
        type: 'application_status',
        title: 'Application Status Updated',
        message: `Your application #${application.applicationNumber} ${statusMessages[status] || 'has been updated'}`,
        link: `/profile/applications/${applicationId}`,
        entityType: 'application',
        entityId: applicationId,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
