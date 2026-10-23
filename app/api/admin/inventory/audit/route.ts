import { NextRequest, NextResponse } from 'next/server';

/**
 * Receives a stock audit submission and logs variance records.
 * In a real implementation: creates StockAdjustment / InventoryVariance records in Prisma.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, auditDate, lines } = body;

    if (!companyId || !lines || !Array.isArray(lines)) {
      return NextResponse.json(
        { success: false, error: 'companyId and lines array are required.' },
        { status: 400 }
      );
    }

    // Log the audit for now — replace with Prisma write when InventoryAudit model is available
    console.log(`[Stock Audit] Company: ${companyId} | Date: ${auditDate} | Lines: ${lines.length}`);
    lines.forEach((l: any) => {
      if (l.variance !== 0) {
        console.log(`  VARIANCE: ${l.name} (${l.sku}) | Expected: ${l.expectedQty} | Counted: ${l.countedQty} | Diff: ${l.variance > 0 ? '+' : ''}${l.variance}`);
      }
    });

    /*
    // TODO: Prisma implementation when model is ready:
    const audit = await prisma.inventoryAudit.create({
      data: {
        companyId,
        auditDate: new Date(auditDate),
        totalLines: lines.length,
        lines: {
          create: lines.map((l: any) => ({
            productId: l.productId,
            sku: l.sku,
            name: l.name,
            expectedQty: l.expectedQty,
            countedQty: l.countedQty,
            variance: l.variance,
          })),
        },
      },
    });
    */

    return NextResponse.json({
      success: true,
      message: `Audit received: ${lines.length} lines. ${lines.filter((l: any) => l.variance !== 0).length} variances recorded.`,
      auditId: `AUDIT-${Date.now()}`,
    });
  } catch (error: any) {
    console.error('[API inventory/audit] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
