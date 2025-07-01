import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; 

// GET /api/departments
// Fetches all departments with aggregated counts of educators and courses.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (companyId) {

      const departments = await prisma.department.findMany({
        where: { companyId: companyId },
        include: {
          _count: {
            select: {
              educators: true, // Count of educators in this department
              courses: true,   // Count of courses offered by this department
            },
          },
          head: { // Include head of department details if available
            select: {
              id: true,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: 'asc', // Order departments alphabetically by name
        },
      });

      // Transform the data to include counts directly in the main object
      const response = departments.map(department => ({
        id: department.id,
        name: department.name,
        description: department.description,
        head: department.head, // Contains id, name, email of the head
        companyId: department.companyId,
        educatorCount: department._count.educators,
        courseCount: department._count.courses,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
      }));

      return NextResponse.json(response, { status: 200 });
     } else {
      // For a multi-tenant app, it's safer to require companyId or courseId for a global view.
      // If neither is provided, we might return an error or all assignments (less secure).
      // For now, let's require companyId for the global view.
      return NextResponse.json({ message: "companyId is required." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: "Failed to fetch departments", error: errorMessage }, { status: 500 });
  }
}

// POST /api/departments
// Creates a new department.
export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { name, description, headId, companyId } = body;

    // Basic validation (add more robust validation as needed)
    if (!name) {
      return NextResponse.json({ message: "Department name is required." }, { status: 400 });
    }

    const newDepartment = await prisma.department.create({
      data: {
        name,
        description,
        headId: headId || null, // This will link to an existing User's ID
        companyId: companyId || null,
      },
    });

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    // Handle unique constraint error for department name
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === 'P2002' &&
      "meta" in error &&
      (error as any).meta?.target?.includes('name')
    ) {
      return NextResponse.json({ message: "A department with this name already exists." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create department", error: (error as any).message }, { status: 500 });
  }
}
