import { db } from '@/lib/db';
import { schemes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schemeId = parseInt(id, 10);

    if (isNaN(schemeId)) {
      return NextResponse.json(
        { error: 'Invalid scheme ID' },
        { status: 400 }
      );
    }

    const [scheme] = await db
      .select()
      .from(schemes)
      .where(eq(schemes.id, schemeId))
      .limit(1);

    if (!scheme) {
      return NextResponse.json(
        { error: 'Scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scheme);
  } catch (error) {
    console.error('Error fetching scheme:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheme' },
      { status: 500 }
    );
  }
}
