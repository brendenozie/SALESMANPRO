// app/api/admin/orders/[id]/route.ts
import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { OrderStatus, Prisma } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

type RouteParams = { params: Promise<{ id: string }> };

async function handlePutOrderItem(req: Request, { params }: RouteParams) {
  const { id: orderItemId } = await params;
  const { searchParams } = new URL(req.url);

  const riderId = searchParams.get("riderId");
  const companyId = searchParams.get("companyId");
  const status = searchParams.get("status") as OrderStatus;

  if (!orderItemId || !status) {
    return formatResponse(false, null, "Missing status or item ID.", 400);
  }

  try {
    // Update the OrderItem (and optionally the parent Order status)
    const updatedItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        // If your schema has riderId on the OrderItem:
        ...(riderId && { riderId: riderId }),
        // Sync the parent order status
        order: {
          update: { status: status },
        },
      },
    });

    // Invalidate the specific company's order cache
    if (companyId) {
      await cacheDel(`admin:orders:comp_${companyId}:*`);
    }

    return formatResponse(true, updatedItem, "Update successful", 200);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return formatResponse(false, null, "Record not found.", 404);
    }
    throw error;
  }
}

export const PUT = withApiHandler(handlePutOrderItem);
// import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// import prisma from "@/server/db/prismadb";
// import { OrderStatus } from "@prisma/client";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { Prisma } from "@prisma/client"; // Import for handling specific Prisma errors

// // Define the expected structure for route parameters
// type RouteParams = { params: { id: string } };

// // --- PUT Handler Core Logic ---

// async function handlePutOrderItem(req: Request, { params }: RouteParams) {
//   const orderItemId = params.id;
//   const { searchParams } = new URL(req.url);

//   const riderId = searchParams.get("riderId");
//   const companyId = searchParams.get("companyId");
//   const status = searchParams.get("status");

//   // Input Validation
//   if (!orderItemId || !status) {
//     return formatResponse(false, null, "Missing required URL parameter: order item ID or status.", 400);
//   }

//   // Check if status is a valid OrderStatus enum value
//   const validStatuses: string[] = Object.values(OrderStatus);
//   if (status && !validStatuses.includes(status)) {
//       return formatResponse(
//           false,
//           null,
//           `Invalid status value. Must be one of: ${validStatuses.join(', ')}`,
//           400
//       );
//   }

//   // Dynamically build the data object for the update
//   const data: Prisma.OrderItemUpdateInput = {
//     order: { update: { status: status as OrderStatus } },
//   };

//   if (riderId) {
//     // Only include riderId if it's explicitly provided and non-empty
//     (data as any).riderId = riderId;
//   }

//   try {
//     await prisma.orderItem.update({
//         where: { id: orderItemId },
//         data: data,
//       },
//   );

//     // withApiHandler wraps this result in a success formatResponse with status 200

//     try {
//       await cacheDel(`admin:orders:${companyId || "global"}:*`);
//       await cacheDel(`admin:orders:${orderItemId || 'global'}:*`);
//     } catch (e) {}

//     return formatResponse(true, null, "Order item and associated order status updated successfully.", 200);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//         // Record not found error
//         return formatResponse(false, null, 'Order item not found or invalid foreign key (e.g., riderId).', 404);
//     }
//     // Throw other errors for withApiHandler to catch as 500
//     throw error;
//   }
// }

// // Wrap the core logic with the API handler middleware, which handles auth, try/catch, and response formatting.
// export const PUT = withApiHandler(handlePutOrderItem);
