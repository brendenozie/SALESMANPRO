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

    try {
      // Find the company by its slug to get the ID
      
    const cacheKey = `admin:serviceprovider:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
      });

  try {
    if (company) {
      await cacheSet(cacheKey, company, 60);
    }
  } catch (e) {}

      if (!company) {
        return formatResponse(false, { message: "Company not found" });
      }
      // const companyId = company.id;

      const now = new Date();
      const todayStart = getStartOfDay(now);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // --- KPI STATS ---
      const newBookingsToday = await prisma.booking.count({
        where: {
          companyId,
          createdAt: { gte: todayStart },
        },
      });

      const activeClients = await prisma.client.count({
        where: {
          companyId,
          membershipStatus: 'ACTIVE',
        },
      });

      const feedbackReceivedMonth = await prisma.testimonial.count({
        where: {
          companyId,
          // createdAt: { gte: monthStart },
        },
      });

      const completedBookingsMonth = await prisma.booking.findMany({
          where: {
              companyId,
              status: 'COMPLETED',
              startTime: { gte: monthStart },
              endTime: { not: null }
          },
          select: { startTime: true, endTime: true }
      });
      
      const hoursWorkedMonth = completedBookingsMonth.reduce((total, booking) => {
          if(booking.startTime && booking.endTime) {
              const durationMillis = booking.endTime.getTime() - booking.startTime.getTime();
              return total + (durationMillis / (1000 * 60 * 60));
          }
          return total;
      }, 0);


      const pendingTasks = await prisma.task.count({
        where: {
          companyId,
          status: 'PENDING',
        },
      });

      // --- LISTS FOR UI ---
      const upcomingBookings = await prisma.booking.findMany({
        where: {
          companyId,
          status: 'PENDING',
          startTime: { gte: now },
        },
        take: 5,
        orderBy: { startTime: 'asc' },
        select: {
          id: true,
          title: true,
          startTime: true,
          client: { select: { user: { select: { name: true } } } },
        },
      });

      const recentFeedback = await prisma.testimonial.findMany({
          where: { companyId, status: 'APPROVED' },
          take: 3,
          // orderBy: { createdAt: 'desc' },
          select: {
              id: true,
              quote: true,
              authorName: true,
              rating: true,
          }
      });

      // --- CHART DATA ---
      // Chart 1: Service Trends (Bookings in last 7 days)
      const serviceTrends = await Promise.all(
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

      // Chart 2: Client Engagement (Booking Status Breakdown)
      const engagementData = await prisma.booking.groupBy({
        by: ['status'],
        where: { companyId, createdAt: { gte: monthStart } },
        _count: {
          id: true,
        },
      });
      
      const clientEngagement = {
          PENDING: engagementData.find(d => d.status === 'PENDING')?._count.id || 0,
          CONFIRMED: engagementData.find(d => d.status === 'CONFIRMED')?._count.id || 0,
          COMPLETED: engagementData.find(d => d.status === 'COMPLETED')?._count.id || 0,
          CANCELLED: engagementData.find(d => d.status === 'CANCELLED')?._count.id || 0,
      };

      // --- Final Response ---
      const responseData = {
        stats: {
          newBookings: newBookingsToday,
          activeClients: activeClients,
          feedbackReceived: feedbackReceivedMonth,
          hoursWorked: Math.round(hoursWorkedMonth),
        },
        alerts: {
            pendingTasks,
        },
        lists: {
            upcomingBookings: upcomingBookings.map(b => ({
                id: b.id,
                title: b.title,
                clientName: b.client.user?.name || 'Unknown Client',
                startTime: b.startTime?.toISOString(),
            })),
            recentFeedback,
        },
        charts: {
            serviceTrends,
            clientEngagement,
        }
      };

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching service provider dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);
