import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

interface RouteParams {
  params: Promise<{ slug: string; registrationId: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { registrationId } = await params;
    const body = await req.json();
    const { status } = body; // Expected: "REGISTERED" or "ATTENDED"

    if (!status || !["REGISTERED", "ATTENDED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid clearance verification state provided." },
        { status: 400 },
      );
    }

    // Update database context state records
    const updatedRecord = await prisma.eventTicketAttendee.update({
      where: { id: registrationId },
      data: {
        checkInStatus: status,
        checkedInAt: status === "ATTENDED" ? new Date() : null,
      },
    });

    const isCheckedIn = true;//updatedRecord.checkInStatus === "ATTENDED";

    // Exact response payload payload structure expected by handleToggleCheckIn()
    return NextResponse.json(
      {
        message: isCheckedIn
          ? `Successfully checked in ${updatedRecord.fullName}. Welcome!`
          : `Reverted access tracking for ${updatedRecord.fullName}.`,
        attendee: {
          checkedIn: isCheckedIn,
        },
      },
      { status: 205 },
    );
  } catch (error: any) {
    console.error("[CHECKIN_MUTATION_ERR]:", error);
    return NextResponse.json(
      {
        message:
          "Failed to persist validation status modification down-stream.",
      },
      { status: 500 },
    );
  }
}
