import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";


type HandlerContext = {
  params: { adminSlug: string };
  user?: any;
};

const VALID_SORT_FIELDS = ["startDateTime", "title", "eventStatus"] as const;
const VALID_SORT_ORDER = ["asc", "desc"] as const;


async function handleGet(req: Request, context: HandlerContext) {
  const { adminSlug } = context.params;
  const { searchParams } = new URL(req.url);

  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
  const sortBy = (searchParams.get("sortBy") ?? "startDateTime") as typeof VALID_SORT_FIELDS[number];
  const sortOrder = (searchParams.get("sortOrder") ?? "asc") as typeof VALID_SORT_ORDER[number];

  if (!VALID_SORT_FIELDS.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  if (!VALID_SORT_ORDER.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  
  const where: any = {
    company: { slug: adminSlug },
  };

  if (status) {
    where.eventStatus = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  
  
    const cacheKey = `admin:company-events:${slug || adminSlug || 'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [events, totalItems] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        startDateTime: true,
        endDateTime: true,
        location: true,
        eventStatus: true,
      },
    }),
    prisma.event.count({ where }),
  ]);

  try {
    if (events) {
      await cacheSet(cacheKey, events, 60);
    }
  } catch (e) {}

  const formattedEvents = events.map(event => ({
    ...event,
    date: event.startDateTime.toISOString(),
    ticketsSold: null, // ready for aggregation later
  }));

  return NextResponse.json(
    {
      events: formattedEvents,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
    { status: 200 }
  );
}


async function handlePost(req: Request, context: HandlerContext) {
  const { adminSlug } = context.params;
  const body = await req.json();

  const {
    title,
    summary,
    description,
    startDateTime,
    endDateTime,
    location,
    onlineMeetingLink,
    imageUrl,
    videoUrl,
    eventType,
    eventStatus,
    organizerId,
    isRegistrationRequired,
    maxCapacity,
    isPaid,
    price,
    contactPerson,
    contactEmail,
    contactPhone,
    audience,
    targetAcademicLevelIds,
    targetCourseIds,
    targetEducatorIds,
    targetStudentIds,
    targetDepartmentIds,
    targetParentIds,
  } = body;

  if (!title || !startDateTime || !location || !eventType || !eventStatus || !organizerId) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  
  const [organizer, company] = await Promise.all([
    prisma.user.findUnique({
      where: { id: organizerId },
      select: { id: true, role: true },
    }),
    prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    }),
  ]);

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  if (!organizer || !organizer.role ||!["ADMIN", "EDUCATOR"].includes(organizer.role)) {
    return NextResponse.json(
      { message: "Invalid organizer or insufficient permissions" },
      { status: 403 }
    );
  }

  const event = await prisma.event.create({
    data: {
      companyId: company.id,
      title,
      summary,
      description,
      startDateTime: new Date(startDateTime),
      endDateTime: endDateTime ? new Date(endDateTime) : null,
      location,
      onlineMeetingLink,
      imageUrl,
      videoUrl,
      eventType,
      eventStatus,
      organizerId,
      isRegistrationRequired,
      maxCapacity,
      isPaid,
      price,
      contactPerson,
      contactEmail,
      contactPhone,
      audience,
      targetAcademicLevelIds,
      targetCourseIds,
      targetEducatorIds,
      targetStudentIds,
      targetDepartmentIds,
      targetParentIds,
    },
    select: {
      id: true,
      title: true,
      startDateTime: true,
      eventStatus: true,
    },
  });

  return NextResponse.json(
    { message: "Event created successfully", event },
    { status: 201 }
  );
}


export const GET = withApiHandler(handleGet, {
  requireAuth: true,
  requireRateLimit: true,
});

export const POST = withApiHandler(handlePost, {
  requireAuth: true,
  requireRateLimit: true,
});

// import { NextResponse } from "next/server";
 {
//   const { adminSlug } = context.params;
//   const { searchParams } = new URL(request.url);

//   const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
//   const limit = Math.min(100, parseInt(searchParams.get("limit") || "10"));
//   const skip = (page - 1) * limit;
  
//   const search = searchParams.get("search");
//   const status = searchParams.get("status");
//   const sortBy = searchParams.get("sortBy") || "startDateTime";
//   const sortOrder = searchParams.get("sortOrder") || "asc";

//   const where = {
//     company: { slug: adminSlug },
//     ...(status && { eventStatus: status }),
//     ...(search && {
//       OR: [
//         { title: { contains: search, mode: 'insensitive' } },
//         { location: { contains: search, mode: 'insensitive' } },
//       ],
//     }),
//   };

//   // OPTIMIZATION: Concurrent data fetching and real counts
//   const [events, totalItems] = await Promise.all([
//     prisma.event.findMany({
//       where,
//       orderBy: { [sortBy]: sortOrder },
//       skip,
//       take: limit,
//       select: {
//         id: true,
//         title: true,
//         startDateTime: true,
//         endDateTime: true,
//         location: true,
//         eventStatus: true,
//         _count: { select: { eventRegistrations: true } } // Actual data, not mocked
//       },
//     }),
//     prisma.event.count({ where }),
//   ]);

//   return NextResponse.json({
//     events: events.map(e => ({
//       ...e,
//       ticketsSold: e._count.eventRegistrations,
//     })),
//     totalItems,
//     totalPages: Math.ceil(totalItems / limit),
//     currentPage: page,
//   });
// }

// 
// async function handlePost(request: Request, context: { params: { adminSlug: string } }) {
//   const { adminSlug } = context.params;
//   const body = await request.json();

//   // 1. Basic Validation
//   if (!body.title || !body.startDateTime || !body.organizerId) {
//     return formatResponse(false, null, "Missing required fields", 400);
//   }

//   try {
//     // 2. ATOMIC CREATE: Connect company by slug and check organizer in one go
//     // (Note: This assumes organizerId exists; we can use connect for that too)
//     const newEvent = await prisma.event.create({
//       data: {
//         ...body,
//         startDateTime: new Date(body.startDateTime),
//         endDateTime: body.endDateTime ? new Date(body.endDateTime) : null,
//         company: { connect: { slug: adminSlug } },
//         organizer: { connect: { id: body.organizerId } }
//       },
//     });

//     return formatResponse(true, newEvent, "Event created successfully", 201);
//   } catch (error: any) {
//     // Handle Case: Company slug not found or organizerId not found
//     if (error.code === 'P2025') {
//       return formatResponse(false, null, "Invalid company slug or organizer ID", 404);
//     }
//     throw error;
//   }
// }

// export const GET = withApiHandler(handleGet);
// export const POST = withApiHandler(handlePost);
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

//   if (statusFilter) {
//     whereClause.eventStatus = statusFilter;
//   }

//   if (searchKeyword) {
//     whereClause.OR = [
//       { title: { contains: searchKeyword, mode: 'insensitive' } },
//       { description: { contains: searchKeyword, mode: 'insensitive' } },
//       { location: { contains: searchKeyword, mode: 'insensitive' } },
//     ];
//   }

//   const [events, totalItems] = await prisma.$transaction([
//     prisma.event.findMany({
//       where: whereClause,
//       orderBy: { [sortBy]: sortOrder },
//       skip: (page - 1) * limit,
//       take: limit,
//       select: {
//         id: true,
//         title: true,
//         startDateTime: true,
//         endDateTime: true,
//         location: true,
//         eventStatus: true,
//       },
//     }),
//     prisma.event.count({ where: whereClause }),
//   ]);

//   const formattedEvents = events.map(event => ({
//     ...event,
//     date: new Date(event.startDateTime).toLocaleDateString(),
//     ticketsSold: Math.floor(Math.random() * 2000)
//   }));

//   return NextResponse.json({
//     events: formattedEvents,
//     totalItems,
//     totalPages: Math.ceil(totalItems / limit),
//     currentPage: page,
//   }, { status: 200 });
// }

// // --- Core Logic for POST request ---

// async function handlePost(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { adminSlug } = context.params;
//   const body = await request.json();

//   const {
//     title, summary, description, startDateTime, endDateTime,
//     location, onlineMeetingLink, imageUrl, videoUrl, eventType,
//     eventStatus, organizerId, isRegistrationRequired, maxCapacity,
//     isPaid, price, contactPerson, contactEmail, contactPhone, audience,
//     targetAcademicLevelIds, targetCourseIds, targetEducatorIds,
//     targetStudentIds, targetDepartmentIds, targetParentIds
//   } = body;

//   if (!title || !startDateTime || !location || !eventType || !eventStatus || !organizerId) {
//     return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
//   }

//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const organizer = await prisma.user.findUnique({
//     where: { id: organizerId },
//     select: { id: true, role: true }
//   });

//   if (!organizer || (organizer.role !== "ADMIN" && organizer.role !== "EDUCATOR")) {
//     return NextResponse.json({ message: "Invalid organizer ID or insufficient permissions" }, { status: 403 });
//   }

//   const newEvent = await prisma.event.create({
//     data: {
//       companyId: company.id,
//       title,
//       summary,
//       description,
//       startDateTime: new Date(startDateTime),
//       endDateTime: endDateTime ? new Date(endDateTime) : null,
//       location,
//       onlineMeetingLink,
//       imageUrl,
//       videoUrl,
//       eventType,
//       eventStatus,
//       organizerId,
//       isRegistrationRequired,
//       maxCapacity,
//       isPaid,
//       price,
//       contactPerson,
//       contactEmail,
//       contactPhone,
//       audience,
//       targetAcademicLevelIds,
//       targetCourseIds,
//       targetEducatorIds,
//       targetStudentIds,
//       targetDepartmentIds,
//       targetParentIds,
//     },
//   });

//   return NextResponse.json(
//     { message: "Event created successfully", event: newEvent },
//     { status: 201 }
//   );
// }

// // --- Exported Route Handlers (Wrapped) ---

// 
// export const GET = withApiHandler(handleGet);

// 
// export const POST = withApiHandler(handlePost);
