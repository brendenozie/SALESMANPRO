import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

function withCors(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function OPTIONS() {
  return withCors({}, 204);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingNumber = searchParams.get("trackingNumber")?.trim();
    const orderId = searchParams.get("orderId")?.trim();

    if (!trackingNumber && !orderId) {
      return withCors(
        {
          success: false,
          error: "Tracking number or order ID is required.",
        },
        400,
      );
    }

    const order = await prisma.customerOrder.findFirst({
      where: {
        OR: [
          trackingNumber ? { trackingNumber } : undefined,
          trackingNumber ? { transactionReference: trackingNumber } : undefined,
          orderId ? { id: orderId } : undefined,
        ].filter(Boolean) as any,
      },
      include: {
        items: true,
        Company: {
          select: {
            id: true,
            name: true,
            slug: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
      },
    });

    if (!order) {
      return withCors(
        {
          success: false,
          error: "Order not found. Please check your tracking number and try again.",
        },
        404,
      );
    }

    // Enrich items with listing details
    const listingIds = order.items
      .map((i) => i.marketplaceListingId)
      .filter(Boolean) as string[];

    const listings = listingIds.length
      ? await prisma.marketplaceListings.findMany({
          where: { id: { in: listingIds } },
          select: {
            id: true,
            name: true,
            images: true,
            sellingPrice: true,
          },
        })
      : [];

    const listingMap = new Map(listings.map((l) => [l.id, l]));

    const enrichedItems = order.items.map((item) => {
      const listing: any = item.marketplaceListingId
        ? listingMap.get(item.marketplaceListingId)
        : null;

      const image =
        listing?.images && listing.images.length > 0
          ? listing.images[0]
          : null;

      return {
        id: item.id,
        name: listing?.name || "Product Item",
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        image,
        selectedOptions: item.selectedOptions,
      };
    });

    // Derive tracking progress steps
    const isPaid =
      order.paymentStatus === "COMPLETED" ||
      order.status === "PAID" ||
      order.paymentOption === "cash" ||
      order.paymentOption === "cod";

    const isShipped =
      order.deliveryStatus?.toLowerCase().includes("shipped") ||
      order.deliveryStatus?.toLowerCase().includes("transit") ||
      order.deliveryStatus?.toLowerCase().includes("dispatched");

    const isDelivered =
      order.deliveryStatus?.toLowerCase().includes("delivered") ||
      order.status === "COMPLETED";

    const steps = [
      {
        title: "Order Placed",
        description: `Order received on ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "recently"}`,
        completed: true,
        current: !isPaid && !isShipped && !isDelivered,
        date: order.createdAt,
      },
      {
        title: isPaid ? "Payment Confirmed" : "Payment Pending",
        description: isPaid
          ? `Paid via ${order.paymentMethod || order.paymentOption || "Gateway"}`
          : `Awaiting payment via ${order.paymentOption || "M-Pesa / Card"}`,
        completed: isPaid,
        current: isPaid && !isShipped && !isDelivered,
        date: order.transactionDate || null,
      },
      {
        title: "Processing & Fulfillment",
        description: isShipped || isDelivered
          ? "Package packed and fulfilled"
          : isPaid
          ? "Store is preparing your package"
          : "Will process upon payment confirmation",
        completed: isShipped || isDelivered,
        current: isPaid && !isShipped && !isDelivered,
        date: null,
      },
      {
        title: "In Transit",
        description: isShipped
          ? `Dispatched with ${order.shippingMethod || "Standard Delivery"}`
          : "Awaiting dispatch",
        completed: isShipped || isDelivered,
        current: isShipped && !isDelivered,
        date: null,
      },
      {
        title: "Delivered",
        description: isDelivered ? "Order successfully delivered" : "Pending arrival",
        completed: isDelivered,
        current: isDelivered,
        date: null,
      },
    ];

    return withCors({
      success: true,
      data: {
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentOption: order.paymentOption,
        paymentMethod: order.paymentMethod,
        deliveryStatus: order.deliveryStatus || (isPaid ? "Processing" : "Pending Payment"),
        shippingMethod: order.shippingMethod || "Standard Delivery",
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        estimatedDelivery: order.createdAt
          ? new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          : null,
        pricing: {
          subtotal: order.totalPrice,
          discount: order.totalDiscount || 0,
          shipping: order.totalShipping || 0,
          tax: order.totalTax || 0,
          total: order.totalFinalPrice || order.totalPrice,
        },
        items: enrichedItems,
        store: {
          name: order.Company?.name || "SalesmanPro Store",
          slug: order.Company?.slug || null,
          phone: order.Company?.contactPhone || null,
          email: order.Company?.contactEmail || null,
        },
        steps,
      },
    });
  } catch (error: any) {
    console.error("[TRACK_ORDER_ERROR]", error);
    return withCors(
      {
        success: false,
        error: "Failed to retrieve order tracking information.",
      },
      500,
    );
  }
}
