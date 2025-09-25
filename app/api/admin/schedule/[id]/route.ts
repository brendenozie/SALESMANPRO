import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET /api/subjects/[id]
// Fetches a single subject by ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params;

  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    // Transform the data
    const response = {
      id: subject.id,
      name: subject.name,
      description: subject.description,
      type: subject.type,
      coursesCount: subject._count.courses,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`Error fetching subject with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch subject", error: error.message }, { status: 500 });
  }
}

// PUT /api/subjects/[id]
// Updates an existing subject by ID.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  if (request.method !== "PUT") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { name, description, type } = body;

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        name,
        description,
        type,
      },
    });

    return NextResponse.json(updatedSubject, { status: 200 });
  } catch (error) {
    console.error(`Error updating subject with ID ${id}:`, error);
    // Handle unique constraint error for subject name
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return NextResponse.json({ message: "A subject with this name already exists." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update subject", error: error.message }, { status: 500 });
  }
}

// DELETE /api/subjects/[id]
// Deletes a subject by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  if (request.method !== "DELETE") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    // Before deleting a subject, consider if it has related courses.
    // Prisma's default behavior might prevent deletion if there are related records
    // and the foreign key is not set to CASCADE DELETE.
    // You might need to handle these relations (e.g., nullify subjectId on courses if applicable)
    // or return an error if related records exist.
    const deletedSubject = await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Subject deleted successfully", deletedSubjectId: deletedSubject.id }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting subject with ID ${id}:`, error);
    // Handle specific error if subject is linked to other records (e.g., P2003 Foreign key constraint failed)
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete subject: It is linked to existing courses. Please reassign them first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete subject", error: error.message }, { status: 500 });
  }
}
