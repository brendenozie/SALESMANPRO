// app/api/admin/[adminSlug]/attendees/route.ts
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

  const eventIdFilter = searchParams.get("eventId");
  const searchKeyword = searchParams.get("search");
  const statusFilter = searchParams.get("status"); // 'checkedIn' or 'notCheckedIn'
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "registeredAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const validSortBy = ["registeredAt", "status", "user.name", "event.title"];
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

    const whereClause: any = {
      companyId: company.id,
    };

    if (eventIdFilter) {
      whereClause.eventId = eventIdFilter;
    }

    if (searchKeyword) {
      whereClause.OR = [
        { user: { name: { contains: searchKeyword, mode: 'insensitive' } } },
        { user: { email: { contains: searchKeyword, mode: 'insensitive' } } },
      ];
    }

    if (statusFilter) {
      if (statusFilter === 'checkedIn') {
        whereClause.status = "ATTENDED";
      } else if (statusFilter === 'notCheckedIn') {
        whereClause.status = "REGISTERED"; // Assuming 'REGISTERED' means not yet attended
      }
    }

    const [attendees, totalItems] = await prisma.$transaction([
      prisma.eventRegistration.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { title: true } },
          // Assuming ticketType would be derived from orderItem or marketplaceListing
          // For now, we'll mock it or fetch separately
        },
      }),
      prisma.eventRegistration.count({ where: whereClause }),
    ]);

    const formattedAttendees = attendees.map(reg => ({
      id: reg.id,
      name: reg.user?.name || 'N/A',
      email: reg.user?.email || 'N/A',
      event: reg.event?.title || 'N/A',
      ticketType: "General Admission", // Mocking, needs actual lookup from OrderItem/Product
      checkedIn: reg.status === "ATTENDED",
      registeredAt: reg.registeredAt,
      status: reg.status,
    }));

    // Handle CSV export if requested
    if (searchParams.get("export") === "csv") {
      const headers = ['ID', 'Name', 'Email', 'Event', 'Ticket Type', 'Status', 'Registered At'];
      const rows = formattedAttendees.map(att => [
        att.id,
        att.name,
        att.email,
        att.event,
        att.ticketType,
        att.status,
        att.registeredAt.toISOString()
      ]);
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="attendees.csv"',
        },
      });
    }


    return NextResponse.json({
      attendees: formattedAttendees,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}