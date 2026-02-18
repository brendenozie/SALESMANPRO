import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(
  async (_request, { params, user }) => {
    const companyId = params?.slug as string;
    const userId = user?.id;

    if (!companyId) {
      return formatResponse(false, { message: "Company ID is required" });
    }

    try {
      
    const cacheKey = `admin:events:${companyId || 'global'}:all`;

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

      // --- METRIC CALCULATIONS ---

      // 1. & 2. Total & Upcoming Events
      const totalEvents = await prisma.event.count({ where: { companyId } });
      const upcomingEventsCount = await prisma.event.count({
        where: { companyId, startDateTime: { gte: now } },
      });

      // 3. & 4. Total Tickets Sold & Revenue
      const paidEventRegistrations = await prisma.event.findMany({
        where: {
          companyId,
          isPaid: true,
          price: { not: null },
        },
        include: {
          _count: {
            select: { EventRegistration: true },
          },
        },
      });

      let totalRevenue = 0;
      let totalTicketsSold = 0;

      paidEventRegistrations.forEach(event => {
        const ticketsForEvent = event._count.EventRegistration;
        totalTicketsSold += ticketsForEvent;
        totalRevenue += ticketsForEvent * (event.price || 0);
      });
      
      // Count registrations for free events as well
      const freeEventsRegistrations = await prisma.eventRegistration.count({
        where: {
          event: {
            companyId,
            isPaid: false
          }
        }
      });
      totalTicketsSold += freeEventsRegistrations;


      // 5. Recent Activities (Synthesized)
      const recentRegistrations = await prisma.eventRegistration.findMany({
        where: { event: { companyId } },
        orderBy: { registeredAt: 'desc' },
        take: 2,
        select: { id: true, registeredAt: true, event: { select: { title: true } } },
      });

      const recentCreatedEvents = await prisma.event.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { id: true, createdAt: true, title: true },
      });
      
      const combinedActivities = [
        ...recentRegistrations.map(r => ({
          id: `reg-${r.id}`,
          type: 'SALE',
          description: `New ticket sold for "${r.event.title}"`,
          time: r.registeredAt,
        })),
        ...recentCreatedEvents.map(e => ({
          id: `evt-${e.id}`,
          type: 'CREATE',
          description: `Event "${e.title}" was created.`,
          time: e.createdAt,
        })),
      ].sort((a, b) => (b.time?.getTime() ?? 0) - (a.time?.getTime() ?? 0)).slice(0, 3);


      // 6. Upcoming Events List
      const upcomingEventsListRaw = await prisma.event.findMany({
        where: { companyId, startDateTime: { gte: now } },
        orderBy: { startDateTime: 'asc' },
        take: 3,
        include: {
          _count: {
            select: { EventRegistration: true },
          },
        },
      });

      const responseData = {
        totalEvents,
        upcomingEvents: upcomingEventsCount,
        totalTicketsSold,
        totalRevenue,
        recentActivities: combinedActivities.map(a => ({
            ...a,
            time: `${Math.round((now.getTime() - (a.time?.getTime() ?? 0)) / 60000)} minutes ago` // Simplified time formatting
        })),
        upcomingEventsList: upcomingEventsListRaw.map(e => ({
          id: e.id,
          name: e.title,
          date: e.startDateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          ticketsSold: e._count.EventRegistration,
        })),
      };

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);