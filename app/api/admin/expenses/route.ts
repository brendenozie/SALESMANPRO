import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
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

  return NextResponse.json(expense);
}