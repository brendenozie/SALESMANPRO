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
export const GET = withApiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  if (!id) return formatResponse(false, null, "Project member ID is required.", 400);

  const projectMember = await prisma.projectMember.findUnique({
    where: { id },
    include: { project: true, user: true },
  });

  if (!projectMember) return formatResponse(false, null, "Project member not found.", 404);

  return formatResponse(true, projectMember, "Project member fetched successfully", 200);
});

// PUT: Update a project member by ID
export const PUT = withApiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const { role }: ProjectMemberUpdateData = await request.json();

  if (!id) return formatResponse(false, null, "Project member ID is required for update.", 400);
  if (!role) return formatResponse(false, null, "Role is required for update.", 400);

  const updatedProjectMember = await prisma.projectMember.update({
    where: { id },
    data: { role },
  });

  return formatResponse(true, updatedProjectMember, "Project member updated successfully", 200);
});

// DELETE: Remove a project member by ID
export const DELETE = withApiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  if (!id) return formatResponse(false, null, "Project member ID is required for deletion.", 400);

  await prisma.projectMember.delete({ where: { id } });

  return formatResponse(true, null, "Project member deleted successfully", 200);
});

// POST not allowed
export async function POST() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}
