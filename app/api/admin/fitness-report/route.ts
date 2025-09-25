// app/api/admin/[adminSlug]/reports/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// Helper to get date ranges
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'last7days':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'last30days':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case 'lastyear':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case 'alltime':
    default:
      startDate = new Date(0); // Epoch start
      break;
  }
  return { gte: startDate, lte: new Date() };
};

// GET /api/admin/[adminSlug]/reports
// Fetches aggregated report data for a specific company and period.
export async function GET(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'last30days'; // Default to last 30 days

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
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

    // 5. Monthly Revenue Trend (for chart) - last 12 months for 'alltime' or 'lastyear', otherwise daily
    const now = new Date();
    let revenueTrendData = [];

    if (period === 'lastyear' || period === 'alltime') {
      // Aggregate by month for annual/all-time views
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

        const monthlyRevenue = await prisma.booking.aggregate({
          where: {
            companyId: companyId,
            status: 'CONFIRMED',
            price: { not: null },
            startTime: { gte: monthStart, lte: monthEnd },
          },
          _sum: {
            price: true,
          },
        });
        revenueTrendData.push({
          name: monthStart.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
          revenue: monthlyRevenue._sum.price || 0,
        });
      }
    } else {
      // Aggregate by day for shorter periods
      const daysInPeriod = Math.ceil((dateRange.lte.getTime() - dateRange.gte.getTime()) / (1000 * 60 * 60 * 24));
      for (let i = daysInPeriod; i >= 0; i--) {
        const date = new Date(now.setDate(now.getDate() - i));
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

        const dailyRevenue = await prisma.booking.aggregate({
          where: {
            companyId: companyId,
            status: 'CONFIRMED',
            price: { not: null },
            startTime: { gte: dayStart, lte: dayEnd },
          },
          _sum: {
            price: true,
          },
        });
        revenueTrendData.push({
          name: dayStart.toLocaleString('en-US', { day: 'numeric', month: 'short' }),
          revenue: dailyRevenue._sum.price || 0,
        });
      }
    }


    // 6. Most Booked Trainer
    const mostBookedTrainerResult = await prisma.booking.groupBy({
      by: ['educatorId'],
      where: {
        companyId: companyId,
        status: 'CONFIRMED',
        bookingType: 'PERSONAL_TRAINING', // Focus on personal training bookings
        educatorId: { not: null },
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
      take: 1,
    });

    let mostBookedTrainerName = 'N/A';
    if (mostBookedTrainerResult.length > 0) {
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
        bookingType: 'CLASS', // Focus on class bookings
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
      take: 1,
    });
    const topPerformingClassName = topClassResult.length > 0 ? topClassResult[0].title : 'N/A';


    const reportSummary = {
      period: period,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      newMembers: newMembersCount,
      totalBookings: totalConfirmedBookings, // Using confirmed bookings as a metric
      mostBookedTrainer: mostBookedTrainerName,
      topPerformingClass: topPerformingClassName,
      bookingTypeChartData: formattedBookingTypes,
      revenueTrendChartData: revenueTrendData,
    };

    return NextResponse.json(reportSummary);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: 'Failed to fetch reports', error: error.message }, { status: 500 });
  }
}
