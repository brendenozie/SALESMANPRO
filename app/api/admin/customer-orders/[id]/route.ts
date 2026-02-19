import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/customer-orders/[id]/route.ts
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { z } from 'zod';
import { OrderStatus, Prisma } from '@prisma/client';

// Shared selector to maintain dry code and consistent payloads
const ORDER_SELECT = {
  id: true,
  status: true,
  deliveryStatus: true,
  deliveryPersonName: true,
  deliveryPersonContact: true,
  totalAmount: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      quantity: true,
      price: true,
      marketplaceListing: {
        select: { id: true, name: true },
      },
    },
  },
};

// Strict validation schema
const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  deliveryStatus: z.string().optional(),
  deliveryPersonName: z.string().optional(),
  deliveryPersonContact: z.string().optional(),
});


export const GET = withApiHandler(async (_req, { params }) => {
  
    const cacheKey = `admin:customer-orders:${params.id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const order = await prisma.customerOrder.findUnique({
    where: { id: params.id },
    select: ORDER_SELECT,
  });

  try {
    if (order) {
      await cacheSet(cacheKey, order, 60);
    }
  } catch (e) {}

  if (!order) return formatResponse(false, null, 'Order not found', 404);
  return formatResponse(true, order, 'Order fetched successfully');
});


export const PUT = withApiHandler(async (req, { params }) => {
  const body = await req.json();
  const parsed = updateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.format(), 400);
  }

  try {
    const updatedOrder = await prisma.customerOrder.update({
      where: { id: params.id },
      data: parsed.data,
      select: ORDER_SELECT,
    });

    
    try { await cacheDel(`admin:customer-orders:${params.id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedOrder, 'Order updated successfully');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, 'Order not found', 404);
    }
    throw error;
  }
});


export const DELETE = withApiHandler(async (_req, { params }) => {
  try {
    const deleted = await prisma.customerOrder.delete({
      where: { id: params.id },
      select: { id: true },
    });
    
    try { await cacheDel(`admin:customer-orders:${params.id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { deletedId: deleted.id }, 'Order deleted successfully');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, 'Order not found', 404);
    }
    throw error;
  }
});


// // --- GET /api/customer-orders/:id
// // Fetches a single customer order by ID
// export const GET = withApiHandler(async (_request, context) => {
//   const { id } = context.params;

//   const order = await prisma.customerOrder.findUnique({
//     where: { id },
//     include: {
//       // customer: { select: { id: true, name: true, email: true } },

//       items: { select: { id: true, marketplaceListing: {
//         select: { id: true, name: true },
//       }, quantity: true, price: true } },
//     },
//   });

//   if (!order) {
//     return formatResponse(false, null, 'Customer order not found', 404);
//   }

//   return formatResponse(true, order, 'Customer order fetched successfully', 200);
// });

// // --- PUT /api/customer-orders/:id
// // Updates a specific customer order (e.g., status, delivery details)
// export const PUT = withApiHandler(async (request, context) => {
//   const { id } = context.params;

//   // Parse + validate body
//   const body = await request.json();
//   const parsed = updateOrderSchema.safeParse(body);
//   if (!parsed.success) {
//     return formatResponse(false, null, parsed.error.errors, 400);
//   }

//   const { status, deliveryStatus, deliveryPersonName, deliveryPersonContact } = parsed.data;

//   const updatedOrder = await prisma.customerOrder.update({
//     where: { id },
//     data: {
//       status: status as OrderStatus | undefined,
//       deliveryStatus,
//       deliveryPersonName,
//       deliveryPersonContact,
//       updatedAt: new Date(),
//     },
//     include: {
//       // customer: { select: { id: true, name: true, email: true } },  // Include customer details
//       items: { select: { id: true, marketplaceListing: {
//         select: { id: true, name: true },
//       }, quantity: true, price: true } },
//     },
//   });

//   return formatResponse(true, updatedOrder, 'Customer order updated successfully');
// });

// // --- DELETE /api/customer-orders/:id
// // Deletes a customer order by ID
// export const DELETE = withApiHandler(async (_request, context) => {
//   const { id } = context.params;

//   const existingOrder = await prisma.customerOrder.findUnique({ where: { id } });
//   if (!existingOrder) {
//     return formatResponse(false, null, 'Customer order not found', 404);
//   }

//   const deletedOrder = await prisma.customerOrder.delete({ where: { id } });

//   return formatResponse(true, { deletedId: deletedOrder.id }, 'Customer order deleted successfully');
// });
