import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/project-members/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Define the expected shape for updating a project member
interface ProjectMemberUpdateData {
  role?: string;
}

// GET: Retrieve a single project member by ID
export const GET = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {

  const { id } = params;
  if (!id) return formatResponse(false, null, "Project member ID is required.", 400);

    const cacheKey = `admin:project-members:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const projectMember = await prisma.projectMember.findUnique({
    where: { id },
    include: { project: true, user: true },
  });

  if (!projectMember) return formatResponse(false, null, "Project member not found.", 404);

  try {
    if (projectMember) {
      await cacheSet(cacheKey, projectMember, 60);
    }
  } catch (e) {}

  return formatResponse(true, projectMember, "Project member fetched successfully", 200);
});

// PUT: Update a project member by ID
export const PUT = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  


  const { id } = params;
  const { role }: ProjectMemberUpdateData = await request.json();

  if (!id) return formatResponse(false, null, "Project member ID is required for update.", 400);
  if (!role) return formatResponse(false, null, "Role is required for update.", 400);

  const updatedProjectMember = await prisma.projectMember.update({
    where: { id },
    data: { role },
  });

    try { await cacheDel(`admin:project-members:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedProjectMember, "Project member updated successfully", 200);
});

// DELETE: Remove a project member by ID
export const DELETE = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  
  const { id } = params;
  if (!id) return formatResponse(false, null, "Project member ID is required for deletion.", 400);

  await prisma.projectMember.delete({ where: { id } });
  
    try { await cacheDel(`admin:project-members:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Project member deleted successfully", 200);
});

// POST not allowed
export async function POST() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}
