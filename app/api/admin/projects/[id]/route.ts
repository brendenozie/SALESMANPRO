import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/projects/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Define the Project type based on your Prisma schema
export type ProjectStatus = "PLANNING" | "ONGOING" | "COMPLETED" | "ARCHIVED" | "CANCELLED";

interface ProjectUpdateData {
  name?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: ProjectStatus;
  budget?: number | null;
  companyId?: string | null;
}


export const GET = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  


  const { id } = params;
  if (!id) return formatResponse(false, null, "Project ID is required.", 400);

  
    const cacheKey = `admin:projects:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const project = await prisma.project.findUnique({
    where: { id },
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

  if (!project) return formatResponse(false, null, "Project not found", 404);  

  try {
    if (project) {
      await cacheSet(cacheKey, project, 60);
    }
  } catch (e) {}

  return formatResponse(true, project, "Project fetched successfully", 200);
});


export const PUT = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  
  const { id } = params;
  if (!id) return formatResponse(false, null, "Project ID is required for update.", 400);

  const { name, description, startDate, endDate, status, budget, companyId }: ProjectUpdateData = await request.json();

  const dataToUpdate: Record<string, any> = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (description !== undefined) dataToUpdate.description = description;
  if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null;
  if (status !== undefined) dataToUpdate.status = status;
  if (budget !== undefined) dataToUpdate.budget = budget;
  if (companyId !== undefined) dataToUpdate.companyId = companyId;

  try {
    const updatedProject = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
    });

    
    try { await cacheDel(`admin:projects:${id || 'global'}:*`); } catch (e) {}
    
    return formatResponse(true, updatedProject, "Project updated successfully", 200);
  } catch (error: any) {
    if (error.code === "P2025") {
      return formatResponse(false, null, "Project not found", 404);
    }
    if (error.code === "P2002") {
      return formatResponse(false, null, "A project with similar details already exists.", 409);
    }
    throw error; // handled by withApiHandler
  }
});


export const DELETE = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  
  const { id } = params;
  if (!id) return formatResponse(false, null, "Project ID is required for deletion.", 400);

  try {
    await prisma.project.delete({
      where: { id },
    });

    
    try { await cacheDel(`admin:projects:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Project deleted successfully", 200);
  } catch (error: any) {
    if (error.code === "P2025") {
      return formatResponse(false, null, "Project not found", 404);
    }
    throw error;
  }
});


export async function POST() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}
