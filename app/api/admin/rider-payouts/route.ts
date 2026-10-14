import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const role = (user.role || "").toUpperCase();

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || user.companyId;

    if (!companyId) {
      return NextResponse.json({ success: false, error: "companyId is required" }, { status: 400 });
    }

    const orders = await prisma.customerOrder.findMany({
      where: {
        companyId,
        delivery: true,
      },
      select: {
        id: true,
        trackingNumber: true,
        name: true,
        phone: true,
        deliveryFee: true,
        deliveryPersonName: true,
        deliveryPersonContact: true,
        deliveryStatus: true,
        status: true,
        paymentStatus: true,
        totalFinalPrice: true,
        orderAudits: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    let totalDeliveryFeesCollected = 0;
    let totalPaidToRiders = 0;
    let pendingPayoutsCount = 0;
    let pendingPayoutsAmount = 0;

    const deliveryOrders = orders.map((order) => {
      const audits = (order.orderAudits as any) || {};
      const riderPayout = audits.riderPayout || null;
      const isPaidToRider = Boolean(riderPayout && riderPayout.status === "PAID");
      const fee = Number(order.deliveryFee || 0);

      totalDeliveryFeesCollected += fee;
      if (isPaidToRider) {
        totalPaidToRiders += Number(riderPayout.amount || fee);
      } else if (fee > 0) {
        pendingPayoutsCount += 1;
        pendingPayoutsAmount += fee;
      }

      return {
        id: order.id,
        trackingNumber: order.trackingNumber || order.id,
        customerName: order.name || "Customer",
        customerPhone: order.phone || "",
        deliveryFee: fee,
        orderTotal: order.totalFinalPrice || 0,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus || "PENDING",
        riderName: order.deliveryPersonName || "Unassigned",
        riderPhone: order.deliveryPersonContact || "",
        isPaidToRider,
        riderPayout,
        createdAt: order.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: deliveryOrders,
        summary: {
          totalDeliveryFeesCollected,
          totalPaidToRiders,
          pendingPayoutsCount,
          pendingPayoutsAmount,
        },
      },
    });
  } catch (err: any) {
    console.error("[ADMIN_RIDER_PAYOUTS_GET_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch rider payouts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const role = (user.role || "").toUpperCase();

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, amount, method, riderPhone, riderName, reference, notes } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, error: "A valid payout amount is required" }, { status: 400 });
    }

    const order = await prisma.customerOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Authorization check: User must own the company or be SUPER_ADMIN
    if (role !== "SUPER_ADMIN" && user.companyId && order.companyId !== user.companyId) {
      return NextResponse.json({ success: false, error: "Unauthorized to record payouts for this store" }, { status: 403 });
    }

    const audits = (order.orderAudits as any) || {};
    const refCode = reference ? reference.trim().toUpperCase() : `RPAY-${Date.now().toString().slice(-6)}`;
    const assignedRiderName = riderName || order.deliveryPersonName || "Assigned Rider";
    const assignedRiderPhone = riderPhone || order.deliveryPersonContact || "";

    const riderPayoutRecord = {
      status: "PAID",
      amount: numAmount,
      method: method || "MPESA",
      riderPhone: assignedRiderPhone,
      riderName: assignedRiderName,
      reference: refCode,
      paidAt: new Date().toISOString(),
      paidByUserId: user.id,
      paidByName: user.name || user.email || "Store Admin",
      notes: notes || null,
    };

    const updatedOrder = await prisma.customerOrder.update({
      where: { id: orderId },
      data: {
        deliveryPersonName: assignedRiderName,
        deliveryPersonContact: assignedRiderPhone,
        notes: `${order.notes || ""} [Rider Paid: KES ${numAmount} via ${method || "MPESA"} Ref: ${refCode}]`.trim(),
        orderAudits: {
          ...audits,
          riderPayout: riderPayoutRecord,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Rider payout of KES ${numAmount} recorded successfully (Ref: ${refCode}).`,
      data: {
        orderId: updatedOrder.id,
        payout: riderPayoutRecord,
      },
    });
  } catch (err: any) {
    console.error("[ADMIN_RIDER_PAYOUTS_POST_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to record rider payout" },
      { status: 500 }
    );
  }
}
