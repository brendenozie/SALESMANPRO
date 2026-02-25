
"use server";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper: start of a given day
const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const GET = withApiHandler(
  async (_request, { params }) => {
    const companyId = params?.slug as string;

    if (!companyId) {
        return formatResponse(false, { message: "Company ID is required" });
    }

    try {
      // Find the company by its ID to ensure it exists
      
    const cacheKey = `admin:booking:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
      });

      if (!company) {
        return formatResponse(false, { message: "Company not found" });
      }

      const now = new Date();
      const todayStart = getStartOfDay(now);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // --- KPI STATS ---
      // Stat 1: Upcoming Bookings (equivalent to New Bookings today/future)
      const upcomingBookingsCount = await prisma.booking.count({
        where: {
          companyId,
          status: 'PENDING',
          startTime: { gte: todayStart },
        },
      });

      // Stat 2: Total Active Clients
      const activeClientsCount = await prisma.client.count({
        where: {
          companyId,
          // status: 'ACTIVE',
        },
      });

      // Stat 3: Completed Sessions This Month
      const completedBookingsMonthCount = await prisma.booking.count({
        where: {
            companyId,
            status: 'COMPLETED',
            startTime: { gte: monthStart },
        },
      });

      // Stat 4: Hours This Week
      const weekStart = getStartOfDay(new Date());
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of the current week (Sunday)
      
      const completedBookingsWeek = await prisma.booking.findMany({
          where: {
              companyId,
              status: 'COMPLETED',
              startTime: { gte: weekStart },
              endTime: { not: null }
          },
          select: { startTime: true, endTime: true }
      });
      
      const hoursWorkedWeek = completedBookingsWeek.reduce((total, booking) => {
          if(booking.startTime && booking.endTime) {
              const durationMillis = booking.endTime.getTime() - booking.startTime.getTime();
              return total + (durationMillis / (1000 * 60 * 60));
          }
          return total;
      }, 0);

      // --- LISTS FOR UI ---
      // Upcoming appointments for the list
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          companyId,
          status: { in: ['SCHEDULED', 'PENDING'] },
          date: { gte: todayStart },
        },
        take: 4,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          status: true,
          date: true,
          user: { select: { name: true } },
        },
      });

      // --- CHART DATA ---
      // Chart 1: Booking Volume Trend (Last 7 Days)
      const bookingVolumeTrend = await Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = getStartOfDay(date);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const count = await prisma.booking.count({
            where: {
              companyId,
              createdAt: { gte: dayStart, lte: dayEnd },
            },
          });
          return { name: date.toLocaleDateString('en-US', { weekday: 'short' }), value: count };
        })
      ).then((data) => data.reverse());

      // Chart 2: Monthly Conversion/Completion Rate
      const conversionRateData = await prisma.booking.groupBy({
        by: ['status'],
        where: { companyId, startTime: { gte: monthStart } },
        _count: {
          id: true,
        },
      });
      
      const monthlyConversion = {
          PENDING: conversionRateData.find(d => d.status === 'PENDING')?._count.id || 0,
          CONFIRMED: conversionRateData.find(d => d.status === 'CONFIRMED')?._count.id || 0,
          COMPLETED: conversionRateData.find(d => d.status === 'COMPLETED')?._count.id || 0,
          CANCELLED: conversionRateData.find(d => d.status === 'CANCELLED')?._count.id || 0,
      };

      // --- Final Response ---
      const responseData = {
        stats: {
          upcomingBookings: upcomingBookingsCount,
          totalClients: activeClientsCount,
          completedSessions: completedBookingsMonthCount,
          hoursThisWeek: Math.round(hoursWorkedWeek),
        },
        appointments: upcomingAppointments.map(a => ({
            id: a.id,
            name: a.user?.name || 'Unknown Client',
            type: a.status === 'PENDING' ? 'New Appointment' : 'Consultation', // Example mapping
            time: a.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: a.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })),
        charts: {
            bookingVolume: bookingVolumeTrend,
            monthlyConversion: monthlyConversion,
        }
      };

      try {
        await cacheSet(cacheKey, responseData, 60);
      } catch (e) {
        console.error("Failed to cache booking dashboard data:", e);
      }

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching booking appointments dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);