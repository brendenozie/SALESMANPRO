import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client"; // Import for handling specific Prisma errors

// Define the expected structure for route parameters
type RouteParams = { params: { id: string } };

// --- PUT Handler Core Logic ---
/**
 * Updates a specific order item's rider and/or the parent order's status.
 */
async function handlePutOrderItem(req: NextRequest, { params }: RouteParams) {
  const orderItemId = params.id;
  const { searchParams } = new URL(req.url);

  const riderId = searchParams.get("riderId");
  const status = searchParams.get("status");

  // Input Validation
  if (!orderItemId || !status) {
    return formatResponse(false, null, "Missing required URL parameter: order item ID or status.", 400);
  }

  // Check if status is a valid OrderStatus enum value
  const validStatuses: string[] = Object.values(OrderStatus);
  if (status && !validStatuses.includes(status)) {
      return formatResponse(
          false,
          null,
          `Invalid status value. Must be one of: ${validStatuses.join(', ')}`,
          400
      );
  }

  // Dynamically build the data object for the update
  const data: Prisma.OrderItemUpdateInput = {
    order: { update: { status: status as OrderStatus } },
  };

  if (riderId) {
    // Only include riderId if it's explicitly provided and non-empty
    (data as any).riderId = riderId;
  }

  try {
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: data,
    });

    // withApiHandler wraps this result in a success formatResponse with status 200
    return { success: true, message: "Order item and associated order status updated successfully." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Record not found error
        return formatResponse(false, null, 'Order item not found or invalid foreign key (e.g., riderId).', 404);
    }
    // Throw other errors for withApiHandler to catch as 500
    throw error;
  }
}

// Wrap the core logic with the API handler middleware, which handles auth, try/catch, and response formatting.
export const PUT = withApiHandler(handlePutOrderItem);
