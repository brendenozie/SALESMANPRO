// app/api/projects/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Project status type
export type ProjectStatus =
  | "PLANNING"
  | "ONGOING"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED";

// Expected shape for creating a project
interface ProjectCreateData {
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: ProjectStatus;
  budget?: number | null;
  companyId?: string | null;
}

/**
 * GET /api/projects - Fetch all projects
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const projects = await prisma.project.findMany({
    include: {
      tasks: true,
      events: true,
      donations: true,
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  return formatResponse(true, projects, "Projects fetched successfully", 200);
});

/**
 * POST /api/projects - Create a new project
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const {
    name,
    description,
    startDate,
    endDate,
    status,
    budget,
    companyId,
  }: ProjectCreateData = await request.json();

  if (!name) {
    return formatResponse(false, null, "Project name is required.", 400);
  }

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        budget,
        companyId,
      },
    });

    return formatResponse(true, newProject, "Project created successfully", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return formatResponse(
        false,
        null,
        "A project with this name already exists.",
        409
      );
    }
    throw error; // let withApiHandler deal with unexpected errors
  }
});

/**
 * Explicitly disallow unsupported methods
 */
export async function PUT() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}

export async function DELETE() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}
