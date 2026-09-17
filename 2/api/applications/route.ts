import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userApplications, users, schemes, notifications } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

function generateApplicationNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `APP${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { schemeId, formData, documentIds } = body;

    if (!schemeId) {
      return NextResponse.json({ error: 'Scheme ID is required' }, { status: 400 });
    }

    const scheme = await db.select().from(schemes).where(eq(schemes.id, schemeId)).get();
    if (!scheme) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }

    const applicationNumber = generateApplicationNumber();

    const newApplication = await db.insert(userApplications).values({
      userId: session.id,
      schemeId,
      applicationNumber,
      status: 'submitted',
      formData: JSON.stringify(formData || {}),
      attachedDocuments: JSON.stringify(documentIds || []),
      appliedAt: new Date(),
      updatedAt: new Date(),
    }).returning().get();

    await db.insert(notifications).values({
      userId: session.id,
      type: 'application_status',
      title: 'Application Submitted',
      message: `Your application for "${scheme.title}" has been submitted successfully.`,
      link: `/profile/applications/${newApplication.id}`,
      entityType: 'application',
      entityId: newApplication.id,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      application: newApplication,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await db
      .select({
        id: userApplications.id,
        applicationNumber: userApplications.applicationNumber,
        status: userApplications.status,
        appliedAt: userApplications.appliedAt,
        updatedAt: userApplications.updatedAt,
        reviewNotes: userApplications.reviewNotes,
        scheme: {
          id: schemes.id,
          title: schemes.title,
          ministry: schemes.ministry,
          imageUrl: schemes.imageUrl,
        },
      })
      .from(userApplications)
      .leftJoin(schemes, eq(userApplications.schemeId, schemes.id))
      .where(eq(userApplications.userId, session.id))
      .orderBy(desc(userApplications.appliedAt))
      .all();

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
