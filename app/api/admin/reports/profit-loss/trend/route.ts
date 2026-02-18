import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { subMonths, startOfMonth, endOfMonth, format, isWithinInterval } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const months = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), i)).reverse();
    
    
    const cacheKey = `admin:trend:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const trendData = await Promise.all(months.map(async (date) => {
      const start = startOfMonth(date);

  try {
    if (trendData) {
      await cacheSet(cacheKey, trendData, 60);
    }
  } catch (e) {}
      const end = endOfMonth(date);

      // 1. Sum Expenses for this specific month
      const expenses = await prisma.expense.aggregate({
        where: { 
          date: { gte: start, lte: end }, 
          status: "Paid", 
          companyId: companyId || undefined // Assuming schoolId is your relation field
        },
        _sum: { amount: true }
      });

      // 2. Fetch records that had ANY activity in this month
      const records = await prisma.studentFeeRecord.findMany({
        where: {
          student: { companyId: companyId || undefined },
          // companyId: companyId || undefined,
          // We look for records where the last payment date is at least after the start of month
          lastPaymentDate: { gte: format(start, "yyyy-MM-dd") } 
        }
      });

      let monthlyIncome = 0;
      records.forEach(record => {
        const payments = (record.payments as any[]) || [];
        payments.forEach(p => {
          const paymentDate = new Date(p.date);
          // Only add to this month's total if the payment date is within this month
          if (isWithinInterval(paymentDate, { start, end })) {
            monthlyIncome += p.amount;
          }
        });
      });

      return {
        month: format(date, "MMM"),
        income: monthlyIncome,
        expenses: expenses._sum.amount || 0
      };
    }));

    return NextResponse.json(trendData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Trend calculation failed" }, { status: 500 });
  }
}