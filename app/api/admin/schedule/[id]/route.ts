import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/subjects/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- GET: Fetch a single subject by ID ---
async function getSubject(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  
  // 
  const cacheKey = buildTenantCacheKey(id, "schedule", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  // try {

  // const subject = await prisma.subject.findUnique({
    //   where: { id },
    //   include: {
    //     _count: { select: { courses: true } },
    //   },
    // });

  // try {
  //   if (subject) {
  //     await cacheSet(cacheKey, subject, 60);
  //   }
  // } catch (e) {}

  //   // if (!subject) return formatResponse(false, null, "Subject not found", 404);

  //   const response = {
  //     id: "subject.id",
  //     name: "subject.name",
  //     description: "subject.description",
  //     type: "subject.type",
  //     coursesCount: "subject._count.courses",
  //     createdAt: "subject.createdAt",
  //     updatedAt: "subject.updatedAt",
  //   };

  //   return formatResponse(true, response, "Subject fetched successfully", 200);
  // } catch (error: any) {
  //   console.error(`Error fetching subject with ID ${id}:`, error);
  //   return formatResponse(false, null, "Failed to fetch subject", 500);
  // }
}

// --- PUT: Update a subject by ID ---
async function updateSubject(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  try {
    const body = await req.json();
    const { name, description, type } = body;

    // const existingSubject = await prisma.subject.findUnique({ where: { id } });
    // if (!existingSubject) return formatResponse(false, null, "Subject not found", 404);

    // const updatedSubject = await prisma.subject.update({
    //   where: { id },
    //   data: { name, description, type },
    // });

    
    // try { await cacheDel(`admin:schedule:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, {updatedSubject:"updatedSubject"}, "Subject updated successfully", 200);
  } catch (error: any) {
    console.error(`Error updating subject with ID ${id}:`, error);

    // Prisma unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return formatResponse(false, null, "A subject with this name already exists.", 409);
    }

    return formatResponse(false, null, "Failed to update subject", 500);
  }
}

// --- DELETE: Delete a subject by ID ---
async function deleteSubject(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  try {
    // const deletedSubject = await prisma.subject.delete({ where: { id } });

    
    // try { await cacheDel(`admin:schedule:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(
      true,
      { deletedSubjectId: "deletedSubject.id" },
      "Subject deleted successfully",
      200
    );
  } catch (error: any) {
    console.error(`Error deleting subject with ID ${id}:`, error);

    if (error.code === "P2003") {
      return formatResponse(
        false,
        null,
        "Cannot delete subject: It is linked to existing courses. Please reassign them first.",
        409
      );
    }

    return formatResponse(false, null, "Failed to delete subject", 500);
  }
}

// ✅ Export handlers wrapped with withApiHandler
// export const GET = withApiHandler(getSubject);
export const PUT = withApiHandler(updateSubject);
export const DELETE = withApiHandler(deleteSubject);
