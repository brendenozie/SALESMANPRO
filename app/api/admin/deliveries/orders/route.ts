// File: /app/api/admin/deliveries/orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// ======================================================
// GET /api/admin/deliveries/orders?companyId=xxx
// Fetch unassigned / dispatchable orders for delivery creation
// ======================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const companyId = searchParams.get("companyId");
    const status = searchParams.get("status"); // optional
    const limit = Number(searchParams.get("limit") || 200);

    if (!companyId) {
      return NextResponse.json(
        { success: false, message: "companyId required" },
        { status: 400 },
      );
    }

    const where: any = {
      companyId: companyId,
      deletedAt: null,

      // only completed / active orders normally
      status: status || "COMPLETED",

      // not already assigned to a delivery
      OR: [{ deliveryId: null }, { deliveryId: undefined }],
    };

    const orders = await prisma.customerOrder.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },

      include: {
        items: {
          include: {
            marketplaceListing: {
              select: {
                id: true,
                name: true,
                locationName: true,
              },
            },

            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // ======================================================
    // FLATTEN FOR FRONTEND DELIVERY UI
    // ======================================================

    const mapped = orders.flatMap((order) => {
      const shipping: any = order.shippingAddress || {};

      return order.items.map((item) => ({
        id: item.id,

        orderId: order.id,

        customerName: order.name || "Customer",
        customerPhone: order.phone || "",
        customerEmail: order.email || "",

        productName:
          item.marketplaceListing?.name || item.product?.name || "Order Item",

        quantity: item.quantity || 1,
        price: item.price || 0,
        totalFinalPrice: (item.price || 0) * (item.quantity || 1),

        deliveryAddress: shipping.display_name || "No delivery address",

        deliveryLat: shipping.lat || null,
        deliveryLng: shipping.lng || null,

        pickupAddress: item.marketplaceListing?.locationName || "Main Store",

        marketplaceListing: item.marketplaceListing,

        orderCreatedAt: order.createdAt,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
      }));
    });

    return NextResponse.json({
      success: true,
      count: mapped.length,
      data: {
        items: mapped,
      },
    });
  } catch (error) {
    console.error("DELIVERY ORDERS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch delivery orders",
      },
      { status: 500 },
    );
  }
}
