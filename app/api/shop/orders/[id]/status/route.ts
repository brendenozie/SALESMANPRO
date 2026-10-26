import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing order ID" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const order = await prisma.customerOrder.findFirst({
      where: {
        OR: [{ id: orderId }, { trackingNumber: orderId }],
      },
      select: {
        id: true,
        trackingNumber: true,
        companyId: true,
        name: true,
        phone: true,
        paymentOption: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        deliveryStatus: true,
        totalFinalPrice: true,
        totalPrice: true,
        createdAt: true,
        updatedAt: true,
        notes: true,
        channelMetadata: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const isPaid =
      order.paymentStatus === "COMPLETED" ||
      order.status === "PAID" ||
      order.paymentOption === "cash";

    // Atomically increment direct pay link successful uses upon verified payment confirmation
    const meta = (order.channelMetadata as any);
    if (isPaid && meta?.linkCode) {
      import("@/lib/pay-links/service").then(({ recordDirectPayLinkPaymentSuccess }) => {
        recordDirectPayLinkPaymentSuccess(meta.linkCode);
      }).catch(() => null);
    }

    const isPending =
      order.paymentStatus === "INITIATED" ||
      order.paymentStatus === "PENDING" ||
      order.status === "PENDING";

    const isFailed =
      order.paymentStatus === "FAILED" ||
      order.status === "CANCELLED";

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          trackingNumber: order.trackingNumber,
          paymentStatus: order.paymentStatus,
          status: order.status,
          deliveryStatus: order.deliveryStatus,
          paymentOption: order.paymentOption,
          paymentMethod: order.paymentMethod,
          totalAmount: order.totalFinalPrice ?? order.totalPrice,
          isPaid,
          isPending,
          isFailed,
          updatedAt: order.updatedAt,
        },
      },
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  } catch (error: any) {
    console.error("[SHOP_ORDER_STATUS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch order status" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
