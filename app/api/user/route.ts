import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    // For now, return the first user (default user)
    // In production, this would check session/auth
    const user = await db.select().from(users).limit(1);
    
    if (!user.length) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      phone: user[0].phone,
      createdAt: user[0].createdAt,
      isVerified: user[0].isVerified,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
