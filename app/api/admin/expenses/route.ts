import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  try {
    
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const cacheKey = `admin:expenses:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });

  try {
    if (expenses) {
      await cacheSet(cacheKey, expenses, 60);
    }
  } catch (e) {}
    return formatResponse(true, expenses, null, 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch expenses", 500);
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { category, description, vendor, amount, schoolId } = body;

  const expense = await prisma.expense.create({
    data: {
      expenseId: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      description,
      vendor,
      amount: parseFloat(amount),
      companyId: schoolId,
    }
  });

  try { await cacheDel(`admin:expenses:${schoolId || 'global'}:all`); } catch (e) {}

  return formatResponse(true, expense, null, 200);
}