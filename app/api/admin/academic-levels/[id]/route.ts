import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/academic-levels/[id]
// Fetches a single AcademicLevel by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const academicLevel = await prisma.academicLevel.findUnique({
      where: { id },
    });

    if (!academicLevel) {
      return NextResponse.json({ message: "Academic level not found" }, { status: 404 });
    }

    return NextResponse.json(academicLevel, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching academic level with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch academic level", error: error.message }, { status: 500 });
  }
}

// PATCH /api/academic-levels/[id]
// Updates an existing AcademicLevel by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    const { name, description, sortOrder } = body;

    // Check if academic level exists
    const existingAcademicLevel = await prisma.academicLevel.findUnique({
      where: { id },
    });

    if (!existingAcademicLevel) {
      return NextResponse.json({ message: "Academic level not found" }, { status: 404 });
    }

    // Check for uniqueness if name is being updated
    if (name !== undefined && name !== existingAcademicLevel.name) {
      const duplicateCheck = await prisma.academicLevel.findUnique({
        where: {
          companyId_name: {
            companyId: existingAcademicLevel.companyId,
            name: name,
          },
        },
      });
      if (duplicateCheck) {
        return NextResponse.json({ message: `An academic level named '${name}' already exists for this company.` }, { status: 409 });
      }
    }

    const updatedAcademicLevel = await prisma.academicLevel.update({
      where: { id },
      data: {
        name,
        description,
        sortOrder,
      },
    });

    return NextResponse.json(updatedAcademicLevel, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating academic level with ID ${id}:`, error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "An academic level with this name already exists for this company." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update academic level", error: error.message }, { status: 500 });
  }
}

// DELETE /api/academic-levels/[id]
// Deletes an AcademicLevel by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const existingAcademicLevel = await prisma.academicLevel.findUnique({
      where: { id },
    });

    if (!existingAcademicLevel) {
      return NextResponse.json({ message: "Academic level not found" }, { status: 404 });
    }

    // IMPORTANT: Handle cascading effects for students and educator assignments
    // Prisma will prevent deletion if students or educator assignments are still linked
    // unless you configure onDelete actions (e.g., CASCADE, SET NULL).
    // Option 1: Prevent deletion and inform user (current behavior with P2003)
    // Option 2: Set student.academicLevelId to null (if academicLevelId is optional in Student model)
    // Option 3: Delete associated students (use with EXTREME caution!)
    // Option 4: Delete associated educator assignments (already configured with onDelete: Cascade)

    const deletedAcademicLevel = await prisma.academicLevel.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Academic level deleted successfully", deletedId: deletedAcademicLevel.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting academic level with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete academic level: It is linked to existing students or educator assignments. Please reassign them first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete academic level", error: error.message }, { status: 500 });
  }
}
