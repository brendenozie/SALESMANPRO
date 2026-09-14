import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { z } from "zod";
import { OrderStatus, Prisma } from "@prisma/client";

// Shared selector to maintain dry code and consistent payloads
const ORDER_SELECT = {
  id: true,
  companyId: true,
  consumerId: true,
  status: true,
  deliveryStatus: true,
  deliveryPersonName: true,
  deliveryPersonContact: true,
  totalPrice: true,
  totalFinalPrice: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      quantity: true,
      price: true,
      totalPrice: true,
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

export const GET = withApiHandler(
  async (_req, context) => {
    const companyId = context.companyId;
    const orderId = context.params?.id;

    if (!orderId) {
      return formatResponse(false, null, "Order ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const cacheKey = buildTenantCacheKey(companyId, "customer-order", {
      id: orderId,
    });

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    // Strict tenant-scoped lookup preventing cross-tenant IDOR
    const order = await prisma.customerOrder.findFirst({
      where: {
        id: orderId,
        companyId,
      },
      select: ORDER_SELECT,
    });

    if (!order) {
      return formatResponse(false, null, "Order not found", 404);
    }

    try {
      await cacheSet(cacheKey, order, 60);
    } catch (e) {}

    return formatResponse(true, order, "Order fetched successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);

export const PUT = withApiHandler(
  async (req, context) => {
    const companyId = context.companyId;
    const orderId = context.params?.id;

    if (!orderId) {
      return formatResponse(false, null, "Order ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return formatResponse(false, null, parsed.error.format(), 400);
    }

    // Verify record exists and belongs to the authorized tenant before mutation
    const existing = await prisma.customerOrder.findFirst({
      where: { id: orderId, companyId },
      select: { id: true, status: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Order not found", 404);
    }

    try {
      const updatedOrder = await prisma.customerOrder.update({
        where: { id: orderId },
        data: parsed.data,
        select: ORDER_SELECT,
      });

      try {
        await cacheDel(`tenant:${companyId}:customer-orders:*`);
        await cacheDel(
          buildTenantCacheKey(companyId, "customer-order", { id: orderId }),
        );
      } catch (e) {}

      return formatResponse(
        true,
        updatedOrder,
        "Order updated successfully",
        200,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return formatResponse(false, null, "Order not found", 404);
      }
      throw error;
    }
  },
  { requireAuth: true, requireTenant: true },
);

export const DELETE = withApiHandler(
  async (_req, context) => {
    const companyId = context.companyId;
    const orderId = context.params?.id;

    if (!orderId) {
      return formatResponse(false, null, "Order ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    // Verify record exists and belongs to the authorized tenant before deletion
    const existing = await prisma.customerOrder.findFirst({
      where: { id: orderId, companyId },
      select: { id: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Order not found", 404);
    }

    try {
      const deleted = await prisma.customerOrder.delete({
        where: { id: orderId },
        select: { id: true },
      });

      try {
        await cacheDel(`tenant:${companyId}:customer-orders:*`);
        await cacheDel(
          buildTenantCacheKey(companyId, "customer-order", { id: orderId }),
        );
      } catch (e) {}

      return formatResponse(
        true,
        { deletedId: deleted.id },
        "Order deleted successfully",
        200,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return formatResponse(false, null, "Order not found", 404);
      }
      throw error;
    }
  },
  { requireAuth: true, requireTenant: true },
);
