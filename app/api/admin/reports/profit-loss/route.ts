import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { isWithinInterval } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const start = searchParams.get("start") || new Date(new Date().getFullYear(), 0, 1).toISOString();
  const end = searchParams.get("end") || new Date().toISOString();

  const startDate = new Date(start);
  const endDate = new Date(end);

  try {
    // 1. Fetch Expenses grouped by Category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        companyId: companyId || undefined,
        date: { gte: startDate, lte: endDate },
        status: "Paid"
      },
      _sum: { amount: true }
    });

    // 2. Fetch Fee Records with relevant payments
    const feeRecords = await prisma.studentFeeRecord.findMany({
      where: { 
        student: { companyId: companyId || undefined },
        // Optimization: Only fetch records that have had payments since the start date
        lastPaymentDate: { gte: start.split('T')[0] } 
      }
    });

    let totalIncome = 0;
    // You can later expand this logic to check p.feeType if you add it to the payment JSON
    const incomeSources = { Tuition: 0, Other: 0 };

    feeRecords.forEach(record => {
      const payments = (record.payments as any[]) || [];
      payments.forEach(p => {
        const pDate = new Date(p.date);
        if (isWithinInterval(pDate, { start: startDate, end: endDate })) {
          totalIncome += p.amount;
          incomeSources.Tuition += p.amount; 
        }
      });
    });

    const totalExpenses = expensesByCategory.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);

    return NextResponse.json({
      netSurplus: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      incomeBreakdown: [
        { 
          label: 'Student Fees', 
          value: totalIncome, 
          percent: 100 
        },
      ],
      expenseBreakdown: expensesByCategory.map(exp => ({
        label: exp.category,
        value: exp._sum.amount || 0,
        percent: totalExpenses > 0 ? ((exp._sum.amount || 0) / totalExpenses) * 100 : 0
      }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Aggregation failed" }, { status: 500 });
  }
}