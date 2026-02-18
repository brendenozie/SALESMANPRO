import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/admin/[slug]/billing/transactions/route.ts
import prisma from "@/server/db/prismadb";
import { TransactionStatus, TransactionType, Prisma } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getTransactions = async (request: Request, context: { params: any; user?: any }) => {
  const companyId = context.params.slug;
  const user = context.user;
  const { searchParams } = new URL(request.url);

  // Parse and validate pagination
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
  const status = searchParams.get("status")?.toUpperCase() as TransactionStatus;
  const type = searchParams.get("type")?.toUpperCase() as TransactionType;

  // ✅ Optimized Filtering
  const whereClause: Prisma.BillingTransactionWhereInput = {
    companyId,
    ...(status && { status }),
    ...(type && { type }),
    ...(user?.role !== "ADMIN" && { userId: user?.id }),
  };

  // ✅ OPTIMIZATION: Parallel execution to eliminate Query Waterfall
  
    const cacheKey = `admin:transactions:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [totalItems, transactions] = await Promise.all([
    prisma.billingTransaction.count({ where: whereClause }),
    prisma.billingTransaction.findMany({
      where: whereClause,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { transactionDate: "desc" },
      select: {
        id: true,
        userId: true,
        amount: true,
        currency: true,
        type: true,
        status: true,
        paymentMethod: true,
        transactionDate: true,
        invoiceId: true,
        description: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  try {
    if (totalItems) {
      await cacheSet(cacheKey, totalItems, 60);
    }
  } catch (e) {}

  // ✅ OPTIMIZATION: Leaner Mapping
  const transactionsData = transactions.map((t) => ({
    ...t,
    userName: t.user?.name ?? "N/A",
    userEmail: t.user?.email ?? "N/A",
    user: undefined, // Remove nested user object
    type: t.type.charAt(0) + t.type.slice(1).toLowerCase(),
    status: t.status.charAt(0) + t.status.slice(1).toLowerCase(),
    transactionDate: t.transactionDate.toISOString(),
  }));

  return formatResponse(
    true,
    {
      transactionsData,
      totalTransactionItems: totalItems,
      totalTransactionPages: Math.ceil(totalItems / limit),
    },
    "Transactions fetched successfully",
    200
  );
};

export const GET = withApiHandler(getTransactions);
// import { NextRequest } from "next/server";
  => {
//   const companyId = context.params.slug;
//   const user = context.user;
//   const { searchParams } = new URL(request.url);

//   const page = parseInt(searchParams.get("page") || "1");
//   const limit = parseInt(searchParams.get("limit") || "10");
//   const status = searchParams.get("status")?.toUpperCase() as TransactionStatus;
//   const type = searchParams.get("type")?.toUpperCase() as TransactionType;

//   const startIndex = (page - 1) * limit;

//   // ✅ Filtering
//   const whereClause: any = { companyId };
//   if (status) whereClause.status = status;
//   if (type) whereClause.type = type;

//   // If user is not admin, restrict to their own transactions
//   if (user?.role !== "ADMIN") {
//     whereClause.userId = user?.id;
//   }

//   // ✅ Count
//   const totalTransactionItems = await prisma.billingTransaction.count({
//     where: whereClause,
//   });

//   // ✅ Query
//   const transactions = await prisma.billingTransaction.findMany({
//     where: whereClause,
//     take: limit,
//     skip: startIndex,
//     orderBy: { transactionDate: "desc" },
//     include: {
//       user: {
//         select: { name: true, email: true },
//       },
//     },
//   });

//   // ✅ Map response
//   const transactionsData = transactions.map((t) => ({
//     id: t.id,
//     userId: t.userId,
//     userName: t.user?.name || "N/A",
//     userEmail: t.user?.email || "N/A",
//     amount: t.amount,
//     currency: t.currency,
//     type: (t.type.charAt(0) + t.type.slice(1).toLowerCase()) as
//       | "Subscription"
//       | "Refund"
//       | "Add-on purchase",
//     status: (t.status.charAt(0) + t.status.slice(1).toLowerCase()) as
//       | "Completed"
//       | "Pending"
//       | "Failed"
//       | "Refunded",
//     paymentMethod: t.paymentMethod,
//     transactionDate: t.transactionDate.toISOString(),
//     invoiceId: t.invoiceId,
//     description: t.description,
//   }));

//   const totalTransactionPages = Math.ceil(totalTransactionItems / limit);

//   return new Response(
//     JSON.stringify({
//       transactionsData,
//       totalTransactionItems,
//       totalTransactionPages,
//     }),
//     { status: 200, headers: { "Content-Type": "application/json" } }
//   );
// };

// // ✅ Export wrapped handler
// export const GET = withApiHandler(getTransactions);
