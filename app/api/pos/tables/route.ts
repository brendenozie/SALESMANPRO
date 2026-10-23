import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/pos/tables?companyId=...
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  try {
    // 1. Get areas with tables
    let areas = await prisma.restaurantArea.findMany({
      where: { companyId, isActive: true },
      include: {
        tables: {
          where: { isActive: true },
          orderBy: { tableNumber: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Seed default areas and tables if none exist for this company
    if (areas.length === 0) {
      const defaultArea = await prisma.restaurantArea.create({
        data: {
          companyId,
          name: "Main Dining",
          slug: "main-dining",
          sortOrder: 0,
        },
      });

      const tableData = [
        { companyId, areaId: defaultArea.id, tableNumber: "T1", name: "Table 1", capacity: 2, status: "AVAILABLE" as const },
        { companyId, areaId: defaultArea.id, tableNumber: "T2", name: "Table 2", capacity: 4, status: "AVAILABLE" as const },
        { companyId, areaId: defaultArea.id, tableNumber: "T3", name: "Table 3", capacity: 4, status: "AVAILABLE" as const },
        { companyId, areaId: defaultArea.id, tableNumber: "T4", name: "Table 4", capacity: 6, status: "AVAILABLE" as const },
        { companyId, areaId: defaultArea.id, tableNumber: "T5", name: "Table 5 (Booth)", capacity: 6, status: "AVAILABLE" as const },
        { companyId, areaId: defaultArea.id, tableNumber: "BAR1", name: "Bar Stool 1", capacity: 1, status: "AVAILABLE" as const },
        { companyId, areaId: defaultArea.id, tableNumber: "BAR2", name: "Bar Stool 2", capacity: 1, status: "AVAILABLE" as const },
      ];

      for (const t of tableData) {
        await prisma.restaurantTable.create({ data: t });
      }

      areas = await prisma.restaurantArea.findMany({
        where: { companyId, isActive: true },
        include: {
          tables: { where: { isActive: true }, orderBy: { tableNumber: "asc" } },
        },
        orderBy: { sortOrder: "asc" },
      });
    }

    return NextResponse.json({ areas });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/pos/tables - Update status, open session, or create table
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, companyId, tableId, status, tableNumber, capacity, areaId, name } = body;

    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    if (action === "CREATE_TABLE") {
      const newTable = await prisma.restaurantTable.create({
        data: {
          companyId,
          tableNumber,
          name: name || `Table ${tableNumber}`,
          capacity: capacity || 4,
          areaId: areaId || null,
          status: "AVAILABLE",
        },
      });
      return NextResponse.json({ success: true, table: newTable });
    }

    if (action === "UPDATE_STATUS") {
      if (!tableId || !status) return NextResponse.json({ error: "tableId and status required" }, { status: 400 });

      const updated = await prisma.restaurantTable.update({
        where: { id: tableId },
        data: { status },
      });
      return NextResponse.json({ success: true, table: updated });
    }

    if (action === "TRANSFER_TABLE") {
      const { fromTableNumber, toTableNumber, orderId, staffId, staffName, reason } = body;
      if (!fromTableNumber || !toTableNumber) {
        return NextResponse.json({ error: "from and to table required" }, { status: 400 });
      }

      // Record audit log
      if (staffId && orderId) {
        await prisma.tableTransferAudit.create({
          data: {
            companyId,
            fromTableNumber,
            toTableNumber,
            orderId,
            staffId,
            staffName: staffName || "Staff",
            reason: reason || "Guest request",
          },
        }).catch(() => null);
      }

      // Update table statuses
      await Promise.all([
        prisma.restaurantTable.updateMany({
          where: { companyId, tableNumber: fromTableNumber },
          data: { status: "AVAILABLE" },
        }),
        prisma.restaurantTable.updateMany({
          where: { companyId, tableNumber: toTableNumber },
          data: { status: "OCCUPIED" },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Transferred from ${fromTableNumber} to ${toTableNumber}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
