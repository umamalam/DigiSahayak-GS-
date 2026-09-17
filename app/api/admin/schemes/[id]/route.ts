import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schemes, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const schemeId = parseInt(id, 10);
    if (isNaN(schemeId)) return NextResponse.json({ error: 'Invalid scheme ID' }, { status: 400 });

    const existing = await db.select().from(schemes).where(eq(schemes.id, schemeId)).get();
    if (!existing) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });

    const body = await request.json();
    const {
      title, ministry, categoryId, description, benefits,
      eligibility, notEligible, requiredDocuments, howToApply,
      processingTime, schemeValidity, officialLink, launchYear,
      helplinePhone, helplineEmail, commonMistakes, additionalNotes,
      isActive,
    } = body;

    // Validate required fields if provided
    if (title !== undefined && !title?.trim()) {
      return NextResponse.json({ error: 'Title cannot be empty.' }, { status: 400 });
    }
    if (ministry !== undefined && !ministry?.trim()) {
      return NextResponse.json({ error: 'Ministry cannot be empty.' }, { status: 400 });
    }
    if (description !== undefined && !description?.trim()) {
      return NextResponse.json({ error: 'Description cannot be empty.' }, { status: 400 });
    }
    if (benefits !== undefined && !benefits?.trim()) {
      return NextResponse.json({ error: 'Benefits cannot be empty.' }, { status: 400 });
    }

    // Verify category if being changed
    if (categoryId !== undefined) {
      const category = await db.select().from(categories).where(eq(categories.id, parseInt(categoryId, 10))).get();
      if (!category) return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (title !== undefined) updatePayload.title = title.trim();
    if (ministry !== undefined) updatePayload.ministry = ministry.trim();
    if (categoryId !== undefined) updatePayload.categoryId = parseInt(categoryId, 10);
    if (description !== undefined) updatePayload.description = description.trim();
    if (benefits !== undefined) updatePayload.benefits = benefits.trim();
    if (eligibility !== undefined) updatePayload.eligibility = eligibility?.trim() || null;
    if (notEligible !== undefined) updatePayload.notEligible = notEligible?.trim() || null;
    if (requiredDocuments !== undefined) updatePayload.requiredDocuments = requiredDocuments?.trim() || null;
    if (howToApply !== undefined) updatePayload.howToApply = howToApply?.trim() || null;
    if (processingTime !== undefined) updatePayload.processingTime = processingTime?.trim() || null;
    if (schemeValidity !== undefined) updatePayload.schemeValidity = schemeValidity?.trim() || null;
    if (officialLink !== undefined) updatePayload.officialLink = officialLink?.trim() || null;
    if (launchYear !== undefined) updatePayload.launchYear = launchYear?.trim() || null;
    if (helplinePhone !== undefined) updatePayload.helplinePhone = helplinePhone?.trim() || null;
    if (helplineEmail !== undefined) updatePayload.helplineEmail = helplineEmail?.trim() || null;
    if (commonMistakes !== undefined) updatePayload.commonMistakes = commonMistakes?.trim() || null;
    if (additionalNotes !== undefined) updatePayload.additionalNotes = additionalNotes?.trim() || null;
    if (isActive !== undefined) updatePayload.isActive = isActive;

    const updated = await db
      .update(schemes)
      .set(updatePayload)
      .where(eq(schemes.id, schemeId))
      .returning()
      .get();

    console.log(`[Admin Schemes] Updated scheme #${schemeId} ("${existing.title}") by admin #${session.id}`);
    return NextResponse.json({ success: true, scheme: updated });
  } catch (error) {
    console.error('Error updating scheme:', error);
    return NextResponse.json({ error: 'Failed to update scheme.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const schemeId = parseInt(id, 10);
    if (isNaN(schemeId)) return NextResponse.json({ error: 'Invalid scheme ID' }, { status: 400 });

    const existing = await db.select().from(schemes).where(eq(schemes.id, schemeId)).get();
    if (!existing) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });

    // Soft delete — mark inactive instead of hard delete to preserve application history
    await db
      .update(schemes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schemes.id, schemeId))
      .run();

    console.log(`[Admin Schemes] Deactivated scheme #${schemeId} ("${existing.title}") by admin #${session.id}`);
    return NextResponse.json({ success: true, message: `Scheme "${existing.title}" has been deactivated.` });
  } catch (error) {
    console.error('Error deactivating scheme:', error);
    return NextResponse.json({ error: 'Failed to deactivate scheme.' }, { status: 500 });
  }
}
