import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { withDistributedLock } from "@/lib/idempotency";
import { ROLES } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

const posSaleItemSchema = z.object({
  ticketProductId: z.string().min(1, "ticketProductId is required"),
  quantity: z.number().int().positive("quantity must be at least 1"),
});

const posSaleSchema = z.object({
  eventId: z.string().min(1, "eventId is required"),
  customerName: z.string().min(1, "customerName is required"),
  customerEmail: z.string().email("customerEmail must be a valid email address"),
  paymentMethod: z.string().min(1, "paymentMethod is required"),
  items: z.array(posSaleItemSchema).min(1, "items array must contain at least 1 item"),
  notes: z.string().optional(),
  companyId: z.string().optional(),
});

async function handlePost(req: Request, context: any) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return formatResponse(false, null, "Invalid JSON payload", 400);
  }

  const parsed = posSaleSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors, 400);
  }

  const { eventId, customerName, customerEmail, paymentMethod, items, notes } =
    parsed.data;

  // Authoritative tenant scoping from context
  const companyId = context.companyId || parsed.data.companyId;
  if (!companyId) {
    return formatResponse(
      false,
      null,
      "Authorized company context is required",
      403,
    );
  }

  // Verify event belongs to authorized company
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      companyId,
    },
    select: { id: true, title: true, companyId: true },
  });

  if (!event) {
    return formatResponse(
      false,
      null,
      "Event not found or does not belong to authorized company",
      404,
    );
  }

  // Fetch ticket products and verify tenant ownership
  const productIds = items.map((i) => i.ticketProductId);
  const products = await prisma.marketplaceListings.findMany({
    where: {
      id: { in: productIds },
      companyId,
    },
    select: {
      id: true,
      name: true,
      sellingPrice: true,
      quantity: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalPrice = 0;
  const orderItems: {
    marketplaceListingId: string;
    quantity: number;
    price: number;
  }[] = [];

  for (const item of items) {
    const product = productMap.get(item.ticketProductId);
    if (!product) {
      return formatResponse(
        false,
        null,
        `Ticket product not found or belongs to another company: ${item.ticketProductId}`,
        404,
      );
    }

    if (product.quantity < item.quantity) {
      return formatResponse(
        false,
        null,
        `Insufficient stock for ${product.name}. Available: ${product.quantity}, requested: ${item.quantity}`,
        400,
      );
    }

    totalPrice += product.sellingPrice * item.quantity;
    orderItems.push({
      marketplaceListingId: product.id,
      quantity: item.quantity,
      price: product.sellingPrice,
    });
  }

  // Execute checkout with distributed concurrency lock on event pool
  const lockResource = `pos:event:${eventId}`;

  try {
    const order = await withDistributedLock(
      lockResource,
      async () => {
        return await prisma.$transaction(async (tx) => {
          // 1. Atomic conditional stock deduction to prevent overselling race conditions
          for (const item of orderItems) {
            const updated = await tx.marketplaceListings.updateMany({
              where: {
                id: item.marketplaceListingId,
                companyId,
                quantity: { gte: item.quantity },
              },
              data: {
                quantity: { decrement: item.quantity },
              },
            });

            if (updated.count === 0) {
              const p = productMap.get(item.marketplaceListingId);
              throw new Error(
                `Insufficient stock for ${p?.name || item.marketplaceListingId}`,
              );
            }
          }

          // 2. Upsert customer user
          const user = await tx.user.upsert({
            where: { email: customerEmail },
            update: { name: customerName },
            create: {
              email: customerEmail,
              name: customerName,
              role: ROLES.CONSUMER,
            },
            select: { id: true },
          });

          // 3. Upsert consumer scoped to company
          const consumer = await tx.consumer.upsert({
            where: { userId: user.id },
            update: {},
            create: {
              userId: user.id,
              companyId,
            },
            select: { id: true },
          });

          // 4. Create customer order record
          const createdOrder = await tx.customerOrder.create({
            data: {
              consumerId: consumer.id,
              companyId,
              name: customerName,
              email: customerEmail,
              totalPrice,
              totalFinalPrice: totalPrice,
              status: "COMPLETED",
              paymentOption: paymentMethod,
              orderSource: "IN_PERSON",
              notes,
              items: {
                create: orderItems.map((oi) => ({
                  marketplaceListingId: oi.marketplaceListingId,
                  quantity: oi.quantity,
                  price: oi.price,
                })),
              },
            },
            select: {
              id: true,
              totalPrice: true,
              status: true,
            },
          });

          // 5. Create payment record
          await tx.payment.create({
            data: {
              userId: consumer.id,
              orderId: createdOrder.id,
              amount: totalPrice,
              status: "COMPLETED",
              transactionId: `POS-${crypto.randomUUID()}`,
            },
          });

          // 6. Create event registrations in batch
          const registrations = orderItems.flatMap((item) =>
            Array.from({ length: item.quantity }).map(() => ({
              eventId: event.id,
              userId: consumer.id,
              status: "REGISTERED" as const,
              companyId,
            })),
          );

          if (registrations.length > 0) {
            await tx.eventRegistration.createMany({
              data: registrations,
            });
          }

          return createdOrder;
        });
      },
      15, // 15s lock TTL
      5000, // 5s spin-wait timeout
    );

    // Invalidate relevant tenant caches
    try {
      await cacheDel(`tenant:${companyId}:products:*`);
      await cacheDel(`tenant:${companyId}:pos:*`);
      await cacheDel(`tenant:${companyId}:events:*`);
    } catch {}

    return formatResponse(
      true,
      {
        orderId: order.id,
        totalAmount: order.totalPrice,
        status: order.status,
      },
      "Sale processed successfully",
      201,
    );
  } catch (err: any) {
    console.error("[POS_SALE_TRANSACTION_ERROR]", err);
    return formatResponse(
      false,
      null,
      err.message || "Failed to process POS sale transaction",
      400,
    );
  }
}

export const POST = withApiHandler(handlePost, {
  requireAuth: true,
  requireTenant: true,
  requireIdempotency: true,
});
