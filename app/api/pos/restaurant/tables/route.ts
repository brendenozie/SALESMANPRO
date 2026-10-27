import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import {
  listRestaurantTables,
  createRestaurantTable,
  updateTableStatus,
  updateRestaurantTable,
  deleteRestaurantTable,
} from "@/lib/pos/restaurantService";
import { TableStatus } from "@prisma/client";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

async function resolveCompanyId(companyId: string): Promise<string> {
  if (/^[0-9a-fA-F]{24}$/.test(companyId)) {
    return companyId;
  }
  const comp = await prisma.company.findFirst({
    where: { OR: [{ slug: companyId }, { id: companyId }] },
    select: { id: true },
  });
  return comp?.id || companyId;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCompanyId = searchParams.get("companyId");
    const areaId = searchParams.get("areaId") || undefined;

    if (!rawCompanyId) {
      return formatResponse(false, null, "Missing companyId parameter", 400);
    }

    const companyId = await resolveCompanyId(rawCompanyId);
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
    const {
      companyId: rawCompanyId,
      tableNumber,
      name,
      capacity,
      areaId,
      tableId,
      status,
      batch,
    } = body;

    if (!rawCompanyId) {
      return formatResponse(false, null, "Missing companyId", 400);
    }

    const companyId = await resolveCompanyId(rawCompanyId);

    // Status update check
    if (tableId && status) {
      const updated = await updateTableStatus(companyId, tableId, status as TableStatus);
      return formatResponse(true, updated, "Table status updated", 200);
    }

    // Batch creation (e.g. generating multiple bar stools or tables)
    if (Array.isArray(batch) && batch.length > 0) {
      const createdTables = [];
      for (const item of batch) {
        if (!item.tableNumber) continue;
        const t = await createRestaurantTable({
          companyId,
          tableNumber: item.tableNumber,
          name: item.name,
          capacity: item.capacity || 1,
          areaId: item.areaId || areaId,
        });
        createdTables.push(t);
      }
      return formatResponse(true, createdTables, `Successfully created ${createdTables.length} tables`, 201);
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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId: rawCompanyId,
      tableId,
      tableNumber,
      name,
      capacity,
      areaId,
      status,
      isActive,
      qrCode,
    } = body;

    if (!tableId) {
      return formatResponse(false, null, "tableId is required", 400);
    }

    const companyId = rawCompanyId ? await resolveCompanyId(rawCompanyId) : "";
    const updated = await updateRestaurantTable(companyId, tableId, {
      tableNumber,
      name,
      capacity,
      areaId,
      status,
      isActive,
      qrCode,
    });

    return formatResponse(true, updated, "Table updated successfully", 200);
  } catch (error: any) {
    console.error("[RESTAURANT_TABLES_PUT_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to update table", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");
    const rawCompanyId = searchParams.get("companyId");

    if (!tableId) {
      return formatResponse(false, null, "tableId parameter is required", 400);
    }

    const companyId = rawCompanyId ? await resolveCompanyId(rawCompanyId) : "";
    await deleteRestaurantTable(companyId, tableId);

    return formatResponse(true, null, "Table deleted successfully", 200);
  } catch (error: any) {
    console.error("[RESTAURANT_TABLES_DELETE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to delete table", 500);
  }
}
