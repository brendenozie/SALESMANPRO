import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


async function getAppointmentTrends(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const period = searchParams.get("period") || "monthly"; // daily, weekly, monthly
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  // 1. Find Company
  
    const cacheKey = `admin:appointment-trends:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  try {
    if (company) {
      await cacheSet(cacheKey, company, 60);
    }
  } catch (e) {}

  if (!company) {
    // Use formatResponse for expected domain-specific errors (like 404)
    return formatResponse(false, null, "Company not found", 404);
  }

  const companyId = company.id;

  let startDate: Date;
  let endDate: Date;

  // 2. Calculate Date Range
  if (startDateParam && endDateParam) {
    startDate = new Date(startDateParam);
    endDate = new Date(endDateParam);
  } else {
    // Default date range calculation
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    if (period === 'monthly') {
      endDate = new Date(now);
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
    } else if (period === 'weekly') {
      endDate = new Date(now);
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 28); // Last 4 weeks
    } else { // daily
      endDate = new Date(now);
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7); // Last 7 days
    }
  }

  // If using default date calculation, set end date to the start of the next day
  if (!endDateParam) {
    endDate.setDate(endDate.getDate() + 1);
  }

  // 3. Get all user IDs associated with this company
  const companyUserIds = (await prisma.user.findMany({
    where: {
      Company: { some: { id: companyId } }
    },
    select: { id: true }
  })).map(u => u.id);

  // 4. Fetch Appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      userId: { in: companyUserIds.length > 0 ? companyUserIds : [''] }, // Avoid error on empty list
      date: {
        gte: startDate,
        lt: endDate, // Use less than (<) to cover the full date range efficiently
      },
      // status: { not: "DRAFT" } // Exclude any potential draft status
    },
    orderBy: { date: 'asc' },
    select: {
      date: true,
      status: true,
    },
  });

  // 5. Aggregate Data
  const trendsData: { [key: string]: { total: number; completed: number; cancelled: number; scheduled: number } } = {};

  appointments.forEach(appt => {
    let key: string;
    const apptDate = new Date(appt.date);

    // Grouping logic based on period
    if (period === 'monthly') {
      key = `${apptDate.getFullYear()}-${(apptDate.getMonth() + 1).toString().padStart(2, '0')}`;
    } else if (period === 'weekly') {
      // Retain original simplified week calculation
      const firstDayOfYear = new Date(apptDate.getFullYear(), 0, 1);
      const pastDays = (apptDate.getTime() - firstDayOfYear.getTime()) / 86400000;
      key = `${apptDate.getFullYear()}-W${Math.ceil(pastDays / 7).toString().padStart(2, '0')}`;
    } else { // daily
      key = apptDate.toISOString().split('T')[0];
    }

    if (!trendsData[key]) {
      trendsData[key] = { total: 0, completed: 0, cancelled: 0, scheduled: 0 };
    }
    trendsData[key].total++;
    if (appt.status === 'COMPLETED') trendsData[key].completed++;
    else if (appt.status === 'CANCELED') trendsData[key].cancelled++;
    else if (appt.status === 'PENDING' || appt.status === 'CONFIRMED') trendsData[key].scheduled++;
  });

  const sortedKeys = Object.keys(trendsData).sort();
  const formattedData = sortedKeys.map(key => ({
    period: key,
    ...trendsData[key],
  }));

  // 6. Return formatted success response
  return formatResponse(true, {
    reportName: "Appointment Trends",
    period: `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
    data: formattedData,
  }, "Appointment trends report generated successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getAppointmentTrends);
