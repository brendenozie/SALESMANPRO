import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper for authorization and basic data fetching shared by both GET and POST
async function getCompanyAndUserIds(adminSlug: string) {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return formatResponse(false, null, "Company not found.", 404);
    }

    const companyUserIds = (await prisma.user.findMany({
      where: { Company: { some: { id: company.id } } },
      select: { id: true }
    })).map(u => u.id);

    return { company, companyUserIds };
}

/**
 * GET Handler: Fetches a list of appointments with filtering, searching, sorting, and pagination.
 */
async function getAppointments(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  // NOTE: Authentication and try/catch are handled by withApiHandler.

  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  // --- Authorization & Pre-Check ---
  const authResult = await getCompanyAndUserIds(adminSlug);
  if (authResult.success === false) return authResult; // Returns 404 if company not found

  const { companyUserIds } = authResult;

  // --- Parameter Parsing & Validation ---
  const filterStatus = searchParams.get("status");
  const searchKeyword = searchParams.get("search");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "date";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
    return formatResponse(false, null, "Pagination parameters 'page' and 'limit' must be positive integers.", 400);
  }

  const validSortBy = ["date", "status", "createdAt"];
  if (!validSortBy.includes(sortBy)) {
    return formatResponse(false, null, "Invalid sortBy parameter.", 400);
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return formatResponse(false, null, "Invalid sortOrder parameter.", 400);
  }

  // --- Where Clause Construction ---
  const whereClause: any = {
    userId: { in: companyUserIds },
  };

  if (filterStatus && filterStatus !== 'All') {
    whereClause.status = filterStatus;
  }

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) {
      whereClause.date.gte = new Date(startDate);
    }
    if (endDate) {
      // Ensure the end date includes the entire day
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      whereClause.date.lt = endOfDay;
    }
  }

  if (searchKeyword) {
    whereClause.OR = [
      { user: { name: { contains: searchKeyword, mode: 'insensitive' } } },
      { user: { email: { contains: searchKeyword, mode: 'insensitive' } } },
      { OrderItem: { some: { marketplaceListing: { name: { contains: searchKeyword, mode: 'insensitive' } } } } },
    ];
  }

  // --- Data Fetching ---
  const skip = (page - 1) * limit;

  const [totalItems, appointments] = await prisma.$transaction([
    prisma.appointment.count({ where: whereClause }),
    prisma.appointment.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: skip,
      take: limit,
      select: {
        id: true,
        date: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
        OrderItem: {
          select: { marketplaceListing: { select: { name: true } } },
          take: 1
        }
      },
    }),
  ]);

  // --- Data Formatting ---
  const formattedAppointments = appointments.map(appt => ({
    id: appt.id,
    patientName: appt.user?.name || 'N/A',
    doctorName: 'N/A', // Placeholder
    date: new Date(appt.date).toISOString().split('T')[0],
    time: new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: appt.status,
    service: appt.OrderItem[0]?.marketplaceListing?.name || 'N/A Service',
  }));

  // --- Success Response ---
  return formatResponse(true, {
    appointments: formattedAppointments,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  }, 'Appointments list fetched successfully', 200);
}


/**
 * POST Handler: Creates a new appointment.
 */
async function createAppointment(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const { userId, date, time, serviceId, status = "PENDING", notes } = body;

  // --- Input Validation ---
  if (!userId || !date || !serviceId) {
    return formatResponse(false, null, "Missing required fields: userId, date, serviceId", 400);
  }

  // --- Authorization & Verification ---
  const authResult = await getCompanyAndUserIds(adminSlug);
  if (authResult.success === false) return authResult; // Returns 404 if company not found

  const { company } = authResult;

  // Verify userId exists and belongs to the company
  const patientUser = await prisma.user.findUnique({
    where: { id: userId, Company: { some: { id: company.id } } },
    select: { id: true }
  });
  if (!patientUser) {
    return formatResponse(false, null, "Patient not found or not associated with this company", 404);
  }

  // Verify serviceId exists
  const serviceListing = await prisma.marketplaceListings.findUnique({
    where: { id: serviceId, companyId: company.id },
    select: { id: true, name: true, sellingPrice: true }
  });
  if (!serviceListing) {
    return formatResponse(false, null, "Service not found or not associated with this company", 404);
  }

  // --- Creation Logic ---
  const appointmentDateTime = new Date(`${date}T${time || '00:00:00'}`);

  const newAppointment = await prisma.appointment.create({
    data: {
      userId: patientUser.id,
      date: appointmentDateTime,
      status,
      // If you have a doctorId, link it here
      OrderItem: {
        create: {
          marketplaceListingId: serviceListing.id,
          quantity: 1,
          price: serviceListing.sellingPrice,
          status: "PENDING",
          date: date,
          timeSlot: time,
        }
      },
    },
  });

  // --- Success Response ---
  return formatResponse(true, { message: "Appointment created successfully", appointment: newAppointment }, "Appointment created successfully", 201);
}


// Wrap and export handlers
export const GET = withApiHandler(getAppointments);
export const POST = withApiHandler(createAppointment);
