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
      
    const cacheKey = `admin:healthcare:${companyId || 'global'}:all`;

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
      // const companyId = company.id;

      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));

      // --- METRIC CALCULATIONS ---

      // 1. Total Active Patients
      const totalActivePatients = await prisma.patient.count({
        where: { user: { companyId: companyId, status: 'ACTIVE' } },
      });

      // 2. Upcoming Appointments Today
      const upcomingAppointments = await prisma.appointment.count({
        where: {
          companyId,
          status: 'SCHEDULED',
          date: { gte: todayStart, lte: todayEnd },
        },
      });

      // 3. Unsigned Documents (using pending prescriptions as a proxy)
      const unsignedDocuments = await prisma.prescription.count({
        where: { companyId, status: 'PENDING' },
      });

      // 4. Active Physicians
      const activePhysicians = await prisma.doctor.count({
        where: { companyId, status: 'ACTIVE' },
      });
      
      // 5. Today's Gross Revenue
      const revenueAggregate = await prisma.patientInvoices.aggregate({
        _sum: { amount: true },
        where: {
          companyId,
          status: 'PAID',
          invoiceDate: { gte: todayStart, lte: todayEnd },
        },
      });
      const todaysRevenue = revenueAggregate._sum.amount || 0;

      // --- ALERTS & ACTIVITY LOG (SYNTHESIZED) ---
      
      // Critical Alerts
      const criticalAlerts = await prisma.task.findMany({
        where: {
            companyId,
            priority: 'HIGH',
            status: 'PENDING'
        },
        take: 2,
        select: { id: true, taskName: true, dueTime: true }
      });
      
      // Recent Activity
      const recentActivitiesRaw = await prisma.userActivity.findMany({
        where: { user: { companyId } },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: { id: true, activityType: true, details: true, createdAt: true },
      });
      
      const recentActivities = recentActivitiesRaw.map(act => ({
          id: act.id,
          type: act.activityType,
          // A real implementation would have more robust detail parsing
          description: `Activity of type "${act.activityType}" was recorded.`,
          time: act.createdAt?.toLocaleTimeString() || 'N/A'
      }));

      const responseData = {
        metrics: {
          totalActivePatients,
          upcomingAppointments,
          unsignedDocuments,
          activePhysicians,
          todaysRevenue,
        },
        criticalAlerts,
        recentActivities
      };

      try {
        await cacheSet(cacheKey, responseData, 60); // Cache for 60 seconds
      } catch (e) {
        console.error("Failed to cache healthcare dashboard data:", e);
      }

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching healthcare dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);