import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/targets
async function handleGET(request: Request) {
  
  try {
    const targets = await prisma.target.findMany({
      include: {
        salesAgent: true,
        product: true,
      },
    });

    return formatResponse(true, targets);
  } catch (error: any) {
    console.error("Error fetching targets:", error);
    return formatResponse(false, null, "Failed to fetch targets", 500);
  }
}

// Export the handler wrapped with withApiHandler
export const GET = withApiHandler(handleGET);

// POST /api/targets
async function handlePOST(request: Request) {
  try {
    const {
      salesAgentId,
      productId,
      targetAmount,
      startDate,
      endDate,
    } = await request.json();

    if (!salesAgentId || !productId || targetAmount === undefined || !startDate || !endDate) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    const newTarget = await prisma.target.create({
      data: {
        targetValue: targetAmount,
        periodStart: new Date(startDate),
        periodEnd: new Date(endDate),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        product: {
          connect: { id: productId },
        },
        salesAgent: {
          connect: { id: salesAgentId },
        },
      },
    });

    return formatResponse(true, newTarget, "Target created successfully", 201);
  } catch (error: any) {
    console.error("Error creating target:", error);
    return formatResponse(false, null, "Failed to create target", 500);
  }
}

// Export the handler wrapped with withApiHandler
export const POST = withApiHandler(handlePOST);

