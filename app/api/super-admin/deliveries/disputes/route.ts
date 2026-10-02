import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/super-admin/deliveries/disputes: List disputes
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    const role = (session?.user as any)?.role?.toUpperCase();
    if (!session?.user?.id || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
      return json({ success: false, message: "Super Admin authorization required" }, 403);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const disputes = await prisma.deliveryDispute.findMany({
      where: status && status !== "ALL" ? { status } : undefined,
      include: {
        deliveryRequest: {
          select: {
            trackingNumber: true,
            pickupAddress: true,
            dropoffAddress: true,
            company: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return json({ success: true, disputes });
  } catch (error: any) {
    console.error("[DISPUTES_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load disputes" }, 500);
  }
}

// POST /api/super-admin/deliveries/disputes: Resolve or dismiss dispute
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    const role = (session?.user as any)?.role?.toUpperCase();
    if (!session?.user?.id || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
      return json({ success: false, message: "Super Admin authorization required" }, 403);
    }

    const body = await req.json();
    const { disputeId, resolution, action } = body; // action: "RESOLVED" | "DISMISSED"

    if (!disputeId || !action) {
      return json({ success: false, message: "disputeId and action required" }, 400);
    }

    const updated = await prisma.deliveryDispute.update({
      where: { id: disputeId },
      data: {
        status: action === "RESOLVED" ? "RESOLVED" : "DISMISSED",
        resolution: resolution || null,
        resolvedById: session.user.id,
        resolvedAt: new Date(),
      },
    });

    return json({
      success: true,
      message: `Dispute marked as ${updated.status}.`,
      dispute: updated,
    });
  } catch (error: any) {
    console.error("[DISPUTE_RESOLVE_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to resolve dispute" }, 500);
  }
}
