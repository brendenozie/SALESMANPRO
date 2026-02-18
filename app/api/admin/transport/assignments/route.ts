import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getAssignments = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("routeId");
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const assignments = await prisma.transportAssignment.findMany({
    where: {
      ...(routeId && { routeId }),
      route: { companyId }
    },
    include: {
      user: {
        select: { 
          id: true, 
          name: true, 
          email: true, 
          image: true,
          role: true 
        }
      },
      route: {
        select: { name: true, startPoint: true, endPoint: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return formatResponse(true, assignments, "Assignments retrieved", 200);
};

const postAssignment = async (request: Request) => {
  const body = await request.json();
  const { routeId, userId, startDate, endDate } = body;

  if (!routeId || !userId) {
    return formatResponse(false, null, "Route and User IDs are required", 400);
  }

  // Prevent duplicate active assignments for the same user
  const existing = await prisma.transportAssignment.findFirst({
    where: { userId, routeId, endDate: null }
  });

  if (existing) {
    return formatResponse(false, null, "User is already active on this route", 409);
  }

  const assignment = await prisma.transportAssignment.create({
    data: {
      routeId,
      userId,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
    },
    include: {
      user: { select: { name: true } },
      route: { select: { name: true } }
    }
  });

  return formatResponse(true, assignment, "User assigned to route", 201);
};

export const GET = withApiHandler(getAssignments, { requireAuth: true });
export const POST = withApiHandler(postAssignment, { requireAuth: true });