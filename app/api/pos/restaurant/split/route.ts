import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { splitBill } from "@/lib/pos/restaurantService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, orderId, splitType, splits, staffId } = body;

    if (!companyId || !orderId || !splitType || !Array.isArray(splits)) {
      return formatResponse(
        false,
        null,
        "companyId, orderId, splitType, and splits array are required",
        400
      );
    }

    const result = await splitBill({
      companyId,
      orderId,
      splitType,
      splits,
      staffId,
    });

    return formatResponse(true, result, "Bill split configured successfully", 200);
  } catch (error: any) {
    console.error("[RESTAURANT_SPLIT_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to split bill", 400);
  }
}
