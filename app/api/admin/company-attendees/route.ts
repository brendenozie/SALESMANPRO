import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function handleGet(request: Request, context: { params: { adminSlug: string } }) {
  const { adminSlug } = context.params;
  const { searchParams } = new URL(request.url);

  // 1. Unified Parameter Parsing
  const isExport = searchParams.get("export") === "csv";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = isExport ? 1000 : Math.min(100, parseInt(searchParams.get("limit") || "10"));
  const search = searchParams.get("search");
  const statusFilter = searchParams.get("status");
  const eventId = searchParams.get("eventId");

  // 2. Dynamic Sort Builder (Fixes the "user.name" issue)
  const sortBy = searchParams.get("sortBy") || "registeredAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as 'asc' | 'desc';
  
  const orderBy: any = {};
  if (sortBy === "user.name") orderBy.user = { name: sortOrder };
  else if (sortBy === "event.title") orderBy.event = { title: sortOrder };
  else orderBy[sortBy] = sortOrder;

  // 3. Consolidated Where Clause
  const where: any = {
    company: { slug: adminSlug }, // Atomic Security Check
    ...(eventId && { eventId }),
    ...(statusFilter === 'checkedIn' && { status: "ATTENDED" }),
    ...(statusFilter === 'notCheckedIn' && { status: "REGISTERED" }),
    ...(search && {
      OR: [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  try {
    // 4. Parallelize Data and Total Count
    
    const cacheKey = buildTenantCacheKey(adminSlug, "company-attendees", { limit, page, search, sortBy, sortOrder });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [attendees, totalItems] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        orderBy,
        skip: isExport ? 0 : (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          status: true,
          registeredAt: true,
          user: { select: { name: true, email: true } },
          event: { select: { title: true } },
        },
      }),
      prisma.eventRegistration.count({ where }),
    ]);

    const formatted = attendees.map(reg => ({
      id: reg.id,
      name: reg.user?.name || 'N/A',
      email: reg.user?.email || 'N/A',
      event: reg.event?.title || 'N/A',
      checkedIn: reg.status === "ATTENDED",
      registeredAt: reg.registeredAt,
      status: reg.status,
    }));

    // 5. Optimized CSV Streaming
    if (isExport) {
      const headers = "ID,Name,Email,Event,Status,RegisteredAt\n";
      const rows = formatted.map(a => 
        `"${a.id}","${a.name}","${a.email}","${a.event}","${a.status}","${a.registeredAt.toISOString()}"`
      ).join("\n");

      return new NextResponse(headers + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="attendees-${adminSlug}.csv"`,
        },
      });
    }

    // Cache the result for 1 minute
    try {
      await cacheSet(cacheKey, {
        attendees: formatted,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      }, 60);
    } catch (e) {}
    
    return NextResponse.json({
      attendees: formatted,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });

  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}

export const GET = withApiHandler(handleGet);
// import { NextResponse } from "next/server";

//   }

//   const validSortOrder = ["asc", "desc"];
//   if (!validSortOrder.includes(sortOrder)) {
//     return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
//   }

//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const whereClause: any = {
//     companyId: company.id,
//   };

//   if (eventIdFilter) {
//     whereClause.eventId = eventIdFilter;
//   }

//   if (searchKeyword) {
//     whereClause.OR = [
//       { user: { name: { contains: searchKeyword, mode: 'insensitive' } } },
//       { user: { email: { contains: searchKeyword, mode: 'insensitive' } } },
//     ];
//   }

//   if (statusFilter) {
//     if (statusFilter === 'checkedIn') {
//       whereClause.status = "ATTENDED";
//     } else if (statusFilter === 'notCheckedIn') {
//       whereClause.status = "REGISTERED";
//     }
//   }

//   const [attendees, totalItems] = await prisma.$transaction([
//     prisma.eventRegistration.findMany({
//       where: whereClause,
//       orderBy: { [sortBy]: sortOrder },
//       skip: (page - 1) * limit,
//       take: limit,
//       include: {
//         user: { select: { id: true, name: true, email: true } },
//         event: { select: { title: true } },
//       },
//     }),
//     prisma.eventRegistration.count({ where: whereClause }),
//   ]);

//   const formattedAttendees = attendees.map(reg => ({
//     id: reg.id,
//     name: reg.user?.name || 'N/A',
//     email: reg.user?.email || 'N/A',
//     event: reg.event?.title || 'N/A',
//     ticketType: "General Admission",
//     checkedIn: reg.status === "ATTENDED",
//     registeredAt: reg.registeredAt,
//     status: reg.status,
//   }));

//   // Handle CSV export if requested
//   if (searchParams.get("export") === "csv") {
//     const headers = ['ID', 'Name', 'Email', 'Event', 'Ticket Type', 'Status', 'Registered At'];
//     const rows = formattedAttendees.map(att => [
//       att.id,
//       att.name,
//       att.email,
//       att.event,
//       att.ticketType,
//       att.status,
//       att.registeredAt.toISOString()
//     ]);
//     const csvContent = [
//       headers.join(','),
//       ...rows.map(row => row.map(cell => `"${cell}"`).join(',')) // Quote cells to handle commas in data
//     ].join('\n');

//     return new NextResponse(csvContent, {
//       status: 200,
//       headers: {
//         'Content-Type': 'text/csv',
//         'Content-Disposition': 'attachment; filename="attendees.csv"',
//       },
//     });
//   }

//   return NextResponse.json({
//     attendees: formattedAttendees,
//     totalItems,
//     totalPages: Math.ceil(totalItems / limit),
//     currentPage: page,
//   }, { status: 200 });
// }

// // --- Exported Route Handler (Wrapped) ---

// 
// export const GET = withApiHandler(handleGet);
