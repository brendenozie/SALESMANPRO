// app/api/admin/[adminSlug]/check-in/[registrationId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; registrationId: string } }
) {
  const { adminSlug, registrationId } = params;
  const body = await request.json();
  const { status } = body; // Expected status: "ATTENDED" or "REGISTERED"

  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
  }

  const validToggleStatuses = ["ATTENDED", "REGISTERED"]; // Only allow these for check-in toggle
  if (!validToggleStatuses.includes(status)) {
    return NextResponse.json({ message: "Invalid status provided for check-in toggle" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: registrationId, companyId: company.id },
      data: {
        status: status,
      },
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    return NextResponse.json(
      {
        message: `Attendee ${updatedRegistration.user?.name || 'N/A'} has been ${status === "ATTENDED" ? 'checked IN' : 'checked OUT'}.`,
        attendee: {
          id: updatedRegistration.id,
          name: updatedRegistration.user?.name || 'N/A',
          status: updatedRegistration.status,
          checkedIn: updatedRegistration.status === "ATTENDED",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling check-in status:", error);
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Attendee registration not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}