import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { AppointmentStatus } from "@prisma/client"; // Assuming AppointmentStatus enum is available


async function getAppointmentReport(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  const serviceName = searchParams.get("serviceName");
  const status = searchParams.get("status");

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  const whereClause: any = {
    companyId: companyId,
  };

  // Build Where Clause based on search parameters
  if (startDateParam) {
    whereClause.date = { ...whereClause.date, gte: new Date(startDateParam) };
  }
  if (endDateParam) {
    whereClause.date = { ...whereClause.date, lte: new Date(endDateParam) };
  }
  if (doctorId) {
    whereClause.doctorId = doctorId;
  }
  if (patientId) {
    whereClause.userId = patientId;
  }
  if (serviceName) {
    whereClause.service = serviceName;
  }
  if (status && status !== 'All') {
    // Cast status to match Prisma enum type
    whereClause.status = status as AppointmentStatus;
  }

  // 1. Fetch Appointments with related data
  
    const cacheKey = buildTenantCacheKey(companyId, "appointments", { status });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, email: true } }, // Patient
      doctor: { include: { User: { select: { name: true } } } }, // Doctor
      OrderItem: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: { select: { name: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  // 2. Format Appointment Summary
  const appointmentSummary = appointments.map(appt => {
    // Calculate total revenue from associated order items (products used/sold)
    const totalItemsRevenue = appt.OrderItem.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return {
      id: appt.id,
      patientName: appt.user?.name || 'N/A',
      doctorName: appt.doctor?.User?.name || 'N/A',
      service: appt.service || 'N/A',
      date: appt.date ? new Date(appt.date).toISOString().split('T')[0] : 'N/A',
      status: appt.status,
      totalItemsRevenue: totalItemsRevenue,
      itemsUsed: appt.OrderItem.map(item => ({
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
      })),
      createdAt: appt.createdAt ? new Date(appt.createdAt).toLocaleDateString() : 'N/A',
    };
  });

  // 3. Aggregate Counts by Status
  const statusCounts = appointments.reduce((acc, appt) => {
    acc[appt.status] = (acc[appt.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

    try{
      if (appointmentSummary) {
        await cacheSet(cacheKey, {
          summary: appointmentSummary,
          statusCounts,
          totalAppointments: appointments.length,
        }, 60);
      }
    } catch (e) {
      console.error("Error caching appointment report:", e);
    }

  // 4. Return formatted success response
  return formatResponse(true, {
    summary: appointmentSummary,
    statusCounts: statusCounts,
    totalAppointments: appointments.length,
  }, "Appointments report fetched successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getAppointmentReport);
