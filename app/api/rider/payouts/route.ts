import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { RiderLedgerService } from "@/lib/payments/riderLedger";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/rider/payouts: List past payouts
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

    const payouts = await prisma.riderPayout.findMany({
      where: { riderProfileId: rider.id },
      orderBy: { requestedAt: "desc" },
    });

    return json({ success: true, payouts });
  } catch (error: any) {
    console.error("[RIDER_PAYOUTS_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load payouts" }, 500);
  }
}

// POST /api/rider/payouts: Request earnings withdrawal
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, phone: true, mpesaPhone: true },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    const body = await req.json();
    const { amount, payoutMethod = "MPESA", destinationAccount } = body;

    if (!amount || Number(amount) <= 0) {
      return json({ success: false, message: "Valid positive amount required." }, 400);
    }

    const payout = await RiderLedgerService.requestPayout({
      riderProfileId: rider.id,
      amount: Number(amount),
      payoutMethod,
      destinationAccount: destinationAccount || rider.mpesaPhone || rider.phone,
    });

    return json({
      success: true,
      message: `Payout request for KSH ${amount.toLocaleString()} submitted. It will be sent via ${payoutMethod}.`,
      payout,
    });
  } catch (error: any) {
    console.error("[RIDER_PAYOUT_REQUEST_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to submit payout request" }, 400);
  }
}
