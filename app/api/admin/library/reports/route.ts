import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

const getLibraryStats = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  // Date ranges for trend calculation
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const cacheKey = `admin:libraryReports:${companyId || 'global'}:stats`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Analytics fetched (Cached)", 200);
  } catch (e) {}

  const [
    totalBooks,
    activeLoans,
    newMembers,
    totalFines,
    categoryStats
  ] = await Promise.all([
    prisma.libraryBook.count({ where: { companyId } }),
    prisma.libraryLoan.count({ where: { status: "ACTIVE", book: { companyId } } }),
    prisma.libraryMember.count({ where: { companyId, createdAt: { gte: currentMonthStart } } }),
    prisma.libraryFine.aggregate({
      where: { status: "PAID", loan: { book: { companyId } } },
      _sum: { amount: true }
    }),
    prisma.libraryBook.groupBy({
      by: ['category'],
      where: { companyId },
      _count: { _all: true },
    })
  ]);

  const reportData = {
    kpis: {
      circulationRate: totalBooks > 0 ? ((activeLoans / totalBooks) * 100).toFixed(1) : 0,
      newMembers: newMembers,
      revenue: totalFines._sum.amount || 0,
      avgLendingTime: 14, // Calculation logic for avg duration goes here
    },
    categories: categoryStats.map(c => ({
      name: c.category,
      count: c._count._all
    })).sort((a, b) => b.count - a.count).slice(0, 5)
  };

  try {
    await cacheSet(cacheKey, reportData, 300); // Cache for 5 minutes
  } catch (e) {}
  
  return formatResponse(true, reportData, "Analytics generated", 200);
};

export const GET = withApiHandler(getLibraryStats, { requireAuth: true });