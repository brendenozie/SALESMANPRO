import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


type HandlerContext = {
  params: {
    adminSlug: string;
    eventId: string;
  };
  user?: any;
};


async function handleGet(req: Request, context: HandlerContext) {
  const { adminSlug, eventId } = context.params;
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");

  
  const where: any = {
    eventId,
    event: {
      company: { slug: adminSlug },
    },
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      {
        user: {
          name: { contains: search, mode: "insensitive" },
        },
      },
      {
        user: {
          email: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  
  
    const cacheKey = `admin:check-in-attendees:${adminSlug || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const attendees = await prisma.eventRegistration.findMany({
    where,
    orderBy: {
      user: { name: "asc" },
    },
    select: {
      id: true,
      status: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  try {
    if (attendees) {
      await cacheSet(cacheKey, attendees, 60);
    }
  } catch (e) {}

  
  const formatted = attendees.map(reg => ({
    id: reg.id,
    name: reg.user?.name ?? "N/A",
    email: reg.user?.email ?? "N/A",
    ticketType: "General Admission", // extend later
    checkedIn: reg.status === "ATTENDED",
    status: reg.status,
  }));

  return NextResponse.json(formatted, { status: 200 });
}


export const GET = withApiHandler(handleGet, {
  requireAuth: true,
  requireRateLimit: true,
});

// import { NextResponse } from "next/server";
//  {
//   const { adminSlug, eventId } = context.params;
//   const { searchParams } = new URL(request.url);
  
//   const search = searchParams.get("search");
//   const statusFilter = searchParams.get("status");

//   // OPTIMIZATION: Combine company check and registration fetch into ONE query
//   const attendees = await prisma.eventRegistration.findMany({
//     where: {
//       eventId: eventId,
//       company: { slug: adminSlug }, // Deep relation security check
//       ...(statusFilter && { status: statusFilter }),
//       ...(search && {
//         OR: [
//           { user: { name: { contains: search, mode: 'insensitive' } } },
//           { user: { email: { contains: search, mode: 'insensitive' } } },
//         ],
//       }),
//     },
//     select: {
//       id: true,
//       status: true,
//       user: {
//         select: {
//           name: true,
//           email: true
//         }
//       }
//       // If you have a specific ticket type relation, select it here
//       // marketplaceListing: { select: { title: true } }
//     },
//     orderBy: { 
//       user: { name: 'asc' } 
//     }
//   });

//   // If the query returns empty, it might be an empty event or a wrong slug.
//   // To be precise, we check if any attendees exist or handle as an empty list.
//   const formatted = attendees.map(reg => ({
//     id: reg.id,
//     name: reg.user?.name ?? 'N/A',
//     email: reg.user?.email ?? 'N/A',
//     ticketType: "General Admission",
//     checkedIn: reg.status === "ATTENDED",
//     status: reg.status,
//   }));

//   return formatResponse(true, formatted);
// }

// export const GET = withApiHandler(handleGet);
// import { NextResponse } from "next/server";


//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const whereClause: any = {
//     eventId: eventId,
//     companyId: company.id,
//   };

//   if (searchKeyword) {
//     whereClause.OR = [
//       { user: { name: { contains: searchKeyword, mode: 'insensitive' } } },
//       { user: { email: { contains: searchKeyword, mode: 'insensitive' } } },
//     ];
//   }

//   if (statusFilter) {
//     whereClause.status = statusFilter;
//   }

//   const attendees = await prisma.eventRegistration.findMany({
//     where: whereClause,
//     include: {
//       user: { select: { id: true, name: true, email: true } },
//     },
//     orderBy: { user: { name: 'asc' } }
//   });

//   const formattedAttendees = attendees.map(reg => ({
//     id: reg.id,
//     name: reg.user?.name || 'N/A',
//     email: reg.user?.email || 'N/A',
//     ticketType: "General Admission",
//     checkedIn: reg.status === "ATTENDED",
//     status: reg.status,
//   }));

//   return NextResponse.json(formattedAttendees, { status: 200 });
// }

// // --- Exported Route Handler (Wrapped) ---

// 
// export const GET = withApiHandler(handleGet);
