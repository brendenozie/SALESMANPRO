import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma, RegistrationStatus } from "@prisma/client";

async function handlePut(request: Request, context: { params: { adminSlug: string, registrationId: string } }) {
  const { adminSlug, registrationId } = context.params;
  const body = await request.json();
  const { status } = body;

  // 1. Validation
  if (!status) {
    return formatResponse(false, null, "Status is required", 400);
  }

  // Ensure status is valid for a toggle operation
  const validToggleStatuses: RegistrationStatus[] = ["ATTENDED", "REGISTERED"];
  if (!validToggleStatuses.includes(status)) {
    return formatResponse(false, null, "Invalid status for check-in toggle", 400);
  }

  try {
    // 2. ATOMIC UPDATE: Security check and update in one DB round-trip
    const updated = await prisma.eventRegistration.update({
      where: { 
        id: registrationId,
        company: { slug: adminSlug } // Enforces ownership security
      },
      data: { status: status as RegistrationStatus },
      select: {
        id: true,
        status: true,
        user: { select: { name: true } },
      }
    });

    const isCheckedIn = updated.status === "ATTENDED";

    
    try { await cacheDel(`admin:company-check-in:${slug || adminSlug || 'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, {
      id: updated.id,
      name: updated.user?.name || 'N/A',
      status: updated.status,
      checkedIn: isCheckedIn,
    }, `Attendee ${updated.user?.name || 'N/A'} has been ${isCheckedIn ? 'checked IN' : 'checked OUT'}.`);

  } catch (error) {
    // 3. Precise Error Handling
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Attendee registration not found in this company", 404);
    }
    throw error;
  }
}

export const PUT = withApiHandler(handlePut);
// import { NextResponse } from "next/server";

//   }

//   const validToggleStatuses = ["ATTENDED", "REGISTERED"];
//   if (!validToggleStatuses.includes(status)) {
//     return NextResponse.json({ message: "Invalid status provided for check-in toggle" }, { status: 400 });
//   }

//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   try {
//     const updatedRegistration = await prisma.eventRegistration.update({
//       where: { id: registrationId, companyId: company.id },
//       data: {
//         status: status,
//       },
//       include: {
//         user: { select: { name: true, email: true } },
//       }
//     });

//     return NextResponse.json(
//       {
//         message: `Attendee ${updatedRegistration.user?.name || 'N/A'} has been ${status === "ATTENDED" ? 'checked IN' : 'checked OUT'}.`,
//         attendee: {
//           id: updatedRegistration.id,
//           name: updatedRegistration.user?.name || 'N/A',
//           status: updatedRegistration.status,
//           checkedIn: updatedRegistration.status === "ATTENDED",
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
