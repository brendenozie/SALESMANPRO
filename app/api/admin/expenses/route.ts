import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || searchParams.get("schoolId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!companyId) {
      return formatResponse(false, null, "Missing required companyId parameter", 400);
    }

    const where: any = { companyId };

    if (category && category !== "All") {
      where.category = category;
    }

    if (status && status !== "All") {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    if (search?.trim()) {
      where.OR = [
        { description: { contains: search.trim(), mode: "insensitive" } },
        { vendor: { contains: search.trim(), mode: "insensitive" } },
        { expenseId: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    const totalAmount = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    });

    return formatResponse(
      true,
      {
        expenses,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        totalAmount: totalAmount._sum.amount || 0,
      },
      "Expenses fetched successfully",
      200
    );
  } catch (error: any) {
    console.error("Fetch expenses error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch expenses", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId = body.companyId || body.schoolId;

    if (!companyId) {
      return formatResponse(false, null, "companyId is required", 400);
    }
    if (!body.category || !body.description || body.amount === undefined) {
      return formatResponse(false, null, "Category, description, and amount are required", 400);
    }

    const expenseId = body.expenseId || `EXP-${Date.now().toString().slice(-6)}`;
    const parsedAmount = parseFloat(body.amount);
    const parsedTax = body.taxAmount !== undefined ? parseFloat(body.taxAmount) : 0;

    const expense = await prisma.expense.create({
      data: {
        expenseId,
        category: body.category,
        description: body.description,
        vendor: body.vendor || "N/A",
        amount: parsedAmount,
        taxAmount: parsedTax,
        paymentMethod: body.paymentMethod || "CASH",
        reference: body.reference || null,
        costCenter: body.costCenter || "Operations",
        approvedBy: body.approvedBy || null,
        isRecurring: Boolean(body.isRecurring),
        status: body.status || "Paid",
        date: body.date ? new Date(body.date) : new Date(),
        receiptUrl: body.receiptUrl || null,
        notes: body.notes || null,
        companyId,
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:expenses:*`);
      await cacheDel(`admin:expenses:*`);
    } catch (e) {}

    return formatResponse(true, expense, "Expense recorded successfully", 201);
  } catch (error: any) {
    console.error("Create expense error:", error);
    return formatResponse(false, null, error?.message || "Failed to record expense", 500);
  }
}