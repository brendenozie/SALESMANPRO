import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { items, companyId } = await req.json();

    // In a real app, this might create a Purchase Order record.
    // For now, we'll simulate a bulk stock increment.
    const updates = items.map((item: any) =>
      prisma.hostelInventory.update({
        where: { id: item.dbId },
        data: { currentStock: { increment: item.orderQty } }
      })
    );

    await prisma.$transaction(updates);

    
    try { await cacheDel(`admin:restock:${companyId || 'global'}:*`); } catch (e) {}
    return NextResponse.json({ message: "Restock successful" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Restock failed" }, { status: 500 });
  }
}