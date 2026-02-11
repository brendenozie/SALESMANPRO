import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// --------------------
// Formatter (sync)
// --------------------
function formatAppointmentData(appointment: any) {
  const patientName = appointment.user?.name ?? "N/A";
  const doctorName = appointment.doctor?.User?.name ?? "N/A";

  const dateObj = new Date(appointment.date);

  return {
    id: appointment.id,
    patientName,
    doctorId: appointment.doctorId,
    doctorName,
    date: dateObj.toISOString().split("T")[0],
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    status: appointment.status,
    service: appointment.service ?? "N/A",
    createdAt: appointment.createdAt
      ? new Date(appointment.createdAt).toLocaleDateString()
      : "N/A",
  };
}

const baseSelect = {
  id: true,
  doctorId: true,
  date: true,
  status: true,
  service: true,
  createdAt: true,
  user: { select: { name: true, email: true } },
  doctor: { select: { User: { select: { name: true } } } },
};

// --------------------
// GET /api/admin/appointments
// OPTIMIZATIONS:
// 1. Cache-First: Checks Redis before database
// 2. Selective Fields: Uses select for optimal query
// 3. Edge Caching: Includes Cache-Control headers
// 4. Pagination: Built-in with meta information
// --------------------
export const GET = withApiHandler(async (request, context) => {
  const { user } = context;
  if (!user) return formatResponse(false, "Unauthorized", "error", 401);

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm");
  const filterStatus = searchParams.get("filterStatus");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const skip = (page - 1) * limit;

  if (!companyId) {
    return formatResponse(false, "Missing companyId", "error", 400);
  }

  // STEP 1: Build cache key from all query parameters
  const cacheKey = `admin:appointments:${companyId}:${user.role}:${user.id}:${searchTerm || ""}:${filterStatus || ""}:${page}:${limit}`;
  const CACHE_TTL = 60; // 60 seconds

  // STEP 2: Check cache first
  try {
    const cachedData = await cacheGet<any>(cacheKey);
    if (cachedData) {
      const response = formatResponse(
        true,
        cachedData,
        "appointments",
        200
      );
      response.headers.set(
        "Cache-Control",
        "s-maxage=60, stale-while-revalidate=30"
      );
      return response;
    }
  } catch (cacheError) {
    console.error("Cache read error:", cacheError);
    // Continue to database query if cache fails
  }

  // STEP 3: Cache miss - query database
  const where: any = { companyId };

  if (user.role !== "ADMIN") {
    where.doctorId = user.id;
  }

  if (filterStatus && filterStatus !== "All") {
    where.status = filterStatus;
  }

  if (searchTerm) {
    where.OR = [
      { user: { name: { contains: searchTerm, mode: "insensitive" } } },
      { doctor: { User: { name: { contains: searchTerm, mode: "insensitive" } } } },
      { service: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      select: baseSelect,
      orderBy: { date: "asc" },
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  const formatted = appointments.map(formatAppointmentData);

  const responseData = {
    data: formatted,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };

  // STEP 4: Update cache
  try {
    await cacheSet(cacheKey, responseData, CACHE_TTL);
  } catch (cacheError) {
    console.error("Cache write error:", cacheError);
    // Continue even if cache update fails
  }

  // STEP 5: Return response with edge caching headers
  const response = formatResponse(
    true,
    responseData,
    "appointments",
    200
  );
  response.headers.set(
    "Cache-Control",
    "s-maxage=60, stale-while-revalidate=30"
  );
  return response;
});

// --------------------
// POST /api/admin/appointments
// OPTIMIZATIONS:
// 1. Atomic Operations: Try/catch with Prisma create
// 2. Cache Invalidation: Clears related caches
// 3. Input Validation: Validates all required fields
// --------------------
export const POST = withApiHandler(async (request, context) => {
  const { user } = context;
  if (!user) return formatResponse(false, "Unauthorized", "error", 401);

  try {
    const body = await request.json();
    const { userId, doctorId, service, date, time, status, companyId } = body;

    if (!userId || !doctorId || !date || !time || !status || !companyId) {
      return formatResponse(
        false,
        "Missing required fields: userId, doctorId, date, time, status, companyId",
        "error",
        400
      );
    }

    if (user.role !== "ADMIN" && doctorId !== user.id) {
      return formatResponse(false, "You cannot create appointments for another doctor", "error", 403);
    }

    const appointmentDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(appointmentDateTime.getTime())) {
      return formatResponse(false, "Invalid date or time", "error", 400);
    }

    const created = await prisma.appointment.create({
      data: {
        userId,
        doctorId,
        service,
        date: appointmentDateTime,
        status,
        companyId,
      },
      select: baseSelect,
    });

    // STEP: Invalidate all appointments caches for this company
    try {
      await cacheDel(`admin:appointments:${companyId}:*`);
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError);
      // Continue even if cache invalidation fails
    }

    return formatResponse(true, formatAppointmentData(created), "appointment", 201);
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    
    // Enhanced error handling for specific Prisma errors
    if (error.code === "P2002") {
      return formatResponse(
        false,
        "An appointment with these details already exists",
        "error",
        409
      );
    }
    
    if (error.code === "P2003") {
      return formatResponse(
        false,
        "Invalid userId, doctorId, or companyId",
        "error",
        400
      );
    }
    
    return formatResponse(false, "Failed to create appointment", "error", 500);
  }
});
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // OPTIMIZATION: Removed 'async'. This is now a pure, lightning-fast sync function.
// function mapAppointment(appt: any) {
//   const dateObj = new Date(appt.date);
//   return {
//     id: appt.id,
//     patientName: appt.user?.name ?? "N/A",
//     doctorId: appt.doctorId,
//     doctorName: appt.doctor?.User?.name ?? "N/A",
//     date: dateObj.toISOString().split("T")[0],
//     time: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
//     status: appt.status,
//     service: appt.service ?? "N/A",
//     createdAt: appt.createdAt ? new Date(appt.createdAt).toLocaleDateString() : "N/A",
//   };
// }

// export const GET = withApiHandler(async (request, context) => {
//   const { user } = context;
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get("companyId");
//   const searchTerm = searchParams.get("searchTerm") || "";
//   const filterStatus = searchParams.get("filterStatus");

//   if (!companyId) return formatResponse(false, "Missing companyId", 'error', 400);

//   // OPTIMIZATION: Database-level filtering
//   const whereClause: any = { 
//     companyId,
//     ...(user?.role !== "ADMIN" ? { doctorId: user.id } : {}),
//     ...(filterStatus && filterStatus !== "All" ? { status: filterStatus } : {}),
//   };

//   // Move search logic into the SQL query
//   if (searchTerm) {
//     whereClause.OR = [
//       { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
//       { doctor: { User: { name: { contains: searchTerm, mode: 'insensitive' } } } },
//       { service: { contains: searchTerm, mode: 'insensitive' } },
//     ];
//   }

//   const appointments = await prisma.appointment.findMany({
//     where: whereClause,
//     select: {
//       id: true, date: true, status: true, service: true, createdAt: true, doctorId: true,
//       user: { select: { name: true } },
//       doctor: { select: { User: { select: { name: true } } } },
//     },
//     orderBy: { date: "asc" },
//     take: 50, // Added safety limit for list fetching
//   });

//   return formatResponse(true, appointments.map(mapAppointment), 'appointments', 200);
// });

// export const POST = withApiHandler(async (request, context) => {
//   const { user } = context;
//   const body = await request.json();
//   const { userId, doctorId, service, date, time, status, companyId } = body;

//   if (!userId || !doctorId || !date || !time || !status || !companyId) {
//     return formatResponse(false, "Missing required fields", 'error', 400);
//   }

//   // Security Check
//   if (user?.role !== "ADMIN" && doctorId !== user.id) {
//     return formatResponse(false, "Forbidden", 'error', 403);
//   }

//   // OPTIMIZATION: Atomic Create with selective return
//   const newAppointment = await prisma.appointment.create({
//     data: {
//       userId,
//       doctorId,
//       service,
//       companyId,
//       date: new Date(`${date}T${time}:00`),
//       status,
//     },
//     select: {
//       id: true, date: true, status: true, service: true, createdAt: true, doctorId: true,
//       user: { select: { name: true } },
//       doctor: { select: { User: { select: { name: true } } } },
//     }
//   });

//   return formatResponse(true, mapAppointment(newAppointment), 'appointment', 201);
// });
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // Shared formatter
// async function formatAppointmentData(appointment: any) {
//   const patientName = appointment.user?.name || "N/A";
//   const doctorName = appointment.doctor?.User?.name || "N/A";
//   const dateObj = new Date(appointment.date);

//   const formattedDate = dateObj.toISOString().split("T")[0];
//   const formattedTime = dateObj.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return  {
//             id: appointment.id,
//             patientName,
//             doctorId: appointment.doctorId,
//             doctorName,
//             date: formattedDate,
//             time: formattedTime,
//             status: appointment.status,
//             service: appointment.service || "N/A",
//             createdAt: appointment.createdAt
//               ? new Date(appointment.createdAt).toLocaleDateString()
//               : "N/A",
//           };
        
// }

// // --- GET /api/admin/appointments
// export const GET = withApiHandler(async (request, context) => {
//   const { user } = context;
//   if (!user) {
//     return formatResponse(false, "Unauthorized", 'error', 401);
//   }

//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get("companyId");
//   const searchTerm = searchParams.get("searchTerm") || "";
//   const filterStatus = searchParams.get("filterStatus"); // 'Scheduled', 'Completed', 'Cancelled', 'All'

//   if (!companyId) {
//     return formatResponse(false, "Missing companyId", 'error', 400);
//   }

//   const whereClause: any = { companyId };

//   // Doctors can only see their own appointments
//   if (user?.role !== "ADMIN") {
//     whereClause.doctorId = user.id;
//   }

//   if (filterStatus && filterStatus !== "All") {
//     whereClause.status = filterStatus;
//   }

//   const appointments = await prisma.appointment.findMany({
//     where: whereClause,
//     include: {
//       user: { select: { name: true, email: true } },
//       doctor: { include: { User: { select: { name: true } } } },
//     },
//     orderBy: { date: "asc" },
//   });

//   // Client-side search filter
//   const filtered = searchTerm
//     ? appointments.filter(
//         (appt) =>
//           appt.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           appt.doctor?.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           appt.service?.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     : appointments;

//   const enrichedAppointments = await Promise.all(
//     filtered.map(async (appt) => formatAppointmentData(appt))
//   );

//   return formatResponse(
//     true,
//     enrichedAppointments,
//     'appointments',
//     200
//   );
//   // return formatResponse(,enrichedAppointments, { status: 200 });
// });

// // --- POST /api/admin/appointments
// export const POST = withApiHandler(async (request, context) => {
//   const { user } = context;
//   if (!user) {
//     return formatResponse(false, "Unauthorized", 'error', 401);
//   }
  
//   const body = await request.json();
//   const { userId, doctorId, service, date, time, status, companyId } = body;

//   if (!userId || !doctorId || !date || !time || !status || !companyId) {
//     return formatResponse(false, "Missing required fields: userId, doctorId, date, time, status, companyId", 'error', 400);
//   }

//   // Doctors can only create their own appointments
//   if (user?.role !== "ADMIN" && doctorId !== user.id) {
//     return formatResponse(false, "You cannot create appointments for another doctor", 'error', 403);
//   }

//   // Combine date and time into one Date object
//   const dateTimeString = `${date}T${time}:00`;
//   const appointmentDateTime = new Date(dateTimeString);

//   const newAppointment = await prisma.appointment.create({
//     data: {
//       user: { connect: { id: userId } },
//       doctor: { connect: { id: doctorId } },
//       service,
//       date: appointmentDateTime,
//       status,
//       company: { connect: { id: companyId } },
//     },
//     include: {
//       user: { select: { name: true, email: true } },
//       doctor: { include: { User: { select: { name: true } } } },
//     },
//   });

//   const formattedNewAppointment = await formatAppointmentData(newAppointment);
//   return formatResponse(true, formattedNewAppointment, 'appointment', 201);
// });
