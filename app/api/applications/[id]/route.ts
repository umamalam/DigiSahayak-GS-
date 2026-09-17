import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userApplications, schemes, userDocuments } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);
    
    const application = await db
      .select({
        id: userApplications.id,
        userId: userApplications.userId,
        applicationNumber: userApplications.applicationNumber,
        status: userApplications.status,
        formData: userApplications.formData,
        attachedDocuments: userApplications.attachedDocuments,
        reviewNotes: userApplications.reviewNotes,
        appliedAt: userApplications.appliedAt,
        updatedAt: userApplications.updatedAt,
        reviewedAt: userApplications.reviewedAt,
        scheme: {
          id: schemes.id,
          title: schemes.title,
          ministry: schemes.ministry,
          description: schemes.description,
          imageUrl: schemes.imageUrl,
          requiredDocuments: schemes.requiredDocuments,
        },
      })
      .from(userApplications)
      .leftJoin(schemes, eq(userApplications.schemeId, schemes.id))
      .where(and(
        eq(userApplications.id, applicationId),
        eq(userApplications.userId, session.id)
      ))
      .get();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    let documents: (typeof userDocuments.$inferSelect)[] = [];
    if (application.attachedDocuments) {
      try {
        const docIds = JSON.parse(application.attachedDocuments);
        if (docIds.length > 0) {
          documents = await db
            .select()
            .from(userDocuments)
            .where(and(
              inArray(userDocuments.id, docIds),
              eq(userDocuments.userId, session.id)
            ))
            .all();
        }
      } catch (e) {
        console.error('Error parsing attached documents:', e);
      }
    }

    return NextResponse.json({
      application: {
        ...application,
        formData: application.formData ? JSON.parse(application.formData) : {},
        documents,
      },
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}
