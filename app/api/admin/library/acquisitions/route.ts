import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getOrders = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const cacheKey = buildTenantCacheKey(companyId, "libraryAcquisitions", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const orders = await prisma.libraryAcquisition.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  });

  try {
    if (orders) {
      await cacheSet(cacheKey, orders, 60);
    }
  } catch (e) {}

  return formatResponse(true, orders, "Orders synced", 200);
};

const updateStatus = async (request: Request) => {
  const { orderId, status, companyId } = await request.json();

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.libraryAcquisition.update({
      where: { id: orderId },
      data: { status }
    });

    // Logic: If received, automatically add books to inventory
    if (status === 'Received') {
      const bookData = Array.from({ length: order.qty }).map(() => ({
        title: order.title,
        companyId: companyId,
        status: "AVAILABLE",
        category: order.category || "General",
        isbn: "PENDING-ASSET", // Placeholder for librarian to update later
      }));

      await tx.libraryBook.createMany({ data: bookData });
    }
    return order;
  });

  // Invalidate relevant caches
  try {
    await cacheDel(`tenant:${companyId}:libraryAcquisitions:*`);
    await cacheDel(`admin:libraryAcquisitions:*`);
  } catch (e) {}

  return formatResponse(true, result, "Inventory updated", 200);
};

export const GET = withApiHandler(getOrders, { requireAuth: true });
export const PATCH = withApiHandler(updateStatus, { requireAuth: true });