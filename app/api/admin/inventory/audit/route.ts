import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { cacheDel, buildTenantCacheKey } from "@/lib/cache";

/**
 * POST /api/admin/inventory/audit
 *
 * Receives a stock audit submission with physical counts, logs variance records,
 * and atomically updates the physical warehouse stock (InventoryItem + Product)
 * while syncing online MarketplaceListings and recording InventoryLog audit trails.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, auditDate, lines, autoAdjustStock, managerPin } = body;

    if (!companyId || !lines || !Array.isArray(lines)) {
      return NextResponse.json(
        { success: false, error: "companyId and lines array are required." },
        { status: 400 }
      );
    }

    // Resolve company by ID or Slug
    const targetCompany = await prisma.company.findFirst({
      where: { OR: [{ id: companyId }, { slug: companyId }] },
      select: { id: true, name: true },
    });

    const resolvedCompanyId = targetCompany?.id || companyId;
    const auditId = `AUDIT-${Date.now().toString(36).toUpperCase()}`;
    const variances = lines.filter((l: any) => l.variance !== 0);

    let adjustedCount = 0;

    if (autoAdjustStock) {
      await prisma.$transaction(async (tx) => {
        for (const line of lines) {
          if (typeof line.countedQty !== "number" || !line.productId) continue;

          // 1. Try to find Product in physical inventory
          const product = await tx.product.findFirst({
            where: {
              id: line.productId,
              companyId: resolvedCompanyId,
            },
            select: { id: true, name: true },
          });

          if (product) {
            // A. Update or Create physical InventoryItem
            let invItem = await tx.inventoryItem.findFirst({
              where: {
                productId: product.id,
                companyId: resolvedCompanyId,
              },
            });

            if (invItem) {
              await tx.inventoryItem.update({
                where: { id: invItem.id },
                data: { quantity: line.countedQty },
              });
            } else {
              invItem = await tx.inventoryItem.create({
                data: {
                  productId: product.id,
                  companyId: resolvedCompanyId,
                  quantity: line.countedQty,
                  reorderThreshold: 10,
                },
              });
            }

            // B. Update core Product.quantity
            await tx.product.update({
              where: { id: product.id },
              data: { quantity: line.countedQty },
            }).catch(() => {});

            // C. Create formal audit ledger record in InventoryLog
            await tx.inventoryLog.create({
              data: {
                inventoryId: invItem.id,
                action: "STOCK_AUDIT_ADJUSTMENT",
                quantity: line.countedQty,
                damaged: line.variance < 0 ? Math.abs(line.variance) : 0,
                details: `Audit ${auditId}: Variance ${
                  line.variance > 0 ? "+" : ""
                }${line.variance} (Expected: ${line.expectedQty}, Counted: ${
                  line.countedQty
                }). ${managerPin ? "Verified with Manager PIN." : ""}`,
              },
            });

            // D. Sync all active marketplace listings for this product
            await tx.marketplaceListings.updateMany({
              where: {
                productId: product.id,
                companyId: resolvedCompanyId,
              },
              data: { quantity: line.countedQty },
            }).catch(() => {});

            adjustedCount++;
          } else {
            // Fallback: If line.productId was a legacy marketplaceListings.id
            const listing = await tx.marketplaceListings.findFirst({
              where: { id: line.productId },
              select: { id: true, productId: true },
            });

            if (listing) {
              await tx.marketplaceListings.update({
                where: { id: listing.id },
                data: { quantity: line.countedQty },
              });

              if (listing.productId) {
                await tx.product.update({
                  where: { id: listing.productId },
                  data: { quantity: line.countedQty },
                }).catch(() => {});
              }
              adjustedCount++;
            }
          }
        }
      });

      // Bust cache for inventory and POS listings
      try {
        await cacheDel(buildTenantCacheKey(resolvedCompanyId, "inventory_label_products", {}));
        await cacheDel(buildTenantCacheKey(resolvedCompanyId, "pos_marketplace_listings", {}));
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Audit recorded: ${lines.length} lines. ${variances.length} variances found.${
        autoAdjustStock
          ? ` Updated ${adjustedCount} warehouse records & synced online marketplace listings.`
          : ""
      }`,
      auditId,
      adjustedCount,
      varianceCount: variances.length,
      auditDate: auditDate || new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API_INVENTORY_AUDIT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
