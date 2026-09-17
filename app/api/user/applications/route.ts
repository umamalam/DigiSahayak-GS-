import { db } from '@/lib/db';
import { userApplications, users, schemes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const user = await db.select().from(users).limit(1);
    
    if (!user.length) {
      return Response.json({ error: 'No user found' }, { status: 404 });
    }

    const apps = await db
      .select()
      .from(userApplications)
      .where(eq(userApplications.userId, user[0].id));

    // Fetch scheme details for each application
    const appsWithSchemes = await Promise.all(
      apps.map(async (app) => {
        const scheme = await db
          .select()
          .from(schemes)
          .where(eq(schemes.id, app.schemeId))
          .limit(1);
        
        return {
          id: app.id,
          schemeId: app.schemeId,
          schemeName: scheme[0]?.title || 'Unknown Scheme',
          status: app.status,
          appliedAt: app.appliedAt,
          updatedAt: app.updatedAt,
        };
      })
    );

    return Response.json({ applications: appsWithSchemes });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return Response.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schemeId, status } = body;

    const user = await db.select().from(users).limit(1);
    
    if (!user.length) {
      return Response.json({ error: 'No user found' }, { status: 404 });
    }

    const newApp = await db
      .insert(userApplications)
      .values({
        userId: user[0].id,
        schemeId,
        status: status || 'Not Started',
      })
      .returning();

    return Response.json({
      application: {
        id: newApp[0].id,
        schemeId: newApp[0].schemeId,
        status: newApp[0].status,
        appliedAt: newApp[0].appliedAt,
      },
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return Response.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, status } = body;

    const updated = await db
      .update(userApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(userApplications.id, applicationId))
      .returning();

    if (!updated.length) {
      return Response.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return Response.json({
      application: {
        id: updated[0].id,
        status: updated[0].status,
        updatedAt: updated[0].updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return Response.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
