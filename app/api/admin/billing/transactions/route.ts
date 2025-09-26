// app/api/admin/[slug]/billing/transactions/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const getTransactions = async (request: Request, context: { params: { slug: string }; user?: any }) => {
  const companyId = context.params.slug;
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status")?.toUpperCase() as TransactionStatus;
  const type = searchParams.get("type")?.toUpperCase() as TransactionType;

  const startIndex = (page - 1) * limit;

  // ✅ Filtering
  const whereClause: any = { companyId };
  if (status) whereClause.status = status;
  if (type) whereClause.type = type;

  // If user is not admin, restrict to their own transactions
  if (context.user?.role !== "ADMIN") {
    whereClause.userId = context.user.id;
  }

  // ✅ Count
  const totalTransactionItems = await prisma.billingTransaction.count({
    where: whereClause,
  });

  // ✅ Query
  const transactions = await prisma.billingTransaction.findMany({
    where: whereClause,
    take: limit,
    skip: startIndex,
    orderBy: { transactionDate: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  // ✅ Map response
  const transactionsData = transactions.map((t) => ({
    id: t.id,
    userId: t.userId,
    userName: t.user?.name || "N/A",
    userEmail: t.user?.email || "N/A",
    amount: t.amount,
    currency: t.currency,
    type: (t.type.charAt(0) + t.type.slice(1).toLowerCase()) as
      | "Subscription"
      | "Refund"
      | "Add-on purchase",
    status: (t.status.charAt(0) + t.status.slice(1).toLowerCase()) as
      | "Completed"
      | "Pending"
      | "Failed"
      | "Refunded",
    paymentMethod: t.paymentMethod,
    transactionDate: t.transactionDate.toISOString(),
    invoiceId: t.invoiceId,
    description: t.description,
  }));

  const totalTransactionPages = Math.ceil(totalTransactionItems / limit);

  return new Response(
    JSON.stringify({
      transactionsData,
      totalTransactionItems,
      totalTransactionPages,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

// ✅ Export wrapped handler
export const GET = withApiHandler(getTransactions, {
  requireAuth: true,
  requireRateLimit: true,
});
