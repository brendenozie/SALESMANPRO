import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { z } from "zod";

const createOrderSchema = z.object({
  companyId: z.string().optional(),
  customerId: z.string().min(1, "Customer ID is required"),
  delivery: z.boolean().default(false),
  items: z
    .array(
      z.object({
        marketplaceListingId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "At least one item is required"),
});

export const GET = withApiHandler(
  async (request, context) => {
    const { searchParams } = new URL(request.url);

    // Authoritative tenant scoping from verified session context
    const companyId = context.companyId;
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const deliveryFilter = searchParams.get("delivery");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10),
    );
    const skip = (page - 1) * limit;

    // Strict tenant-scoped WHERE filter preventing cross-company leaks
    const where: any = {
      companyId,
      ...(deliveryFilter === "true" && { delivery: true }),
      ...(deliveryFilter === "false" && { delivery: false }),
    };

    const cacheKey = buildTenantCacheKey(companyId, "customer-orders", {
      delivery: deliveryFilter ?? "all",
      page,
      limit,
    });

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const [totalCount, orders] = await Promise.all([
      prisma.customerOrder.count({ where }),
      prisma.customerOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          companyId: true,
          consumerId: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          paymentStatus: true,
          orderSource: true,
          delivery: true,
          shippingAddress: true,
          totalPrice: true,
          totalFinalPrice: true,
          totalDiscount: true,
          totalTax: true,
          totalShipping: true,
          deliveryStatus: true,
          estimatedArrival: true,
          deliveryPersonName: true,
          deliveryPersonContact: true,
          trackingNumber: true,
          createdAt: true,
          updatedAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              totalPrice: true,
              marketplaceListing: {
                select: {
                  name: true,
                  images: true,
                  finalPrice: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const formatted = orders.map((order) => ({
      ...order,
      createdAt: order.createdAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        marketplaceListing: {
          ...item.marketplaceListing,
          images: (item.marketplaceListing?.images ?? []) as { url: string }[],
        },
      })),
    }));

    const responseData = {
      data: formatted,
      orders: formatted,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    try {
      await cacheSet(cacheKey, responseData, 60);
    } catch (e) {}

    return formatResponse(
      true,
      responseData,
      "Orders fetched successfully",
      200,
    );
  },
  { requireAuth: true, requireTenant: true },
);

export const POST = withApiHandler(
  async (request, context) => {
    const body = await request.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return formatResponse(false, null, parsed.error.errors, 400);
    }

    // Authoritative tenant enforcement: prevent spoofing companyId
    if (parsed.data.companyId && parsed.data.companyId !== context.companyId) {
      return formatResponse(
        false,
        null,
        "Forbidden: Cannot create orders for another tenant company",
        403,
      );
    }

    const companyId = context.companyId;
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const { customerId, delivery, items } = parsed.data;

    // Fetch authoritative prices from DB scoped to companyId
    const listingIds = items.map((i) => i.marketplaceListingId);

    const listings = await prisma.marketplaceListings.findMany({
      where: { id: { in: listingIds }, companyId },
      select: { id: true, finalPrice: true, name: true, productId: true },
    });

    if (listings.length !== listingIds.length) {
      return formatResponse(
        false,
        null,
        "One or more listing(s) do not exist or belong to another company",
        400,
      );
    }

    const listingMap = new Map(listings.map((l) => [l.id, l.finalPrice]));

    let totalPrice = 0;
    for (const item of items) {
      const price = listingMap.get(item.marketplaceListingId) ?? 0;
      totalPrice += price * item.quantity;
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      // Reserve inventory atomically
      for (const item of items) {
        const listing = listings.find(
          (l) => l.id === item.marketplaceListingId,
        );

        if (!listing?.productId) {
          throw new Error(
            `Listing ${item.marketplaceListingId} is not linked to a product`,
          );
        }

        const updated = await tx.inventoryItem.updateMany({
          where: {
            companyId,
            productId: listing.productId,
            quantity: {
              gte: item.quantity,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count === 0) {
          throw new Error(`Insufficient stock for ${listing.name}`);
        }

        await tx.inventoryLog.create({
          data: {
            inventoryItem: {
              connect: {
                productId_companyId: {
                  productId: listing.productId,
                  companyId,
                },
              },
            },
            action: "SALE",
            quantity: item.quantity,
            details: `Customer order created by user ${context.user?.id}`,
          },
        });
      }

      // Create order with authoritative tenant companyId
      return tx.customerOrder.create({
        data: {
          companyId,
          consumerId: customerId,
          delivery,
          totalPrice,
          totalFinalPrice: totalPrice,
          status: "PENDING",

          items: {
            create: items.map((item) => {
              const listing = listings.find(
                (l) => l.id === item.marketplaceListingId,
              )!;

              return {
                marketplaceListingId: item.marketplaceListingId,
                productId: listing.productId,
                quantity: item.quantity,
                price: listing.finalPrice ?? 0,
                totalPrice: (listing.finalPrice ?? 0) * item.quantity,
              };
            }),
          },
        },
        select: {
          id: true,
          companyId: true,
          consumerId: true,
          delivery: true,
          totalPrice: true,
          totalFinalPrice: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              totalPrice: true,
              marketplaceListing: {
                select: {
                  name: true,
                  images: true,
                  finalPrice: true,
                },
              },
            },
          },
        },
      });
    });

    try {
      await cacheDel(`tenant:${companyId}:customer-orders:*`);
    } catch (e) {}

    return formatResponse(
      true,
      {
        ...newOrder,
        createdAt: newOrder.createdAt?.toISOString(),
      },
      "Customer order created successfully",
      201,
    );
  },
  { requireAuth: true, requireTenant: true },
);

const updateOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z
    .enum([
      "PENDING",
      "COMPLETED",
      "RECURRING",
      "FAILED",
      "PROCESSING",
      "REFUNDED",
      "DISPUTED",
      "CHARGEBACK",
      "PAID",
      "SHIPPED",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "CANCELLED",
    ])
    .optional(),
  deliveryStatus: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedArrival: z.string().optional(),
  deliveryPersonName: z.string().optional(),
  deliveryPersonContact: z.string().optional(),
  notes: z.string().optional(),
});

export const PATCH = withApiHandler(
  async (request, context) => {
    const body = await request.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return formatResponse(false, null, parsed.error.errors, 400);
    }

    const companyId = context.companyId;
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const { orderId, status, deliveryStatus, trackingNumber, estimatedArrival, deliveryPersonName, deliveryPersonContact, notes } = parsed.data;

    // Verify order exists and belongs to this tenant
    const existingOrder = await prisma.customerOrder.findFirst({
      where: { id: orderId, companyId },
      include: { items: true },
    });

    if (!existingOrder) {
      return formatResponse(false, null, "Order not found or unauthorized", 404);
    }

    // Execute state transition atomically
    const updated = await prisma.$transaction(async (tx) => {
      // If status changed to CANCELLED from non-cancelled, restore inventory
      if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
        for (const item of existingOrder.items) {
          if (item.productId) {
            await tx.inventoryItem.updateMany({
              where: { companyId, productId: item.productId },
              data: { quantity: { increment: item.quantity } },
            });

            await tx.inventoryLog.create({
              data: {
                inventoryItem: {
                  connect: {
                    productId_companyId: {
                      productId: item.productId,
                      companyId,
                    },
                  },
                },
                action: "RETURN",
                quantity: item.quantity,
                details: `Order #${existingOrder.id} cancelled by admin ${context.user?.id}`,
              },
            });
          }
        }
      }

      return tx.customerOrder.update({
        where: { id: orderId },
        data: {
          ...(status && { status }),
          ...(deliveryStatus !== undefined && { deliveryStatus }),
          ...(trackingNumber !== undefined && { trackingNumber }),
          ...(estimatedArrival && { estimatedArrival: new Date(estimatedArrival) }),
          ...(deliveryPersonName !== undefined && { deliveryPersonName }),
          ...(deliveryPersonContact !== undefined && { deliveryPersonContact }),
          ...(notes !== undefined && { notes }),
        },
        select: {
          id: true,
          companyId: true,
          consumerId: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          paymentStatus: true,
          orderSource: true,
          delivery: true,
          shippingAddress: true,
          totalPrice: true,
          totalFinalPrice: true,
          totalDiscount: true,
          totalTax: true,
          totalShipping: true,
          deliveryStatus: true,
          estimatedArrival: true,
          deliveryPersonName: true,
          deliveryPersonContact: true,
          trackingNumber: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              totalPrice: true,
              marketplaceListing: {
                select: {
                  name: true,
                  images: true,
                  finalPrice: true,
                },
              },
            },
          },
        },
      });
    });

    try {
      await cacheDel(`tenant:${companyId}:customer-orders:*`);
    } catch (e) {}

    return formatResponse(
      true,
      {
        ...updated,
        createdAt: updated.createdAt?.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
      },
      "Order updated successfully",
      200,
    );
  },
  { requireAuth: true, requireTenant: true },
);

