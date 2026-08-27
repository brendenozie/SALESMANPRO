import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { vendorId, items, companyId } = await req.json();
    
    // 1. Fetch Company & Vendor Details for the Header
    const [company, vendor] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId } }),
      prisma.hostelVendor.findUnique({ where: { id: vendorId } })
    ]);

    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.orderQty * (item.unitPrice || 0)), 0);

    // 2. Log the Purchase Order in the DB
    const poRecord = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId,
        companyId,
        totalAmount,
        status: "SENT",
        items: {
          create: items.map((item: any) => ({
            inventoryId: item.dbId,
            quantity: item.orderQty,
            unitPrice: item.unitPrice || 0
          }))
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      poData: { ...poRecord, company, vendor, items } 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate PO" }, { status: 500 });
  }
}