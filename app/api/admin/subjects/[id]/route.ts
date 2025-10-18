import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/subjects/[id]
async function handleGET(request: Request, { params }: { params: { id: string } }) {
  
  const { id } = params;

  try {
    // const subject = await prisma.subject.findUnique({
    //   where: { id },
    //   include: {
    //     _count: {
    //       select: { courses: true },
    //     },
    //   },
    // });

    // if (!subject) return formatResponse(false, null, "Subject not found", 404);

    const response = {
      id: "subject.id",
      name: "subject.name",
      description: "subject.description",
      type: "subject.type",
      coursesCount: "subject._count.courses",
      createdAt: "subject.createdAt",
      updatedAt: "subject.updatedAt",
    };

    return formatResponse(true, response);
  } catch (error: any) {
    console.error(`Error fetching subject with ID ${id}:`, error);
    return formatResponse(false, null, error.message, 500);
  }
}

// PUT /api/subjects/[id]
async function handlePUT(request: Request, { params }: { params: { id: string } }) {
  


  const { id } = params;

  try {
    const body = await request.json();
    const { name, description, type } = body;

    // const existingSubject = await prisma.subject.findUnique({ where: { id } });
    // if (!existingSubject) return formatResponse(false, null, "Subject not found", 404);

    // const updatedSubject = await prisma.subject.update({
    //   where: { id },
    //   data: { name, description, type },
    // });

    return formatResponse(true, {updatedSubject: "updatedSubject"}, "Subject updated successfully");
  } catch (error: any) {
    console.error(`Error updating subject with ID ${id}:`, error);

    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return formatResponse(false, null, "A subject with this name already exists.", 409);
    }

    return formatResponse(false, null, error.message, 500);
  }
}

// DELETE /api/subjects/[id]
async function handleDELETE(request: Request, { params }: { params: { id: string } }) {
  


  const { id } = params;

  try {
    // const deletedSubject = await prisma.subject.delete({ where: { id } });

    return formatResponse(true, { deletedSubjectId: "deletedSubject.id", message: "Subject deleted successfully" });
  } catch (error: any) {
    console.error(`Error deleting subject with ID ${id}:`, error);

    if (error.code === 'P2003') {
      return formatResponse(false, null, "Cannot delete subject: It is linked to existing courses. Please reassign them first.", 409);
    }

    return formatResponse(false, null, error.message, 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(handleGET);
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
