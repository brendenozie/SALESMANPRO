import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/admin/delivery-requests/[id]: Fetch request details, bids, live tracking
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { id } = params;

    const request = await prisma.deliveryRequest.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, contactPhone: true, logoUrl: true },
        },
        bids: {
          include: {
            riderProfile: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                rating: true,
                profilePhoto: true,
                riderType: true,
                totalCompletedDeliveries: true,
              },
            },
          },
          orderBy: { proposedFee: "asc" },
        },
        assignment: {
          include: {
            riderProfile: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                rating: true,
                profilePhoto: true,
                riderType: true,
                currentLat: true,
                currentLng: true,
                locationUpdatedAt: true,
              },
            },
          },
        },
        offers: {
          include: {
            riderProfile: { select: { fullName: true, rating: true, riderType: true } },
          },
        },
      },
    });

    if (!request) {
      return json({ success: false, message: "Delivery request not found" }, 404);
    }

    return json({ success: true, request });
  } catch (error: any) {
    console.error("[ADMIN_DELIVERY_REQUEST_DETAIL_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load delivery request" }, 500);
  }
}
