import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function handleGet(request: Request, context: { params: { adminSlug: string, registrationId: string } }) {
  const { adminSlug, registrationId } = context.params;

  const cacheKey = `admin:attendee:${adminSlug || 'global'}:${registrationId}`;
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  // OPTIMIZATION: Combine company verification and registration fetch into ONE query
  const registration = await prisma.eventRegistration.findFirst({
    where: { 
      id: registrationId,
      company: { slug: adminSlug } // Deep relation filter
    },
    select: {
      id: true,
      eventId: true,
      userId: true,
      registeredAt: true,
      status: true,
      user: { 
        select: { id: true, name: true, email: true } 
      },
      event: { 
        select: { title: true } 
      },
      // If ticketType is a relation, add it here:
      // ticket: { select: { type: true } }
    },
  });

  if (!registration) {
    return formatResponse(false, null, "Attendee registration not found in this company scope", 404);
  }

  try {
    await cacheSet(cacheKey, registration, 60);
  }
  catch (e) {}
  
  // Formatting the response
  const responseData = {
    id: registration.id,
    eventId: registration.eventId,
    userId: registration.userId,
    name: registration.user?.name || 'N/A',
    email: registration.user?.email || 'N/A',
    eventTitle: registration.event?.title || 'N/A',
    ticketType: "General Admission", // Placeholder logic
    registeredAt: registration.registeredAt,
    status: registration.status,
  };

  return formatResponse(true, responseData, "Attendee details fetched successfully", 200);
}

export const GET = withApiHandler(handleGet);
// import { NextResponse } from "next/server";


//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const registration = await prisma.eventRegistration.findUnique({
//     where: { id: registrationId, companyId: company.id },
//     include: {
//       user: { select: { id: true, name: true, email: true } },
//       event: { select: { title: true } },
//     },
//   });

//   if (!registration) {
//     return NextResponse.json({ message: "Attendee registration not found" }, { status: 404 });
//   }

//   // If a ticketType field exists on your model, you would fetch it here.
//   // This line remains as a placeholder for that future logic.
//   const ticketType = "General Admission"; 

//   return NextResponse.json({
//     id: registration.id,
//     eventId: registration.eventId,
//     userId: registration.userId,
//     name: registration.user?.name || 'N/A',
//     email: registration.user?.email || 'N/A',
//     eventTitle: registration.event?.title || 'N/A',
//     ticketType,
//     registeredAt: registration.registeredAt,
//     status: registration.status,
//   }, { status: 200 });
// }

// // --- Exported Route Handler (Wrapped) ---

// 
// export const GET = withApiHandler(handleGet);
