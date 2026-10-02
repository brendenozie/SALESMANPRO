import { NextRequest, NextResponse } from "next/server";
import { resolveOrderTracking } from "@/lib/tracking/orderTrackingService";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query =
      searchParams.get("query") ||
      searchParams.get("trackingNumber") ||
      searchParams.get("trackingnumber") ||
      searchParams.get("orderId") ||
      searchParams.get("orderNumber") ||
      searchParams.get("ref") ||
      searchParams.get("search") ||
      "";

    const storeSlug = searchParams.get("storeSlug") || searchParams.get("slug") || null;

    if (!query.trim()) {
      return withCors(
        {
          success: false,
          error: "Tracking number, order number, or phone/email is required.",
        },
        400,
      );
    }

    const result = await resolveOrderTracking(query, storeSlug);

    if (!result.success) {
      return withCors(
        {
          success: false,
          error: result.error || "Order not found. Please verify your tracking number and try again.",
        },
        404,
      );
    }

    return withCors({
      success: true,
      data: result.data,
      multipleOrders: result.multipleOrders,
    });
  } catch (error: any) {
    console.error("[ORDERS_TRACK_API_ERROR]", error);
    return withCors(
      {
        success: false,
        error: error.message || "Failed to retrieve order tracking information.",
      },
      500,
    );
  }
}
