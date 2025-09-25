// app/api/admin/departments/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";  // Adjust path as per your project structure
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
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
      where: { userId: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      return NextResponse.json({ message: 'Educator not found or not associated with a company' }, { status: 404 });
    }
    const companyId = educator.companyId;

    const departments = await prisma.department.findMany({
      where: {
        companyId: companyId, // Ensure multi-tenancy
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Map to the DepartmentOption type expected by the frontend
    const departmentOptions = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
    }));

    return NextResponse.json(departmentOptions);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ message: 'Failed to fetch departments' }, { status: 500 });
  }
}
