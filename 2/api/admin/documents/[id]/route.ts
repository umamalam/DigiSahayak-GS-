import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userDocuments, notifications } from '@/lib/db/schema';
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
      return NextResponse.json({ error: 'Forbidden — admin or employee access required' }, { status: 403 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);

    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, verificationNotes } = body;

    const validStatuses = ['uploaded', 'pending_verification', 'verified', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch the existing document
    const existing = await db
      .select()
      .from(userDocuments)
      .where(eq(userDocuments.id, documentId))
      .get();

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Build the update payload
    const updatePayload: Record<string, any> = {};

    if (status !== undefined && status !== existing.status) {
      updatePayload.status = status;
      updatePayload.verifiedBy = session.id;
      updatePayload.verifiedAt = new Date();
    }

    if (verificationNotes !== undefined) {
      updatePayload.verificationNotes = verificationNotes;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    // Apply the update
    const updated = await db
      .update(userDocuments)
      .set(updatePayload)
      .where(eq(userDocuments.id, documentId))
      .returning()
      .get();

    // Send notification to the user when status changes to verified or rejected
    const notifyStatuses = ['verified', 'rejected'];
    if (status && status !== existing.status && notifyStatuses.includes(status)) {
      const docLabel = existing.sourceLabel || existing.documentType;
      const isApproved = status === 'verified';

      const notifTitle = isApproved ? 'Document Verified ✅' : 'Document Rejected ❌';
      const notifMessage = isApproved
        ? `Your document "${docLabel}" has been verified successfully.`
        : `Your document "${docLabel}" was rejected. ${verificationNotes ? `Reason: ${verificationNotes}` : 'Please re-upload a clearer copy.'}`;

      await db.insert(notifications).values({
        userId: existing.userId,
        type: 'document_verification',
        title: notifTitle,
        message: notifMessage,
        link: '/profile',
        entityType: 'document',
        entityId: documentId,
        createdAt: new Date(),
      });

      console.log(
        `[Doc Verify] Document #${documentId} marked as "${status}" by ${session.email} — notification sent to user #${existing.userId}`
      );
    }

    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}
