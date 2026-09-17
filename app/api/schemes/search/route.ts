import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schemes, categories, favoriteSchemes } from '@/lib/db/schema';
import { eq, like, or, and, desc, asc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const ministry = searchParams.get('ministry');
    const categoryId = searchParams.get('category');
    const sortBy = searchParams.get('sort') || 'recent';

    const conditions = [eq(schemes.isActive, true)];

    if (query) {
      conditions.push(
        or(
          like(schemes.title, `%${query}%`),
          like(schemes.description, `%${query}%`),
          like(schemes.ministry, `%${query}%`),
          like(schemes.benefits, `%${query}%`)
        )!
      );
    }

    if (ministry) {
      conditions.push(like(schemes.ministry, `%${ministry}%`));
    }

    if (categoryId) {
      conditions.push(eq(schemes.categoryId, parseInt(categoryId)));
    }

    const orderMap: Record<string, any> = {
      recent: desc(schemes.createdAt),
      title_asc: asc(schemes.title),
      title_desc: desc(schemes.title),
    };

    const results = await db
      .select({
        id: schemes.id,
        title: schemes.title,
        slug: schemes.slug,
        ministry: schemes.ministry,
        description: schemes.description,
        benefits: schemes.benefits,
        imageUrl: schemes.imageUrl,
        launchYear: schemes.launchYear,
        categoryId: schemes.categoryId,
        createdAt: schemes.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
        },
      })
      .from(schemes)
      .leftJoin(categories, eq(schemes.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(orderMap[sortBy] || desc(schemes.createdAt))
      .limit(50)
      .all();

    return NextResponse.json({ schemes: results });
  } catch (error) {
    console.error('Error searching schemes:', error);
    return NextResponse.json({ error: 'Failed to search schemes' }, { status: 500 });
  }
}
