import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

/**
 * Receives a stock audit submission, logs variance records,
 * and optionally applies live inventory adjustments to marketplace listings.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, auditDate, lines, autoAdjustStock, managerPin } = body;

    if (!companyId || !lines || !Array.isArray(lines)) {
      return NextResponse.json(
        { success: false, error: 'companyId and lines array are required.' },
        { status: 400 }
      );
    }

    const variances = lines.filter((l: any) => l.variance !== 0);
    console.log(`[Stock Audit] Company: ${companyId} | Date: ${auditDate} | Total Lines: ${lines.length} | Variances: ${variances.length}`);

    // If auto-adjust is requested, update Prisma inventory quantities
    let adjustedCount = 0;
    if (autoAdjustStock) {
      for (const line of lines) {
        if (typeof line.countedQty === 'number' && line.productId) {
          try {
            await prisma.marketplaceListings.update({
              where: { id: line.productId },
              data: { quantity: line.countedQty },
            });
            adjustedCount++;
          } catch (err) {
            console.warn(`[Stock Audit] Could not update listing ${line.productId}:`, err);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Audit recorded: ${lines.length} lines. ${variances.length} variances found.${autoAdjustStock ? ` Updated ${adjustedCount} inventory records in catalog.` : ''}`,
      auditId: `AUDIT-${Date.now()}`,
      adjustedCount,
      varianceCount: variances.length,
    });
  } catch (error: any) {
    console.error('[API inventory/audit] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
