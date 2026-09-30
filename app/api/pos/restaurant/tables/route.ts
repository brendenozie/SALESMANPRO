import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import {
  listRestaurantTables,
  createRestaurantTable,
  updateTableStatus,
} from "@/lib/pos/restaurantService";
import { TableStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const areaId = searchParams.get("areaId") || undefined;

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId parameter", 400);
    }

    const tables = await listRestaurantTables(companyId, areaId);
    return formatResponse(true, tables, "Restaurant tables retrieved", 200);
  } catch (error: any) {
    console.error("[RESTAURANT_TABLES_GET_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to get tables", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, tableNumber, name, capacity, areaId, tableId, status } = body;

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId", 400);
    }

    // Status update check
    if (tableId && status) {
      const updated = await updateTableStatus(companyId, tableId, status as TableStatus);
      return formatResponse(true, updated, "Table status updated", 200);
    }

    if (!tableNumber) {
      return formatResponse(false, null, "tableNumber is required", 400);
    }

    const table = await createRestaurantTable({
      companyId,
      tableNumber,
      name,
      capacity,
      areaId,
    });

    return formatResponse(true, table, "Table created successfully", 201);
  } catch (error: any) {
    console.error("[RESTAURANT_TABLES_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to create/update table", 500);
  }
}
