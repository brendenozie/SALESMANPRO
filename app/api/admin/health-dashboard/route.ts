import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { ROLES } from "@prisma/client";


async function getDashboardSummary(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  // NOTE: Authentication and try/catch are handled by withApiHandler.
  const { adminSlug } = params;

  // 1. Find Company and Get Company ID
  
  const cacheKey = `admin:health-dashboard:${adminSlug || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found.", 404);
  }

  const companyId = company.id;

  // 2. Define Date Boundaries and User Filters
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today (UTC or local, depending on environment)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
  const rolesFilter: ROLES[] = [ROLES.CLIENT, ROLES.CONSUMER, ROLES.STUDENT, ROLES.PARENT];
  // const rolesFilter = ["CLIENT", "CONSUMER", "STUDENT", "PARENT"];

  // Pre-fetch all relevant patient/client User IDs for query filtering
  const companyUsers = await prisma.user.findMany({
    where: {
      Company: { some: { id: companyId } },
      role: { in: rolesFilter }
    },
    select: { id: true }
  });
  const companyUserIds = companyUsers.map(u => u.id);

  // 3. Fetch Metrics in Parallel (Performance Optimization)
  const [
    totalPatients,
    upcomingAppointments,
    todayOrders,
    activeDoctors
  ] = await Promise.all([
    // Total Patients (Users with specific roles tied to the company)
    prisma.user.count({
      where: { id: { in: companyUserIds } },
    }),

    // Upcoming Appointments (from today onwards, PENDING/CONFIRMED)
    prisma.appointment.count({
      where: {
        userId: { in: companyUserIds },
        date: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),

    // Today's Orders (Revenue Calculation)
    prisma.customerOrder.findMany({
      where: {
        companyId: companyId,
        createdAt: { gte: today, lt: tomorrow },
        status: { not: "CANCELLED" },
      },
      select: { totalPrice: true },
    }),

    // Active Doctors/Educators (count all educators linked to the company)
    prisma.educator.count({
      where: { companyId: companyId },
    }),
  ]);

  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  // Mock new prescriptions (as no model exists)
  const newPrescriptions = Math.floor(Math.random() * 20) + 15;

  // 4. Fetch Recent Activity
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentAppointments = await prisma.appointment.findMany({
    where: {
      userId: { in: companyUserIds },
      createdAt: { gte: sevenDaysAgo }, // Last 7 days
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      date: true,
      status: true,
      user: { select: { name: true } },
    },
  });

  const recentActivity = recentAppointments.map(appt => ({
    type: 'appointment_booked',
    details: `Appointment for ${appt.user?.name || 'N/A'} on ${new Date(appt.date).toLocaleDateString()} at ${new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    timestamp: appt.date.toISOString(),
  }));

  // Add mock recent patient registration (for demonstration)
  recentActivity.push({
    type: 'patient_registered',
    details: 'New patient registered: John Doe',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Sort activity to ensure the mock item is in the correct order
  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  try{
    if (recentActivity) {
      await cacheSet(cacheKey, recentActivity, 60);
    }
  } catch (e) {}

  // 5. Success Response
  return formatResponse(true, {
    totalPatients,
    upcomingAppointments,
    todayRevenue,
    activeDoctors,
    newPrescriptions,
    recentActivity,
  }, 'Dashboard summary fetched successfully', 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getDashboardSummary);
