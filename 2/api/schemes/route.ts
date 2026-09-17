import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schemes, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const schemeSlug = searchParams.get('slug');

    // Get single scheme by slug
    if (schemeSlug) {
      const [scheme] = await db
        .select()
        .from(schemes)
        .where(eq(schemes.slug, schemeSlug))
        .limit(1);
      
      if (!scheme) {
        return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
      }
      
      return NextResponse.json(scheme);
    }

    // Get schemes by category
    if (categorySlug) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      const categorySchemes = await db
        .select()
        .from(schemes)
        .where(eq(schemes.categoryId, category.id));

      return NextResponse.json(categorySchemes);
    }

    // Get all schemes
    const allSchemes = await db.select().from(schemes);
    return NextResponse.json(allSchemes);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500 });
  }
}
