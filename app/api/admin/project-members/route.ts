import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/project-members/route.ts

import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Define the expected shape for project member creation
interface ProjectMemberCreateData {
  projectId: string;
  userId: string;
  role: string; // Adjust if using an enum
}


export const GET = withApiHandler(async (request: Request) => {
  
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const cacheKey = buildTenantCacheKey(projectId, "project-members", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const projectMembers = await prisma.projectMember.findMany({
    where: projectId ? { projectId } : {},
    include: {
      project: true,
      user: true,
    },
  });

  try {
    if (projectMembers) {
      await cacheSet(cacheKey, projectMembers, 60);
    }
  } catch (e) {}

  return formatResponse(true, projectMembers, "Project members fetched successfully", 200);
});


export const POST = withApiHandler(async (request: Request) => {
  
  const { projectId, userId, role }: ProjectMemberCreateData = await request.json();

  if (!projectId || !userId || !role) {
    return formatResponse(false, null, "Missing required fields: projectId, userId, and role are required.", 400);
  }

  try {
    const newProjectMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
    });

    
    try {
      await cacheDel(`tenant:${projectId}:project-members:*`);
      await cacheDel(`admin:project-members:*`);
    } catch (e) {}
    return formatResponse(true, newProjectMember, "Project member created successfully", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return formatResponse(false, null, "User is already a member of this project.", 409);
    }
    throw error; // will be caught by withApiHandler
  }
});


export async function PUT() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}

export async function DELETE() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}
