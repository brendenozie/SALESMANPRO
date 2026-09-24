import { buildTenantCacheKey, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { resolveCompany, getFitnessReportData } from "@/server/services/fitnessService";

type DateRange = { gte: Date; lte: Date };

const getDateRange = (period: string): DateRange => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "last7days":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "last30days":
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case "lastyear":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case "alltime":
    default:
      startDate = new Date(0);
      break;
  }
  return { gte: startDate, lte: new Date() };
};

const getReportsLogic = async (request: Request, context: any) => {
  const { searchParams } = new URL(request.url);
  const companyIdentifier =
    searchParams.get("companyId") ||
    searchParams.get("id") ||
    searchParams.get("adminSlug") ||
    searchParams.get("slug") ||
    context?.params?.adminSlug;

  if (!companyIdentifier) {
    return formatResponse(false, null, "Company identifier is required", 400);
  }

  const company = await resolveCompany(companyIdentifier);
  if (!company) {
    return formatResponse(false, null, "Company not found for the given identifier.", 404);
  }

  const period = searchParams.get("period") || "last30days";
  const cacheKey = buildTenantCacheKey(company.id, "fitness-report", { period });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const companyId = company.id;
  const dateRange = getDateRange(period);

  const baseMetrics = await getFitnessReportData(companyId, period);

  // Booking Type Distribution (for chart)
  const bookingTypeDistribution = await prisma.booking.groupBy({
    by: ["bookingType"],
    where: {
      companyId: companyId,
      status: "CONFIRMED",
      startTime: dateRange,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
  });

  const formattedBookingTypes = bookingTypeDistribution.map((item) => ({
    name: item.bookingType.replace(/_/g, " "),
    value: item._count.id,
  }));

  // Monthly/Daily Revenue Trend
  const trendData: { name: string; revenue: number }[] = [];
  const tempNow = new Date();

  if (period === "lastyear" || period === "alltime") {
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(tempNow.getFullYear(), tempNow.getMonth() - i, 1);
      const monthEnd = new Date(tempNow.getFullYear(), tempNow.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const [monthlyBookingRev, monthlyOrderRev] = await Promise.all([
        prisma.booking.aggregate({
          where: {
            companyId: companyId,
            status: "CONFIRMED",
            price: { not: null },
            startTime: { gte: monthStart, lte: monthEnd },
          },
          _sum: { price: true },
        }),
        prisma.customerOrder.aggregate({
          where: {
            companyId: companyId,
            status: "COMPLETED",
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { totalAmount: true },
        }),
      ]);

      const totalMonthRev = (monthlyBookingRev._sum.price || 0) + (monthlyOrderRev._sum.totalAmount || 0);

      trendData.push({
        name: monthStart.toLocaleString("en-US", { month: "short", year: "2-digit" }),
        revenue: totalMonthRev,
      });
    }
  } else {
    const daysInPeriod = Math.ceil((dateRange.lte.getTime() - dateRange.gte.getTime()) / (1000 * 60 * 60 * 24));
    const iterationDate = new Date(dateRange.gte);

    for (let i = 0; i <= Math.min(daysInPeriod, 31); i++) {
      const dayStart = new Date(iterationDate.getFullYear(), iterationDate.getMonth(), iterationDate.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(iterationDate.getFullYear(), iterationDate.getMonth(), iterationDate.getDate(), 23, 59, 59, 999);

      const [dailyBookingRev, dailyOrderRev] = await Promise.all([
        prisma.booking.aggregate({
          where: {
            companyId: companyId,
            status: "CONFIRMED",
            price: { not: null },
            startTime: { gte: dayStart, lte: dayEnd },
          },
          _sum: { price: true },
        }),
        prisma.customerOrder.aggregate({
          where: {
            companyId: companyId,
            status: "COMPLETED",
            createdAt: { gte: dayStart, lte: dayEnd },
          },
          _sum: { totalAmount: true },
        }),
      ]);

      const totalDayRev = (dailyBookingRev._sum.price || 0) + (dailyOrderRev._sum.totalAmount || 0);

      trendData.push({
        name: dayStart.toLocaleString("en-US", { day: "numeric", month: "short" }),
        revenue: totalDayRev,
      });

      iterationDate.setDate(iterationDate.getDate() + 1);
    }
  }

  const reportSummary = {
    period: period,
    totalRevenue: parseFloat(baseMetrics.totalRevenue.toFixed(2)),
    newMembers: baseMetrics.newMembers,
    totalMembers: baseMetrics.totalMembers,
    activeMembers: baseMetrics.activeMembers,
    attendanceRate: baseMetrics.attendanceRate,
    classAttendanceRate: baseMetrics.classAttendanceRate,
    totalBookings: baseMetrics.totalBookings,
    checkInsCount: baseMetrics.checkInsCount,
    mostBookedTrainer: baseMetrics.mostBookedTrainer,
    topPerformingClass: baseMetrics.topPerformingClass,
    equipmentRequiringMaint: baseMetrics.equipmentRequiringMaint,
    bookingTypeChartData: formattedBookingTypes,
    revenueTrendChartData: trendData,
  };

  try {
    await cacheSet(cacheKey, reportSummary, 60);
  } catch (e) {}

  return formatResponse(true, reportSummary, "Reports fetched successfully", 200);
};

export const GET = withApiHandler(getReportsLogic);
