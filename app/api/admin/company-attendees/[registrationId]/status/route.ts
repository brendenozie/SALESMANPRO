import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma, RegistrationStatus } from "@prisma/client"; // Assuming RegistrationStatus enum exists

async function handlePut(request: Request, context: { params: { adminSlug: string, registrationId: string } }) {
  const { adminSlug, registrationId } = context.params;
  const body = await request.json();
  const { status, notes } = body;

  // 1. Basic Validation
  if (!status) return formatResponse(false, null, "Status is required", 400);

  try {
    // 2. ATOMIC UPDATE: Security check and update in one query
    const updated = await prisma.eventRegistration.update({
      where: { 
        id: registrationId,
        company: { slug: adminSlug } // Enforces that the registration belongs to this admin slug
      },
      data: { 
        status: status as RegistrationStatus,
        // notes: notes // Add back if schema supports it
      },
      select: {
        id: true,
        status: true,
        user: { select: { name: true, email: true } },
        event: { select: { title: true } }
      }
    });

    // 3. Structured Response
    
    try { await cacheDel(`admin:status:${slug || adminSlug || 'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, {
      id: updated.id,
      name: updated.user?.name || 'N/A',
      email: updated.user?.email || 'N/A',
      status: updated.status,
      eventTitle: updated.event?.title || 'N/A',
    }, "Attendee status updated successfully", 200);

  } catch (error) {
    // 4. Optimized Error Handling
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Registration record not found within this company", 404);
    }
    throw error; // Let withApiHandler handle 500s
  }
}

export const PUT = withApiHandler(handlePut);
// import { NextResponse } from "next/server";

//   }

//   // Validate status against your enum
//   const validStatuses = ["REGISTERED", "ATTENDED", "CANCELLED", "WAITLISTED"];
//   if (!validStatuses.includes(status)) {
//     return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
//   }

//   // The wrapper's try/catch will handle the update logic's errors
//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   // We wrap the Prisma update in its own try/catch to handle the specific
//   // case of RecordNotFound and return a custom message.
//   try {
//     const updatedRegistration = await prisma.eventRegistration.update({
//       where: { id: registrationId, companyId: company.id },
//       data: {
//         status: status,
//         // notes: notes, // Uncomment if you have a notes field
//       },
//       include: {
//         user: { select: { name: true, email: true } },
//         event: { select: { title: true } }
//       }
//     });

//     return NextResponse.json(
//       {
//         message: "Attendee status updated",
//         attendee: {
//           id: updatedRegistration.id,
//           name: updatedRegistration.user?.name || 'N/A',
//           status: updatedRegistration.status,
//           eventTitle: updatedRegistration.event?.title || 'N/A',
//         },
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     // Check for the specific Prisma "RecordNotFound" error
//     if (error instanceof Error && error.message.includes("RecordNotFound")) {
//       return NextResponse.json({ message: "Attendee registration not found" }, { status: 404 });
//     }
//     // For any other error, re-throw it so the withApiHandler wrapper can handle it generically
//     throw error;
//   }
// }

// // --- Exported Route Handler (Wrapped) ---

// 
// export const PUT = withApiHandler(handlePut);
