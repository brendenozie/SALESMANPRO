import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/rider/availability: Toggle online/offline status
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    if (rider.verificationStatus !== "APPROVED") {
      return json(
        {
          success: false,
          message: "Account must be verified and approved by administrators before going online.",
        },
        403
      );
    }

    const body = await req.json().catch(() => ({}));
    const nextIsOnline = typeof body.isOnline === "boolean" ? body.isOnline : !rider.isOnline;

    const updated = await prisma.riderProfile.update({
      where: { id: rider.id },
      data: {
        isOnline: nextIsOnline,
        lastOnlineAt: nextIsOnline ? new Date() : rider.lastOnlineAt,
      },
    });

    return json({
      success: true,
      isOnline: updated.isOnline,
      message: updated.isOnline
        ? "You are now ONLINE and ready to receive delivery requests."
        : "You are now OFFLINE. New delivery requests will not be sent.",
    });
  } catch (error: any) {
    console.error("[RIDER_AVAILABILITY_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to update availability" }, 500);
  }
}
