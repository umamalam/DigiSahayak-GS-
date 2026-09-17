import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { favoriteSchemes, schemes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

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

    const favorites = await db
      .select({
        id: favoriteSchemes.id,
        schemeId: favoriteSchemes.schemeId,
        createdAt: favoriteSchemes.createdAt,
        scheme: {
          id: schemes.id,
          title: schemes.title,
          slug: schemes.slug,
          ministry: schemes.ministry,
          description: schemes.description,
          imageUrl: schemes.imageUrl,
        },
      })
      .from(favoriteSchemes)
      .leftJoin(schemes, eq(favoriteSchemes.schemeId, schemes.id))
      .where(eq(favoriteSchemes.userId, session.id))
      .all();

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
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
    const { schemeId } = body;

    if (!schemeId) {
      return NextResponse.json({ error: 'Scheme ID is required' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(favoriteSchemes)
      .where(
        and(
          eq(favoriteSchemes.userId, session.id),
          eq(favoriteSchemes.schemeId, schemeId)
        )
      )
      .get();

    if (existing) {
      await db
        .delete(favoriteSchemes)
        .where(eq(favoriteSchemes.id, existing.id))
        .run();

      return NextResponse.json({ success: true, action: 'removed' });
    }

    await db.insert(favoriteSchemes).values({
      userId: session.id,
      schemeId,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, action: 'added' });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
