// app/api/admin/parents/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId'); // Used to derive companyId

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user has 'ADMIN' or 'EDUCATOR' role.
  // 3. If 'EDUCATOR', ensure they are accessing data within their company.
  // const session = await auth();
  // if (!session || !session.user) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!teacherId) {
    return NextResponse.json({ message: 'Missing teacherId' }, { status: 400 });
  }

  try {
    // Derive companyId from the educator (teacherId)
    const educator = await prisma.educator.findUnique({
      where: { id: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      return NextResponse.json({ message: 'Educator not found or not associated with a company' }, { status: 404 });
    }
    const companyId = educator.companyId;

    const parents = await prisma.parent.findMany({
      where: {
        companyId: companyId, // Ensure multi-tenancy
      },
      include: {
        user: {
          select: { name: true, email: true }, // Include user details for parent name/email
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Map to the ParentOption type expected by the frontend
    const parentOptions = parents.map(parent => ({
      id: parent.id,
      name: parent.user?.name || 'N/A',
      email: parent.user?.email || 'N/A',
    }));

    return NextResponse.json(parentOptions);
  } catch (error) {
    console.error('Error fetching parents:', error);
    return NextResponse.json({ message: 'Failed to fetch parents' }, { status: 500 });
  }
}
