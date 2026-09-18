import { buildTenantCacheKey, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { EducatorStatus } from "@prisma/client";

export const GET = withApiHandler(
  async (_request, { params, user }) => {
    const companyId = params?.slug as string;

    if (!companyId) {
      return formatResponse(false, { message: "Company not identified in session" }, "Company not identified", 400);
    }

    try {
      const cacheKey = buildTenantCacheKey(companyId, "fitness", {});

      try {
        const cached = await cacheGet(cacheKey);
        if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
      } catch (e) {}

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
      const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));

      const [
        totalMembers,
        totalTrainers,
        monthlyCheckins,
        classesThisWeek,
        sessionsToday,
        newMembersThisMonth,
        sessions,
        checkInTrends,
        classAttendance
      ] = await prisma.$transaction([
        // 1. Total Members
        prisma.client.count({ where: { companyId, membershipStatus: 'ACTIVE' } }),
        
        // 2. Total Trainers (Educators)
        prisma.educator.count({ where: { companyId, status: EducatorStatus.ACTIVE } }),

        // 3. Monthly Check-ins (Completed Bookings)
        prisma.booking.count({ where: { companyId, status: 'COMPLETED', startTime: { gte: monthStart } } }),

        // 4. Classes This Week
        prisma.booking.count({ where: { companyId, bookingType: 'CLASS', startTime: { gte: weekStart } } }),

        // 5. Sessions Today
        prisma.booking.count({ where: { companyId, startTime: { gte: todayStart, lte: todayEnd } } }),
        
        // 6. New Members This Month (for Goal)
        prisma.client.count({ where: { companyId, joinDate: { gte: monthStart } } }),
        
        // 7. Today's Sessions List
        prisma.booking.findMany({
          where: { companyId, startTime: { gte: todayStart, lte: todayEnd } },
          take: 3,
          orderBy: { startTime: 'asc' },
          select: { id: true, title: true, startTime: true, educator: { select: { user: { select: { name: true } } } } }
        }),

        // 8. Weekly Check-in Trends
        prisma.booking.groupBy({
          by: ['startTime'],
          where: { companyId, status: 'COMPLETED', startTime: { gte: weekStart } },
          _count: { id: true },
          orderBy: { startTime: 'asc' },
        }),

        // 9. Class Attendance Distribution
        prisma.booking.groupBy({
          by: ['title'],
          where: { companyId, bookingType: 'CLASS', startTime: { gte: monthStart } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 3
        })
      ]);

      const membershipGoal = {
        target: 50,
        achieved: newMembersThisMonth,
      };
      
      const responseData = {
        stats: { totalMembers, totalTrainers, monthlyCheckins, classesThisWeek, sessionsToday },
        membershipGoal,
        sessions: sessions.map(s => ({
          id: s.id,
          title: s.title || 'Personal Training',
          time: s.startTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
          instructor: s.educator?.user?.name || 'Unassigned',
        })),
        charts: {
          checkInTrends, 
          classAttendance
        }
      };

      try {
        await cacheSet(cacheKey, responseData, 60);
      } catch (e) {
        console.error("Failed to cache fitness dashboard data:", e);
      }

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching fitness dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage }, errorMessage, 500);
    }
  },
  { requireAuth: true }
);