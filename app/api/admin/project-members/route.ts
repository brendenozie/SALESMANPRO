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

/**
 * Handles GET requests to retrieve project members.
 * Can filter by projectId.
 */
export const GET = withApiHandler(async (request: Request) => {
  
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const projectMembers = await prisma.projectMember.findMany({
    where: projectId ? { projectId } : {},
    include: {
      project: true,
      user: true,
    },
  });

  return formatResponse(true, projectMembers, "Project members fetched successfully", 200);
});

/**
 * Handles POST requests to create a new project member.
 */
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

    return formatResponse(true, newProjectMember, "Project member created successfully", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return formatResponse(false, null, "User is already a member of this project.", 409);
    }
    throw error; // will be caught by withApiHandler
  }
});

/**
 * Disallow unsupported methods explicitly.
 */
export async function PUT() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}

export async function DELETE() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}
