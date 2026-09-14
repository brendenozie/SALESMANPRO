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
          delivery: true,
          totalPrice: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
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
