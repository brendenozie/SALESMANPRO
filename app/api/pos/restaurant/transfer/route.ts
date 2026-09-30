import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { transferTable, transferOrderItems } from "@/lib/pos/restaurantService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      transferType, // "TABLE" or "ITEMS"
      fromTableId,
      toTableId,
      sourceOrderId,
      targetOrderId,
      itemIds,
      staffId,
      staffName = "Staff",
      reason,
    } = body;

    if (!companyId || !staffId) {
      return formatResponse(false, null, "companyId and staffId are required", 400);
    }

    if (transferType === "ITEMS") {
      if (!sourceOrderId || !targetOrderId || !Array.isArray(itemIds) || itemIds.length === 0) {
        return formatResponse(
          false,
          null,
          "sourceOrderId, targetOrderId, and itemIds array are required for item transfer",
          400
        );
      }

      const result = await transferOrderItems({
        companyId,
        sourceOrderId,
        targetOrderId,
        itemIds,
        staffId,
        staffName,
      });

      return formatResponse(true, result, "Items transferred successfully", 200);
    }

    // Default: Whole Table transfer
    if (!fromTableId || !toTableId) {
      return formatResponse(false, null, "fromTableId and toTableId are required", 400);
    }

    const result = await transferTable({
      companyId,
      fromTableId,
      toTableId,
      staffId,
      staffName,
      reason,
    });

    return formatResponse(true, result, result.message, 200);
  } catch (error: any) {
    console.error("[RESTAURANT_TRANSFER_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to process transfer", 400);
  }
}
