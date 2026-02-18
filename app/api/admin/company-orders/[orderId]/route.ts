import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --------------------
// Types
// --------------------

type RouteParams = {
  adminSlug: string;
  orderId: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: {
    id: string;
    role?: string;
  };
};

const VALID_ORDER_STATUSES = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "REFUNDED",
] as const;

type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];

// --------------------
// Helpers
// --------------------

async function getCompanyIdBySlug(slug: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });
  return company?.id ?? null;
}

// --------------------
// GET Handler
// --------------------

async function handleGet(
  request: Request,
  { params }: HandlerContext
): Promise<NextResponse> {
  const { adminSlug, orderId } = params;

  const companyId = await getCompanyIdBySlug(adminSlug);
  if (!companyId) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const order = await prisma.customerOrder.findUnique({
    where: {
      id: orderId,
      companyId,
    },
    include: {
      items: {
        include: {
          marketplaceListing: {
            select: {
              id: true,
              name: true,
              sellingPrice: true,
            },
          },
        },
      },
      Payment: {
        select: {
          transactionId: true,
          status: true,
        },
        take: 1,
      },
    },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const response = {
    id: order.id,
    consumerId: order.consumerId,
    customerName: order.name ?? "N/A",
    customerEmail: order.email ?? "N/A",
    phone: order.phone ?? "N/A",
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    status: order.status,
    orderSource: order.orderSource,
    paymentMethod: order.paymentOption ?? "N/A",
    paymentTransactionId: order.Payment[0]?.transactionId ?? null,
    items: order.items.map(item => ({
      orderItemId: item.id,
      ticketProductId: item.marketplaceListingId,
      ticketType: item.marketplaceListing?.name ?? "N/A",
      eventName: "Associated Event Name (future lookup)",
      quantity: item.quantity,
      price: item.price,
    })),
  };

  return NextResponse.json(response, { status: 200 });
}

// --------------------
// PUT Handler
// --------------------

async function handlePut(
  request: Request,
  { params }: HandlerContext
): Promise<NextResponse> {
  const { adminSlug, orderId } = params;
  const { status, notes } = await request.json();

  if (!status || !VALID_ORDER_STATUSES.includes(status)) {
    return NextResponse.json(
      { message: "Invalid or missing order status" },
      { status: 400 }
    );
  }

  const companyId = await getCompanyIdBySlug(adminSlug);
  if (!companyId) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const updatedOrder = await prisma.$transaction(async tx => {
    const order = await tx.customerOrder.update({
      where: {
        id: orderId,
        companyId,
      },
      data: {
        status,
      },
    });

    // Handle refunds / cancellations atomically
    if (status === "REFUNDED" || status === "CANCELLED") {
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
        select: {
          marketplaceListingId: true,
          quantity: true,
        },
      });

      for (const item of orderItems) {
        if (!item.marketplaceListingId) continue;

        await tx.marketplaceListings.update({
          where: { id: item.marketplaceListingId },
          data: {
            quantity: { increment: item.quantity },
          },
        });
      }

      await tx.payment.updateMany({
        where: { orderId },
        data: { status: "REFUNDED" },
      });
    }

    return order;
  });

  return NextResponse.json(
    {
      message: "Order status updated successfully",
      order: updatedOrder,
    },
    { status: 200 }
  );
}

// --------------------
// Exports
// --------------------

export const GET = withApiHandler(handleGet);
export const PUT = withApiHandler(handlePut);

// import { NextResponse } from "next/server";
 {
//   const { adminSlug, orderId } = context.params;

//   const order = await prisma.customerOrder.findFirst({
//     where: { 
//       id: orderId, 
//       Company: { slug: adminSlug } 
//     },
//     select: {
//       id: true,
//       consumerId: true,
//       name: true,
//       email: true,
//       phone: true,
//       totalPrice: true,
//       createdAt: true,
//       status: true,
//       orderSource: true,
//       paymentOption: true,
//       items: {
//         select: {
//           id: true,
//           marketplaceListingId: true,
//           quantity: true,
//           price: true,
//           marketplaceListing: {
//             select: { 
//               name: true,
//               // Optimized: Fetch event title directly through the listing relation
//               event: { select: { title: true } } 
//             }
//           }
//         }
//       },
//       Payment: { 
//         select: { transactionId: true, status: true }, 
//         take: 1 
//       }
//     }
//   });

//   if (!order) return formatResponse(false, null, "Order not found", 404);

//   const formattedOrder = {
//     ...order,
//     customerName: order.name || 'N/A',
//     paymentTransactionId: order.Payment[0]?.transactionId || null,
//     items: order.items.map(item => ({
//       orderItemId: item.id,
//       ticketProductId: item.marketplaceListingId,
//       ticketType: item.marketplaceListing?.name || 'N/A',
//       eventName: item.marketplaceListing?.event?.title || 'General Sale',
//       quantity: item.quantity,
//       price: item.price,
//     })),
//   };

//   return NextResponse.json(formattedOrder);
// }

// 
// async function handlePut(request: Request, context: { params: { adminSlug: string, orderId: string } }) {
//   const { adminSlug, orderId } = context.params;
//   const { status } = await request.json();

//   if (!status) return formatResponse(false, null, "Status is required", 400);

//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       // 1. Update the order with security scope check
//       const order = await tx.customerOrder.update({
//         where: { 
//           id: orderId,
//           Company: { slug: adminSlug }
//         },
//         data: { status },
//         include: { items: true }
//       });

//       // 2. Business Logic: Restock inventory if cancelled/refunded
//       if (status === "REFUNDED" || status === "CANCELLED") {
//         for (const item of order.items) {
//           if (item.marketplaceListingId) {
//             await tx.marketplaceListings.update({
//               where: { id: item.marketplaceListingId },
//               data: { quantity: { increment: item.quantity } }
//             });
//           }
//         }

//         await tx.payment.updateMany({
//           where: { orderId: orderId },
//           data: { status: "REFUNDED" }
//         });
//       }

//       return order;
//     });

//     return formatResponse(true, result, "Order status updated successfully");
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Order not found or unauthorized", 404);
//     }
//     throw error;
//   }
// }

// export const GET = withApiHandler(handleGet);
// export const PUT = withApiHandler(handlePut);
// import { NextResponse } from "next/server";


//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const order = await prisma.customerOrder.findUnique({
//     where: { id: orderId, companyId: company.id },
//     include: {
//       items: {
//         include: {
//           marketplaceListing: {
//             select: { name: true, sellingPrice: true }
//           }
//         }
//       },
//       Payment: { select: { transactionId: true, status: true }, take: 1 }
//     },
//   });

//   if (!order) {
//     return NextResponse.json({ message: "Order not found" }, { status: 404 });
//   }

//   const formattedOrder = {
//     id: order.id,
//     consumerId: order.consumerId,
//     customerName: order.name || 'N/A',
//     customerEmail: order.email || 'N/A',
//     phone: order.phone || 'N/A',
//     totalPrice: order.totalPrice,
//     createdAt: order.createdAt,
//     status: order.status,
//     orderSource: order.orderSource,
//     paymentMethod: order.paymentOption || 'N/A',
//     paymentTransactionId: order.Payment[0]?.transactionId || null,
//     items: order.items.map(item => ({
//       orderItemId: item.id,
//       ticketProductId: item.marketplaceListingId,
//       ticketType: item.marketplaceListing?.name || 'N/A',
//       eventName: "Associated Event Name (Needs lookup)",
//       quantity: item.quantity,
//       price: item.price,
//     })),
//   };

//   return NextResponse.json(formattedOrder, { status: 200 });
// }

// // --- Core Logic for PUT request ---

// async function handlePut(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { adminSlug, orderId } = context.params;
//   const body = await request.json();
//   const { status, notes } = body;

//   if (!status) {
//     return NextResponse.json({ message: "Status is required" }, { status: 400 });
//   }

//   const validStatuses = ["PENDING", "COMPLETED", "CANCELLED", "SHIPPED", "OUT_FOR_DELIVERY", "REFUNDED"];
//   if (!validStatuses.includes(status)) {
//     return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
//   }

//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const updatedOrder = await prisma.customerOrder.update({
//     where: { id: orderId, companyId: company.id },
//     data: {
//       status: status,
//     },
//   });

//   if (status === "REFUNDED" || status === "CANCELLED") {
//     const orderItems = await prisma.orderItem.findMany({
//       where: { orderId: orderId },
//       select: { marketplaceListingId: true, quantity: true }
//     });

//     await prisma.$transaction(
//       orderItems.map(item =>
//         prisma.marketplaceListings.update({
//           where: { id: item.marketplaceListingId || '' },
//           data: { quantity: { increment: item.quantity } },
//         })
//       )
//     );

//     await prisma.payment.updateMany({
//       where: { orderId: orderId },
//       data: { status: "REFUNDED" }
//     });
//   }

//   return NextResponse.json(
//     { message: "Order status updated", order: updatedOrder },
//     { status: 200 }
//   );
// }

// // --- Exported Route Handlers (Wrapped) ---

// 
// export const GET = withApiHandler(handleGet);

// 
// export const PUT = withApiHandler(handlePut);
