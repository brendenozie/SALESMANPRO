import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/admin/clients/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/clients
async function listClients(request: Request, context: { user?: any }) {
  const companyId = context.user?.companyId; // Securely get from auth context
  if (!companyId) return formatResponse(false, null, "Unauthorized", 401);

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
    });

    const userIds = clients.map(c => c.userId);

    // 2. OPTIMIZATION: Aggregate all order data in ONE query (No N+1)
    const orderStats = await prisma.customerOrder.groupBy({
      by: ['consumerId'],
      where: { 
        companyId,
        consumerId: { in: userIds } 
      },
      _sum: { totalPrice: true },
      _avg: { totalPrice: true },
      _max: { createdAt: true },
      _count: { id: true }
    });

    // Create a map for O(1) lookup
    const statsMap = new Map(orderStats.map(s => [s.consumerId, s]));

    // 3. Map results
    const enriched = clients.map(c => {
      const stats = statsMap.get(c.userId);
      return {
        id: c.id,
        name: c.user.name,
        email: c.user.email,
        phoneNumber: c.user.phone,
        totalPurchases: stats?._sum.totalPrice || 0,
        averageOrderValue: stats?._avg.totalPrice || 0,
        lastPurchaseDate: stats?._max.createdAt || null,
        orderCount: stats?._count.id || 0
      };
    });

    // Cache the result for 1 minute
    try {
      await cacheSet(cacheKey, enriched, 60);
    } catch (e) {}

    return formatResponse(true, enriched, "Clients fetched successfully");
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}

// POST /api/admin/clients
async function createClient(request: Request, context: { user?: any }) {
  const companyId = context.user?.companyId;
  const body = await request.json();
  const { name, email, phoneNumber } = body;

  if (!email || !companyId) {
    return formatResponse(false, null, "Email and Company context required", 400);
  }

  try {
    // OPTIMIZATION: Use a Transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, phone: phoneNumber },
      });

      const client = await tx.client.create({
        data: { companyId, userId: user.id },
      });

      return { user, client };
    });

    // Invalidate cache for this company's clients list
    const cacheKey = `admin:clients:${companyId}`;
    try {
      await cacheDel(cacheKey);
    } catch (e) {}

    return formatResponse(true, {
      id: result.client.id,
      name: result.user.name,
      email: result.user.email,
      phoneNumber: result.user.phone,
      totalPurchases: 0,
      averageOrderValue: 0,
      lastPurchaseDate: null,
    }, "Client created", 201);
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}

export const GET = withApiHandler(listClients, { requireAuth: true });
export const POST = withApiHandler(createClient, { requireAuth: true });
// import { NextResponse } from "next/server";


//     const enriched = await Promise.all(
//       clients.map(async (c) => {
//         const orders = await prisma.customerOrder.findMany({
//           where: { companyId, consumerId: c.userId },
//           select: { totalPrice: true, createdAt: true },
//         });

//         const totalPurchases = orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
//         const averageOrderValue = orders.length
//           ? totalPurchases / orders.length
//           : 0;
//         const lastPurchaseDate = orders.length
//           ? new Date(
//               Math.max(...orders.map((o) => o.createdAt!.getTime()))
//             ).toISOString()
//           : null;

//         return {
//           id: c.id,
//           name: c.user.name,
//           email: c.user.email,
//           phoneNumber: c.user.phone,
//           totalPurchases,
//           averageOrderValue,
//           lastPurchaseDate,
//         };
//       })
//     );

//     return formatResponse(true, enriched, "Clients fetched successfully");
//   } catch (err) {
//     console.error("GET /api/admin/clients error:", err);
//     return formatResponse(false, null, err, 500);
//   }
// }

// async function createClient(request: Request) {
//   const body = await request.json();
//   const { name, email, phoneNumber, companyId } = body;

//   if (!companyId || !email) {
//     return NextResponse.json(
//       { error: "companyId and email are required" },
//       { status: 400 }
//     );
//   }

//   try {
//     const user = await prisma.user.create({
//       data: { name, email, phone: phoneNumber },
//     });

//     const client = await prisma.client.create({
//       data: { companyId, userId: user.id },
//     });

//     return formatResponse(true, 
//       {
//         id: client.id,
//         name: user.name,
//         email: user.email,
//         phoneNumber: user.phone,
//         totalPurchases: 0,
//         averageOrderValue: 0,
//         lastPurchaseDate: null,
//       },
//       { status: 201 }
//     );
//   } catch (err) {
//     console.error("POST /api/admin/clients error:", err);
//     return formatResponse(false, null, err, 500);
//   }
// }

// export const GET = withApiHandler(listClients, { requireAuth: true });
// export const POST = withApiHandler(createClient, { requireAuth: true });
