// app/api/customer-orders/[id]/route.ts
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

// --- Validation schema
const updateOrderSchema = z.object({
  status: z.string().optional(),
  deliveryStatus: z.string().optional(),
  deliveryPersonName: z.string().optional(),
  deliveryPersonContact: z.string().optional(),
});

// --- GET /api/customer-orders/:id
// Fetches a single customer order by ID
export const GET = withApiHandler(async (_request, context) => {
  const { id } = context.params;

  const order = await prisma.customerOrder.findUnique({
    where: { id },
    include: {
      // customer: { select: { id: true, name: true, email: true } },

      items: { select: { id: true, marketplaceListing: {
        select: { id: true, name: true },
      }, quantity: true, price: true } },
    },
  });

  if (!order) {
    return formatResponse(false, null, 'Customer order not found', 404);
  }

  return formatResponse(true, order, 'Customer order fetched successfully', 200);
});

// --- PUT /api/customer-orders/:id
// Updates a specific customer order (e.g., status, delivery details)
export const PUT = withApiHandler(async (request, context) => {
  const { id } = context.params;

  // Parse + validate body
  const body = await request.json();
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors, 400);
  }

  const { status, deliveryStatus, deliveryPersonName, deliveryPersonContact } = parsed.data;

  const updatedOrder = await prisma.customerOrder.update({
    where: { id },
    data: {
      status: status as OrderStatus | undefined,
      deliveryStatus,
      deliveryPersonName,
      deliveryPersonContact,
      updatedAt: new Date(),
    },
    include: {
      // customer: { select: { id: true, name: true, email: true } },  // Include customer details
      items: { select: { id: true, marketplaceListing: {
        select: { id: true, name: true },
      }, quantity: true, price: true } },
    },
  });

  return formatResponse(true, updatedOrder, 'Customer order updated successfully');
});

// --- DELETE /api/customer-orders/:id
// Deletes a customer order by ID
export const DELETE = withApiHandler(async (_request, context) => {
  const { id } = context.params;

  const existingOrder = await prisma.customerOrder.findUnique({ where: { id } });
  if (!existingOrder) {
    return formatResponse(false, null, 'Customer order not found', 404);
  }

  const deletedOrder = await prisma.customerOrder.delete({ where: { id } });

  return formatResponse(true, { deletedId: deletedOrder.id }, 'Customer order deleted successfully');
});
