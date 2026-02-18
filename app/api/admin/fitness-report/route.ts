import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from '@/server/db/prismadb'; // Adjust this path
// New Imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// Type definitions
type DateRange = { gte: Date, lte: Date };
type RouteContext = {
    params: {
        adminSlug: string;
    };
};

// Helper to get date ranges
const getDateRange = (period: string): DateRange => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case 'last7days':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'last30days':
            startDate = new Date(now.setDate(now.getDate() - 30));
            break;
        case 'lastyear':
            // Setting the month and date preserves the time of day, but we usually want midnight
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        case 'alltime':
        default:
            startDate = new Date(0); // Epoch start
            break;
    }
    return { gte: startDate, lte: new Date() };
};

// --- GET Handler Logic (Fetches aggregated report data) ---
const getReportsLogic = async (request: Request, { params }: RouteContext) => {
    const { adminSlug } = params;
    
    const { searchParams } = new URL(request.url);

    const period = searchParams.get('period') || 'last30days';

    // const companyId = searchParams.get('id');

    
    const cacheKey = `admin:fitness-report:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const company = await prisma.company.findUnique({
        where: { slug: adminSlug },
        select: { id: true },
    });

  try {
    if (company) {
      await cacheSet(cacheKey, company, 60);
    }
  } catch (e) {}

    if (!company) {
        // Use formatResponse for 404
        return formatResponse(false, null, 'Company not found for the given slug.', 404);
    }

    const companyId = company.id;
    const dateRange = getDateRange(period);

    // 1. Total Revenue (from confirmed bookings with a price)
    const revenueResult = await prisma.booking.aggregate({
        where: {
            companyId: companyId,
            status: 'CONFIRMED',
            price: { not: null },
            startTime: dateRange,
        },
        _sum: {
            price: true,
        },
    });
    const totalRevenue = revenueResult._sum.price || 0;

    // 2. New Members
    const newMembersCount = await prisma.client.count({
        where: {
            companyId: companyId,
            joinDate: dateRange,
        },
    });

    // 3. Total Confirmed Bookings
    const totalConfirmedBookings = await prisma.booking.count({
        where: {
            companyId: companyId,
            status: 'CONFIRMED',
            startTime: dateRange,
        },
    });

    // 4. Booking Type Distribution (for chart)
    const bookingTypeDistribution = await prisma.booking.groupBy({
        by: ['bookingType'],
        where: {
            companyId: companyId,
            status: 'CONFIRMED',
            startTime: dateRange,
        },
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: 'desc',
            },
        },
    });
    const formattedBookingTypes = bookingTypeDistribution.map(item => ({
        name: item.bookingType.replace(/_/g, ' '),
        value: item._count.id,
    }));

    // 5. Monthly/Daily Revenue Trend (for chart)
    const trendData: { name: string, revenue: number }[] = [];
    const tempNow = new Date(); // Use a temp variable for iteration to avoid mutation issues

    // Logic for Monthly (Year/All-time)
    if (period === 'lastyear' || period === 'alltime') {
        for (let i = 11; i >= 0; i--) {
            const monthStart = new Date(tempNow.getFullYear(), tempNow.getMonth() - i, 1);
            const monthEnd = new Date(tempNow.getFullYear(), tempNow.getMonth() - i + 1, 0, 23, 59, 59, 999);

            const monthlyRevenue = await prisma.booking.aggregate({
                where: {
                    companyId: companyId,
                    status: 'CONFIRMED',
                    price: { not: null },
                    startTime: { gte: monthStart, lte: monthEnd },
                },
                _sum: { price: true },
            });
            trendData.push({
                name: monthStart.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                revenue: monthlyRevenue._sum.price || 0,
            });
        }
    } else {
        // Logic for Daily (Last 7 or 30 days)
        const daysInPeriod = Math.ceil((dateRange.lte.getTime() - dateRange.gte.getTime()) / (1000 * 60 * 60 * 24));
        // Reset tempNow for accurate day iteration starting from the start date
        const iterationDate = new Date(dateRange.gte);

        for (let i = 0; i <= daysInPeriod; i++) {
            const dayStart = new Date(iterationDate.getFullYear(), iterationDate.getMonth(), iterationDate.getDate(), 0, 0, 0, 0);
            const dayEnd = new Date(iterationDate.getFullYear(), iterationDate.getMonth(), iterationDate.getDate(), 23, 59, 59, 999);

            const dailyRevenue = await prisma.booking.aggregate({
                where: {
                    companyId: companyId,
                    status: 'CONFIRMED',
                    price: { not: null },
                    startTime: { gte: dayStart, lte: dayEnd },
                },
                _sum: { price: true },
            });
            trendData.push({
                name: dayStart.toLocaleString('en-US', { day: 'numeric', month: 'short' }),
                revenue: dailyRevenue._sum.price || 0,
            });
            // Move to the next day
            iterationDate.setDate(iterationDate.getDate() + 1);
        }
    }

    // 6. Most Booked Trainer
    const mostBookedTrainerResult = await prisma.booking.groupBy({
        by: ['educatorId'],
        where: {
            companyId: companyId,
            status: 'CONFIRMED',
            bookingType: 'PERSONAL_TRAINING',
            educatorId: { not: null },
            startTime: dateRange,
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
    });

    let mostBookedTrainerName = 'N/A';
    if (mostBookedTrainerResult.length > 0 && mostBookedTrainerResult[0].educatorId) {
        const trainer = await prisma.educator.findUnique({
            where: { id: mostBookedTrainerResult[0].educatorId },
            include: { user: { select: { name: true } } },
        });
        mostBookedTrainerName = trainer?.user?.name || 'Unknown Trainer';
    }

    // 7. Top Class (by confirmed bookings)
    const topClassResult = await prisma.booking.groupBy({
        by: ['title'],
        where: {
            companyId: companyId,
            status: 'CONFIRMED',
            bookingType: 'CLASS',
            startTime: dateRange,
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
    });
    const topPerformingClassName = topClassResult.length > 0 ? topClassResult[0].title : 'N/A';


    const reportSummary = {
        period: period,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        newMembers: newMembersCount,
        totalBookings: totalConfirmedBookings,
        mostBookedTrainer: mostBookedTrainerName,
        topPerformingClass: topPerformingClassName,
        bookingTypeChartData: formattedBookingTypes,
        revenueTrendChartData: trendData,
    };

    // Use formatResponse for success
    return formatResponse(true, reportSummary, 'Reports fetched successfully', 200);
};

// Export the wrapped GET function
// Authentication and error handling are now centralized
export const GET = withApiHandler(getReportsLogic);
