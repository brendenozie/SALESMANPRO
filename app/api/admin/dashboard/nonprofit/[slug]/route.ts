import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(
  async (_request, { params, user }) => {
    const companyId = params?.slug as string;
    const userId = user?.id;

    if (!userId || !companyId) {
      return formatResponse(false, { message: "User or Company not identified in session" });
    }

    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const weekEnd = new Date(new Date().setDate(todayStart.getDate() + 7));

      // --- METRIC CALCULATIONS ---

      // 1. Total Donations (Year-to-Date)
      const ytdStart = new Date(now.getFullYear(), 0, 1);
      const donationAggregate = await prisma.donation.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          donationDate: { gte: ytdStart },
          // Assuming donations are linked to a company via the donor's user profile
          donor: { user: { companyId: companyId } }
        },
      });
      const totalDonations = donationAggregate._sum.amount || 0;

      // 2. Active Campaigns
      
    const cacheKey = `admin:nonprofit:${companyId || 'global'}:all`;

      try {
        const cached = await cacheGet(cacheKey);
        if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
      } catch (e) {}

  const activeCampaigns = await prisma.campaign.count({
        where: { status: 'ACTIVE' },
        // Note: Campaign model isn't directly linked to Company in schema, so this is a global count.
      });

      // 3. Total Volunteers (assumed to be distinct users who are project members)
      const volunteerMembers = await prisma.projectMember.findMany({
        where: { project: { companyId: companyId } },
        distinct: ['userId'],
        select: { userId: true }
      });
      const totalVolunteers = volunteerMembers.length;

      // 4. Upcoming Events (this quarter)
      const upcomingEvents = await prisma.event.count({
        where: {
          companyId: companyId,
          eventStatus: 'SCHEDULED',
          startDateTime: { gte: quarterStart },
        },
      });

      // --- IMMEDIATE ACTION TASKS ---
      const tasks = await prisma.task.findMany({
        where: {
          assignedToId: userId,
          companyId: companyId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { gte: todayStart, lte: weekEnd },
        },
        take: 3,
        orderBy: { dueDate: 'asc' },
        select: {
          id: true,
          taskName: true,
          dueDate: true,
          dueTime: true,
        },
      });

      // --- CHART DATA (Example Stubs) ---
      const monthlyDonations = [{ month: 'Aug', amount: 12000 }, { month: 'Sep', amount: 18500 }];
      const volunteerGrowth = [{ month: 'Aug', new: 12 }, { month: 'Sep', new: 18 }];

      // --- FINAL RESPONSE ---
      const responseData = {
        metrics: {
          totalDonations,
          activeCampaigns,
          totalVolunteers,
          upcomingEvents,
        },
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.taskName,
          dueDate: task.dueDate?.toISOString().split('T')[0] || 'N/A',
          dueTime: task.dueTime || 'Any time',
        })),
        charts: {
            monthlyDonations,
            volunteerGrowth
        }
      };

      try {
        await cacheSet(cacheKey, responseData, 60); // Cache for 60 seconds
      } catch (e) {
        console.error("Failed to cache non-profit dashboard data:", e);
      }

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching non-profit dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);