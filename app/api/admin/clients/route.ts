import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/clients
async function listClients(request: Request, context: { user?: any; companyId?: string }) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.companyId || context.user?.companyId;
  if (!companyId) return formatResponse(false, null, "Unauthorized: Company context required", 401);

  const cacheKey = `admin:clients:${companyId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    // 1. Fetch clients and user data in one shot
    const clients = await prisma.client.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const userIds = clients.map((c) => c.userId);

    // 2. Aggregate all order data in ONE query (No N+1)
    const orderStats = await prisma.customerOrder.groupBy({
      by: ["consumerId"],
      where: {
        companyId,
        consumerId: { in: userIds },
      },
      _sum: { totalPrice: true },
      _avg: { totalPrice: true },
      _max: { createdAt: true },
      _count: { id: true },
    });

    const statsMap = new Map(orderStats.map((s) => [s.consumerId, s]));

    // 3. Map results with full field parity for both UI consumers
    const enriched = clients.map((c) => {
      const stats = statsMap.get(c.userId);
      const total = stats?._sum.totalPrice || 0;
      const count = stats?._count.id || 0;
      const lastDate = stats?._max.createdAt ? stats._max.createdAt.toISOString() : null;

      return {
        id: c.id,
        userId: c.userId,
        name: c.user?.name || "Unnamed Client",
        email: c.user?.email || "No email",
        phone: c.user?.phone || "No phone",
        phoneNumber: c.user?.phone || "No phone",
        totalSales: total,
        totalPurchases: total,
        averageOrderValue: stats?._avg.totalPrice || 0,
        recentTransactionAmount: stats?._avg.totalPrice || 0,
        lastPurchaseDate: lastDate,
        recentTransactionDate: lastDate,
        orderCount: count,
        status: count > 0 ? ("active" as const) : ("new" as const),
      };
    });

    try {
      await cacheSet(cacheKey, enriched, 60);
    } catch (e) {}

    return formatResponse(true, enriched, "Clients fetched successfully");
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}

// POST /api/admin/clients
async function createClient(request: Request, context: { user?: any; companyId?: string }) {
  const body = await request.json().catch(() => null);
  if (!body) return formatResponse(false, null, "Invalid JSON body", 400);

  const { name, email, phoneNumber, phone, companyId: bodyCompanyId } = body;
  const companyId = bodyCompanyId || context.companyId || context.user?.companyId;
  const clientPhone = phone || phoneNumber || null;

  if (!email || !companyId) {
    return formatResponse(false, null, "Email and Company context required", 400);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            name: name || email.split("@")[0],
            email,
            phone: clientPhone,
          },
        });
      } else if (name || clientPhone) {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            ...(name && { name }),
            ...(clientPhone && { phone: clientPhone }),
          },
        });
      }

      let client = await tx.client.findFirst({
        where: { companyId, userId: user.id },
      });

      if (!client) {
        client = await tx.client.create({
          data: { companyId, userId: user.id },
        });
      }

      return { user, client };
    });

    await cacheDel(`admin:clients:${companyId}`);

    return formatResponse(
      true,
      {
        id: result.client.id,
        userId: result.user.id,
        name: result.user.name || "Unnamed Client",
        email: result.user.email,
        phone: result.user.phone || "",
        phoneNumber: result.user.phone || "",
        totalSales: 0,
        totalPurchases: 0,
        averageOrderValue: 0,
        recentTransactionAmount: 0,
        lastPurchaseDate: null,
        recentTransactionDate: null,
        orderCount: 0,
        status: "new",
      },
      "Client created successfully",
      201,
    );
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}

// PUT /api/admin/clients
async function updateClient(request: Request, context: { user?: any; companyId?: string }) {
  const body = await request.json().catch(() => null);
  if (!body) return formatResponse(false, null, "Invalid JSON body", 400);

  const { clientId, name, phone, phoneNumber, email, companyId: bodyCompanyId } = body;
  const companyId = bodyCompanyId || context.companyId || context.user?.companyId;
  const clientPhone = phone || phoneNumber;

  if (!clientId || !companyId) {
    return formatResponse(false, null, "Client ID and Company context required", 400);
  }

  try {
    const client = await prisma.client.findFirst({
      where: { id: clientId, companyId },
      include: { user: true },
    });

    if (!client) {
      return formatResponse(false, null, "Client record not found", 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: client.userId },
      data: {
        ...(name && { name }),
        ...(clientPhone !== undefined && { phone: clientPhone }),
        ...(email && { email }),
      },
    });

    await cacheDel(`admin:clients:${companyId}`);

    return formatResponse(
      true,
      {
        id: client.id,
        userId: updatedUser.id,
        name: updatedUser.name || "Unnamed Client",
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        phoneNumber: updatedUser.phone || "",
      },
      "Client updated successfully",
      200,
    );
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}

// DELETE /api/admin/clients
async function deleteClient(request: Request, context: { user?: any; companyId?: string }) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const companyId = searchParams.get("companyId") || context.companyId || context.user?.companyId;

  if (!clientId || !companyId) {
    return formatResponse(false, null, "Client ID and Company context required", 400);
  }

  try {
    const client = await prisma.client.findFirst({
      where: { id: clientId, companyId },
    });

    if (!client) {
      return formatResponse(false, null, "Client not found or unauthorized", 404);
    }

    await prisma.client.delete({
      where: { id: clientId },
    });

    await cacheDel(`admin:clients:${companyId}`);

    return formatResponse(true, { id: clientId }, "Client removed successfully", 200);
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}

export const GET = withApiHandler(listClients, { requireAuth: true });
export const POST = withApiHandler(createClient, { requireAuth: true });
export const PUT = withApiHandler(updateClient, { requireAuth: true });
export const DELETE = withApiHandler(deleteClient, { requireAuth: true });
