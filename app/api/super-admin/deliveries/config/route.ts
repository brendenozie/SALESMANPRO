import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/super-admin/deliveries/config: Retrieve platform delivery configuration
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const user = session.user as any;
    const role = (user.role || "").toUpperCase();
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return json({ success: false, message: "Forbidden: Super Admin only" }, 403);
    }

    let config = await prisma.platformDeliveryConfig.findFirst();

    if (!config) {
      // Initialize with default 4% transaction cost
      config = await prisma.platformDeliveryConfig.create({
        data: {
          transactionFeePercent: 4.0,
          minRiderFee: 100.0,
          maxRiderFee: 5000.0,
          defaultDispatchRadiusKm: 5.0,
          maxDispatchRadiusKm: 25.0,
          escrowAutoRelease: true,
        },
      });
    }

    // Also compute live escrow statistics
    const [escrowAgg, totalEarnings] = await Promise.all([
      prisma.deliveryRequest.aggregate({
        where: {
          paymentType: "GHUBA_ESCROW",
          escrowStatus: { in: ["DEPOSITED", "RELEASED_TO_RIDER"] },
        },
        _sum: { escrowAmount: true, platformFee: true },
        _count: { _all: true },
      }),
      prisma.riderEarning.aggregate({
        _sum: { platformCommission: true, netAmount: true },
      }),
    ]);

    return json({
      success: true,
      data: {
        ...config,
        stats: {
          totalEscrowDeposited: escrowAgg._sum.escrowAmount || 0,
          totalPlatformCommissionCollected: totalEarnings._sum.platformCommission || 0,
          totalReleasedToRiders: totalEarnings._sum.netAmount || 0,
          totalEscrowTrips: escrowAgg._count._all || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("[GET_PLATFORM_DELIVERY_CONFIG_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load config" }, 500);
  }
}

// PATCH /api/super-admin/deliveries/config: Update transaction fee & platform parameters
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const user = session.user as any;
    const role = (user.role || "").toUpperCase();
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return json({ success: false, message: "Forbidden: Super Admin only" }, 403);
    }

    const body = await req.json();
    const {
      transactionFeePercent,
      minRiderFee,
      maxRiderFee,
      defaultDispatchRadiusKm,
      maxDispatchRadiusKm,
      escrowAutoRelease,
    } = body;

    if (transactionFeePercent !== undefined) {
      const fee = Number(transactionFeePercent);
      if (isNaN(fee) || fee < 0 || fee > 50) {
        return json({ success: false, message: "Transaction fee percent must be between 0% and 50%" }, 400);
      }
    }

    let config = await prisma.platformDeliveryConfig.findFirst();

    if (!config) {
      config = await prisma.platformDeliveryConfig.create({
        data: {
          transactionFeePercent: transactionFeePercent !== undefined ? Number(transactionFeePercent) : 4.0,
          minRiderFee: minRiderFee !== undefined ? Number(minRiderFee) : 100.0,
          maxRiderFee: maxRiderFee !== undefined ? Number(maxRiderFee) : 5000.0,
          defaultDispatchRadiusKm: defaultDispatchRadiusKm !== undefined ? Number(defaultDispatchRadiusKm) : 5.0,
          maxDispatchRadiusKm: maxDispatchRadiusKm !== undefined ? Number(maxDispatchRadiusKm) : 25.0,
          escrowAutoRelease: escrowAutoRelease !== undefined ? Boolean(escrowAutoRelease) : true,
          updatedBy: session.user.id,
        },
      });
    } else {
      config = await prisma.platformDeliveryConfig.update({
        where: { id: config.id },
        data: {
          ...(transactionFeePercent !== undefined && { transactionFeePercent: Number(transactionFeePercent) }),
          ...(minRiderFee !== undefined && { minRiderFee: Number(minRiderFee) }),
          ...(maxRiderFee !== undefined && { maxRiderFee: Number(maxRiderFee) }),
          ...(defaultDispatchRadiusKm !== undefined && { defaultDispatchRadiusKm: Number(defaultDispatchRadiusKm) }),
          ...(maxDispatchRadiusKm !== undefined && { maxDispatchRadiusKm: Number(maxDispatchRadiusKm) }),
          ...(escrowAutoRelease !== undefined && { escrowAutoRelease: Boolean(escrowAutoRelease) }),
          updatedBy: session.user.id,
        },
      });
    }

    return json({
      success: true,
      message: `Platform delivery config updated. Transaction fee set to ${config.transactionFeePercent}%.`,
      data: config,
    });
  } catch (error: any) {
    console.error("[PATCH_PLATFORM_DELIVERY_CONFIG_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to update config" }, 500);
  }
}
