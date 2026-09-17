import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userDocuments, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session || (session.role !== 'admin' && session.role !== 'employee')) {
      return NextResponse.json({ error: 'Forbidden — admin or employee access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Alias tables to distinguish uploader vs verifier
    const uploader = users;

    const query = db
      .select({
        id: userDocuments.id,
        documentType: userDocuments.documentType,
        sourceLabel: userDocuments.sourceLabel,
        filePath: userDocuments.filePath,
        fileName: userDocuments.fileName,
        fileSize: userDocuments.fileSize,
        contentType: userDocuments.contentType,
        status: userDocuments.status,
        verificationNotes: userDocuments.verificationNotes,
        verifiedAt: userDocuments.verifiedAt,
        uploadedAt: userDocuments.uploadedAt,
        userId: userDocuments.userId,
        userName: uploader.name,
        userEmail: uploader.email,
      })
      .from(userDocuments)
      .leftJoin(uploader, eq(userDocuments.userId, uploader.id))
      .orderBy(desc(userDocuments.uploadedAt));

    const all = await query.all();

    const filtered = statusFilter && statusFilter !== 'all'
      ? all.filter((d) => d.status === statusFilter)
      : all;

    return NextResponse.json({ documents: filtered });
  } catch (error) {
    console.error('Error fetching documents for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
