// app/api/admin/[adminSlug]/appointments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const filterStatus = searchParams.get("status");
  const searchKeyword = searchParams.get("search");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "date";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const validSortBy = ["date", "status", "createdAt"];
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Get all user IDs associated with this company
    const companyUserIds = (await prisma.user.findMany({
      where: {
        Company: { some: { id: company.id } }
      },
      select: { id: true }
    })).map(u => u.id);

    const whereClause: any = {
      userId: { in: companyUserIds }, // Appointments must belong to a user of this company
    };

    if (filterStatus && filterStatus !== 'All') {
      whereClause.status = filterStatus;
    }

    if (startDate) {
      whereClause.date = { ...whereClause.date, gte: new Date(startDate) };
    }
    if (endDate) {
      whereClause.date = { ...whereClause.date, lte: new Date(endDate) };
    }

    if (searchKeyword) {
      whereClause.OR = [
        { user: { name: { contains: searchKeyword, mode: 'insensitive' } } },
        { OrderItem: { some: { marketplaceListing: { name: { contains: searchKeyword, mode: 'insensitive' } } } } }, // Assuming service name is from marketplaceListing
        // You'd need to link doctor to appointment to search by doctor name
      ];
    }

    const [appointments, totalItems] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          date: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
          OrderItem: {
            select: {
              marketplaceListing: { select: { name: true } }
            },
            take: 1 // Assuming one primary service per appointment for display
          }
        },
      }),
      prisma.appointment.count({ where: whereClause }),
    ]);

    const formattedAppointments = appointments.map(appt => ({
      id: appt.id,
      patientName: appt.user?.name || 'N/A',
      // Doctor name needs to be linked through the appointment or OrderItem if it's a service
      doctorName: 'N/A', // Placeholder: Needs proper relation in schema (e.g., appointment.doctorId)
      date: new Date(appt.date).toISOString().split('T')[0],
      time: new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: appt.status,
      service: appt.OrderItem[0]?.marketplaceListing?.name || 'N/A Service',
    }));

    return NextResponse.json({
      appointments: formattedAppointments,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const { userId, date, time, serviceId, status = "PENDING", notes } = body;

  if (!userId || !date || !serviceId) {
    return NextResponse.json({ message: "Missing required fields: userId, date, serviceId" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Combine date and time into a single DateTime object
    const appointmentDateTime = new Date(`${date}T${time || '00:00:00'}`);

    // Verify userId exists and belongs to the company
    const patientUser = await prisma.user.findUnique({
      where: { id: userId, Company: { some: { id: company.id } } },
      select: { id: true }
    });
    if (!patientUser) {
      return NextResponse.json({ message: "Patient not found or not associated with this company" }, { status: 404 });
    }

    // Verify serviceId exists
    const serviceListing = await prisma.marketplaceListings.findUnique({
      where: { id: serviceId, companyId: company.id },
      select: { id: true, name: true, sellingPrice: true }
    });
    if (!serviceListing) {
      return NextResponse.json({ message: "Service not found or not associated with this company" }, { status: 404 });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        userId: patientUser.id,
        date: appointmentDateTime,
        status,
        // If you have a doctorId, link it here
        OrderItem: {
          create: {
            marketplaceListingId: serviceListing.id,
            quantity: 1, // Assuming 1 quantity for a service appointment
            price: serviceListing.sellingPrice,
            status: "PENDING", // OrderItem status for appointment
            date: date, // Store date as string for order item
            timeSlot: time, // Store time as string for order item
          }
        },
        // You might want to add notes field directly to Appointment model
      },
    });

    return NextResponse.json(
      { message: "Appointment created successfully", appointment: newAppointment },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
