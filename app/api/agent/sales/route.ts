// ts
// // app/api/salesAgent/sales/route.ts
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { verifyAuth } from "@/lib/verifyAuth";

// export const GET = withApiHandler(async (req: Request) => {
//   const auth = await verifyAuth(req);
//   if (!auth.success) {
//     return formatResponse(false, null, auth.error, 401);
//   }

//   const { searchParams } = new URL(req.url);
//   const agentId = searchParams.get("agentId");
//   const startDate = searchParams.get("startDate");
//   const endDate = searchParams.get("endDate");
//   const limit = parseInt(searchParams.get("limit") || "10", 10);
//   const offset = parseInt(searchParams.get("offset") || "0", 10);

//   if (!agentId) {
//     return formatResponse(false, null, "agentId is required", 400);
//   }

//   if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
//     return formatResponse(false, null, "Invalid pagination parameters", 400);
//   }

//   try {
//     const start = startDate ? new Date(startDate) : undefined;
//     const end = endDate ? new Date(endDate) : undefined;

//     const sales = await prisma.order.findMany({
//       where: {
//         salesAgentId: agentId,
//         createdAt: {
//           gte: start,
//           lte: end,
//         },
//       },
//       include: {
//         product: true,
//         client: true,
//         salesAgent: true,
//       },
//       skip: offset,
//       take: limit,
//       orderBy: { createdAt: "desc" },
//     });

//     const formattedSales = sales.map((sale) => ({
//       id: sale.id,
//       productName: sale.product?.name || "N/A",
//       category: sale.product?.category || "N/A",
//       quantity: sale.quantity,
//       price: sale.product?.price,
//       totalAmount: sale.totalPrice,
//       region: sale.client?.name || "N/A",
//       date: sale.createdAt.toISOString(),
//       salesAgent: sale.salesAgent?.name || "Unknown",
//     }));

//     return formatResponse(true, formattedSales);
//   } catch (error: any) {
//     console.error("Error fetching sales data:", error);
//     return formatResponse(false, null, error.message || "Internal Server Error", 500);
//   }
// });

