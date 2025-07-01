import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/departments/[id]
// Fetches a single department by ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            educators: true,
            courses: true,
          },
        },
        head: {
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
    });

    if (!department) {
      return NextResponse.json({ message: "Department not found" }, { status: 404 });
    }

    // Transform the data
    const response = {
      id: department.id,
      name: department.name,
      description: department.description,
      head: department.head,
      educatorCount: department._count.educators,
      courseCount: department._count.courses,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`Error fetching department with ID ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: "Failed to fetch department", error: errorMessage }, { status: 500 });
  }
}

// PUT /api/departments/[id]
// Updates an existing department by ID.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (request.method !== "PUT") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { name, description, headId } = body;

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      return NextResponse.json({ message: "Department not found" }, { status: 404 });
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name,
        description,
        headId,
      },
    });

    return NextResponse.json(updatedDepartment, { status: 200 });
  } catch (error) {
    console.error(`Error updating department with ID ${id}:`, error);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: "Failed to update department", error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/departments/[id]
// Deletes a department by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (request.method !== "DELETE") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    // Before deleting a department, consider if it has related educators or courses.
    // Prisma's default behavior might prevent deletion if there are related records
    // and the foreign key is not set to CASCADE DELETE.
    // You might need to handle these relations (e.g., nullify departmentId on educators/courses)
    // or return an error if related records exist.
    // For simplicity, this example assumes CASCADE DELETE is handled in Prisma or
    // you want to prevent deletion if relations exist.

    const deletedDepartment = await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Department deleted successfully", deletedDepartmentId: deletedDepartment.id }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting department with ID ${id}:`, error);
    // Handle specific error if department is linked to other records (e.g., P2003 Foreign key constraint failed)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === 'P2003'
    ) {
      return NextResponse.json({ message: "Cannot delete department: It is linked to existing educators or courses. Please reassign them first." }, { status: 409 });
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: "Failed to delete department", error: errorMessage }, { status: 500 });
  }
}
