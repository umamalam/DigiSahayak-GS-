import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schemes, categories } from '@/lib/db/schema';
import { eq, desc, like, or, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const categoryId = searchParams.get('category');
    const status = searchParams.get('status'); // 'active' | 'inactive' | 'all'

    const all = await db
      .select({
        id: schemes.id,
        title: schemes.title,
        slug: schemes.slug,
        ministry: schemes.ministry,
        description: schemes.description,
        benefits: schemes.benefits,
        eligibility: schemes.eligibility,
        notEligible: schemes.notEligible,
        requiredDocuments: schemes.requiredDocuments,
        howToApply: schemes.howToApply,
        processingTime: schemes.processingTime,
        schemeValidity: schemes.schemeValidity,
        officialLink: schemes.officialLink,
        launchYear: schemes.launchYear,
        helplinePhone: schemes.helplinePhone,
        helplineEmail: schemes.helplineEmail,
        commonMistakes: schemes.commonMistakes,
        additionalNotes: schemes.additionalNotes,
        isActive: schemes.isActive,
        createdAt: schemes.createdAt,
        updatedAt: schemes.updatedAt,
        categoryId: schemes.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(schemes)
      .leftJoin(categories, eq(schemes.categoryId, categories.id))
      .orderBy(desc(schemes.createdAt))
      .all();

    let filtered = all;

    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.ministry.toLowerCase().includes(query) ||
          (s.categoryName || '').toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );
    }

    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter((s) => s.categoryId === parseInt(categoryId, 10));
    }

    if (status === 'active') {
      filtered = filtered.filter((s) => s.isActive);
    } else if (status === 'inactive') {
      filtered = filtered.filter((s) => !s.isActive);
    }

    return NextResponse.json({ schemes: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching admin schemes:', error);
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title, ministry, categoryId, description, benefits,
      eligibility, notEligible, requiredDocuments, howToApply,
      processingTime, schemeValidity, officialLink, launchYear,
      helplinePhone, helplineEmail, commonMistakes, additionalNotes,
      isActive,
    } = body;

    // Required field validation
    if (!title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    if (!ministry?.trim()) return NextResponse.json({ error: 'Ministry is required.' }, { status: 400 });
    if (!categoryId) return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
    if (!description?.trim()) return NextResponse.json({ error: 'Description is required.' }, { status: 400 });
    if (!benefits?.trim()) return NextResponse.json({ error: 'Benefits are required.' }, { status: 400 });

    // Verify category exists
    const category = await db.select().from(categories).where(eq(categories.id, parseInt(categoryId, 10))).get();
    if (!category) return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });

    // Generate a unique slug
    let baseSlug = generateSlug(title.trim());
    let slug = baseSlug;
    const existing = await db.select({ slug: schemes.slug }).from(schemes).where(eq(schemes.slug, slug)).get();
    if (existing) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const result = await db.insert(schemes).values({
      title: title.trim(),
      slug,
      ministry: ministry.trim(),
      categoryId: parseInt(categoryId, 10),
      description: description.trim(),
      benefits: benefits.trim(),
      eligibility: eligibility?.trim() || null,
      notEligible: notEligible?.trim() || null,
      requiredDocuments: requiredDocuments?.trim() || null,
      howToApply: howToApply?.trim() || null,
      processingTime: processingTime?.trim() || null,
      schemeValidity: schemeValidity?.trim() || null,
      officialLink: officialLink?.trim() || null,
      launchYear: launchYear?.trim() || null,
      helplinePhone: helplinePhone?.trim() || null,
      helplineEmail: helplineEmail?.trim() || null,
      commonMistakes: commonMistakes?.trim() || null,
      additionalNotes: additionalNotes?.trim() || null,
      isActive: isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning().get();

    console.log(`[Admin Schemes] Created scheme "${title}" (id: ${result.id}) by admin #${session.id}`);
    return NextResponse.json({ success: true, scheme: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating scheme:', error);
    return NextResponse.json({ error: 'Failed to create scheme.' }, { status: 500 });
  }
}
