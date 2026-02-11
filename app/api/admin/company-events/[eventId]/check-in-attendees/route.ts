import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

/* ----------------------------------
   Types
----------------------------------- */
type HandlerContext = {
  params: {
    adminSlug: string;
    eventId: string;
  };
  user?: any;
};

/* ----------------------------------
   GET — Event attendees (check-in)
----------------------------------- */
async function handleGet(req: Request, context: HandlerContext) {
  const { adminSlug, eventId } = context.params;
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");

  /* ----------------------------------
     Single tenant-safe filter
     (no extra company query)
  ----------------------------------- */
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

  /* ----------------------------------
     Query (minimal payload)
  ----------------------------------- */
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

  /* ----------------------------------
     Format response
  ----------------------------------- */
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

/**
 * GET /api/admin/[adminSlug]/events/[eventId]/check-in-attendees
 */
export const GET = withApiHandler(handleGet, {
  requireAuth: true,
  requireRateLimit: true,
});

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// async function handleGet(request: Request, context: { params: { adminSlug: string, eventId: string } }) {
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
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// // --- Type Definitions for the Handler ---

// type RouteParams = {
//   adminSlug: string;
//   eventId: string;
// };

// type HandlerContext = {
//   params: RouteParams;
//   user?: any; // Replace 'any' with your actual User type if defined
// };

// // --- Core Logic for GET request ---
// // This function contains only the business logic.
// // The wrapper handles authentication and the top-level try/catch block.
// async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { adminSlug, eventId } = context.params;
//   const { searchParams } = new URL(request.url);
//   const searchKeyword = searchParams.get("search");
//   const statusFilter = searchParams.get("status");

//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

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

// /**
//  * GET /api/admin/[adminSlug]/events/[eventId]/check-in-attendees
//  * Fetches a list of attendees for a specific event, with search and status filters.
//  */
// export const GET = withApiHandler(handleGet);
