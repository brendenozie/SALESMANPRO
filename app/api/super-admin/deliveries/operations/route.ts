import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/super-admin/deliveries/operations: Real-time network operations overview
export async function GET() {
  try {
    const session = await getAuthSession();
    const role = (session?.user as any)?.role?.toUpperCase();
    if (!session?.user?.id || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
      return json({ success: false, message: "Super Admin authorization required" }, 403);
    }

    const [
      totalRequests,
      searchingRequests,
      activeDeliveries,
      completedDeliveries,
      onlineRiders,
      verifiedRiders,
      pendingVerificationRiders,
      recentRequests,
      disputesCount,
    ] = await Promise.all([
      prisma.deliveryRequest.count(),
      prisma.deliveryRequest.count({
        where: { status: { in: ["SEARCHING_FOR_RIDER", "OFFERED", "BIDDING"] } },
      }),
      prisma.deliveryRequest.count({
        where: {
          status: {
            in: [
              "ASSIGNED",
              "RIDER_EN_ROUTE_TO_PICKUP",
              "ARRIVED_AT_PICKUP",
              "ORDER_COLLECTED",
              "IN_TRANSIT",
              "ARRIVED_AT_DROPOFF",
            ],
          },
        },
      }),
      prisma.deliveryRequest.count({ where: { status: "COMPLETED" } }),
      prisma.riderProfile.count({ where: { isOnline: true } }),
      prisma.riderProfile.count({ where: { verificationStatus: "APPROVED" } }),
      prisma.riderProfile.count({ where: { verificationStatus: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      prisma.deliveryRequest.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { name: true } },
          assignment: {
            include: { riderProfile: { select: { fullName: true, phone: true } } },
          },
        },
      }),
      prisma.deliveryDispute.count({ where: { status: "OPEN" } }),
    ]);

    return json({
      success: true,
      metrics: {
        totalRequests,
        searchingRequests,
        activeDeliveries,
        completedDeliveries,
        onlineRiders,
        verifiedRiders,
        pendingVerificationRiders,
        disputesCount,
      },
      recentRequests,
    });
  } catch (error: any) {
    console.error("[SUPER_ADMIN_OPERATIONS_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load operations metrics" }, 500);
  }
}
