import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { mergeBills } from "@/lib/pos/restaurantService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      sourceOrderId,
      targetOrderId,
      staffId,
      staffName = "Staff",
      reason,
    } = body;

    if (!companyId || !sourceOrderId || !targetOrderId || !staffId) {
      return formatResponse(
        false,
        null,
        "companyId, sourceOrderId, targetOrderId, and staffId are required",
        400
      );
    }

    const result = await mergeBills({
      companyId,
      sourceOrderId,
      targetOrderId,
      staffId,
      staffName,
      reason,
    });

    return formatResponse(true, result, result.message, 200);
  } catch (error: any) {
    console.error("[RESTAURANT_MERGE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to merge bills", 400);
  }
}
