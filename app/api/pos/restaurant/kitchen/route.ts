import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { sendOrderToKitchen } from "@/lib/pos/restaurantService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, orderId, staffName } = body;

    if (!companyId || !orderId) {
      return formatResponse(false, null, "companyId and orderId are required", 400);
    }

    const result = await sendOrderToKitchen(companyId, orderId, staffName);
    return formatResponse(true, result, "Order sent to kitchen", 200);
  } catch (error: any) {
    console.error("[RESTAURANT_KITCHEN_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to dispatch to kitchen", 400);
  }
}
