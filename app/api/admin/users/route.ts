// app/api/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust path if needed

// GET /api/users
// Fetches all users, optionally filtered by companyId (though users might not always be company-specific)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId'); // Optional filter

    const users = await prisma.user.findMany({
      where: companyId ? { Company: { some: { id: companyId } } } : {}, // Assuming User has a relation to Company
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users', error: (error as Error).message }, { status: 500 });
  }
}
