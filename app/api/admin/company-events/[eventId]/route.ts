import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";


async function handleGet(request: Request, context: { params: { adminSlug: string, eventId: string } }) {
  const { adminSlug, eventId } = context.params;

  const event = await prisma.event.findFirst({
    where: { 
      id: eventId, 
      company: { slug: adminSlug } 
    },
  });

  if (!event) return formatResponse(false, null, "Event not found", 404);
  return formatResponse(true, event);
}


async function handlePut(request: Request, context: { params: { adminSlug: string, eventId: string } }) {
  const { adminSlug, eventId } = context.params;
  const body = await request.json();

  try {
    const updatedEvent = await prisma.event.update({
      where: { 
        id: eventId,
        company: { slug: adminSlug } 
      },
      data: {
        ...body,
        // Ensure date strings are parsed into Date objects
        startDateTime: body.startDateTime ? new Date(body.startDateTime) : undefined,
        endDateTime: body.endDateTime ? new Date(body.endDateTime) : undefined,
      },
    });

    
    try { await cacheDel(`admin:company-events:${slug || adminSlug || 'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedEvent, "Event updated successfully");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Event not found or unauthorized", 404);
    }
    throw error;
  }
}


async function handleDelete(request: Request, context: { params: { adminSlug: string, eventId: string } }) {
  const { adminSlug, eventId } = context.params;

  try {
    await prisma.event.delete({
      where: { 
        id: eventId,
        company: { slug: adminSlug } 
      },
    });

    
    try { await cacheDel(`admin:company-events:${slug || adminSlug || 'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Event deleted successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Event not found", 404);
    }
    throw error;
  }
}

export const GET = withApiHandler(handleGet);
export const PUT = withApiHandler(handlePut);
export const DELETE = withApiHandler(handleDelete);
// import { NextResponse } from "next/server";


//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const event = await prisma.event.findUnique({
//     where: { id: eventId, companyId: company.id },
//   });

//   if (!event) {
//     return NextResponse.json({ message: "Event not found" }, { status: 404 });
//   }

//   return NextResponse.json(event, { status: 200 });
// }

// // --- Core Logic for PUT request ---

// async function handlePut(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { adminSlug, eventId } = context.params;
//   const body = await request.json();

//   const {
//     title, summary, description, startDateTime, endDateTime,
//     location, onlineMeetingLink, imageUrl, videoUrl, eventType,
//     eventStatus, isRegistrationRequired, maxCapacity,
//     isPaid, price, contactPerson, contactEmail, contactPhone, audience,
//     targetAcademicLevelIds, targetCourseIds, targetEducatorIds,
//     targetStudentIds, targetDepartmentIds, targetParentIds
//   } = body;

//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   try {
//     const updatedEvent = await prisma.event.update({
//       where: { id: eventId, companyId: company.id },
//       data: {
//         title,
//         summary,
//         description,
//         startDateTime: startDateTime ? new Date(startDateTime) : undefined,
//         endDateTime: endDateTime ? new Date(endDateTime) : undefined,
//         location,
//         onlineMeetingLink,
//         imageUrl,
//         videoUrl,
//         eventType,
//         eventStatus,
//         isRegistrationRequired,
//         maxCapacity,
//         isPaid,
//         price,
//         contactPerson,
//         contactEmail,
//         contactPhone,
//         audience,
//         targetAcademicLevelIds,
//         targetCourseIds,
//         targetEducatorIds,
//         targetStudentIds,
//         targetDepartmentIds,
//         targetParentIds,
//       },
//     });

//     return NextResponse.json(
//       { message: "Event updated successfully", event: updatedEvent },
//       { status: 200 }
//     );
//   } catch (error) {
//     if (error instanceof Error && error.message.includes("RecordNotFound")) {
//       return NextResponse.json({ message: "Event not found" }, { status: 404 });
//     }
//     throw error;
//   }
// }

// // --- Core Logic for DELETE request ---

// async function handleDelete(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { adminSlug, eventId } = context.params;

//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   try {
//     await prisma.event.delete({
//       where: { id: eventId, companyId: company.id },
//     });

//     return new NextResponse(null, { status: 204 });
//   } catch (error) {
//     if (error instanceof Error && error.message.includes("RecordNotFound")) {
//       return NextResponse.json({ message: "Event not found" }, { status: 404 });
//     }
//     throw error;
//   }
// }

// // --- Exported Route Handlers (Wrapped) ---

// 
// export const GET = withApiHandler(handleGet);

// 
// export const PUT = withApiHandler(handlePut);

// 
// export const DELETE = withApiHandler(handleDelete);
