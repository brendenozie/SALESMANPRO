import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { RiderLedgerService } from "@/lib/payments/riderLedger";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/rider/earnings: Get financial summary and recent earnings
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    const summary = await RiderLedgerService.getRiderFinancialSummary(rider.id);

    return json({ success: true, ...summary });
  } catch (error: any) {
    console.error("[RIDER_EARNINGS_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load earnings" }, 500);
  }
}
