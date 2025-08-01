// import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
// app/api/admin/[slug]/billing/transactions/route.ts
import { PrismaClient, TransactionStatus, TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Initialize Prisma Client
// const prisma = new PrismaClient();

// This API route handles fetching paginated and filtered billing transactions for a company.
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const companyId = params.slug;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status")?.toUpperCase() as TransactionStatus;
    const type = searchParams.get("type")?.toUpperCase() as TransactionType;

    const startIndex = (page - 1) * limit;

    // Define the filter conditions
    const whereClause: any = {
      companyId: companyId,
    };

    if (status) {
      whereClause.status = status;
    }
    if (type) {
      whereClause.type = type;
    }

    // Fetch total count of transactions for pagination
    const totalTransactionItems = await prisma.billingTransaction.count({
      where: whereClause,
    });

    // Fetch transactions with pagination, filtering, and including user data
    const transactions = await prisma.billingTransaction.findMany({
      where: whereClause,
      take: limit,
      skip: startIndex,
      orderBy: { transactionDate: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Map Prisma results to the TransactionItem interface
    const transactionsData = transactions.map((t) => ({
      id: t.id,
      userId: t.userId,
      userName: t.user?.name || "N/A",
      userEmail: t.user?.email || "N/A",
      amount: t.amount,
      currency: t.currency,
      type: t.type.charAt(0) + t.type.slice(1).toLowerCase() as "Subscription" | "Refund" | "Add-on Purchase",
      status: t.status.charAt(0) + t.status.slice(1).toLowerCase() as "Completed" | "Pending" | "Failed" | "Refunded",
      paymentMethod: t.paymentMethod,
      transactionDate: t.transactionDate.toISOString(),
      invoiceId: t.invoiceId,
      description: t.description,
    }));

    const totalTransactionPages = Math.ceil(totalTransactionItems / limit);

    return NextResponse.json({
      transactionsData,
      totalTransactionItems,
      totalTransactionPages,
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions", details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
