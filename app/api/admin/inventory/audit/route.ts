import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/companyAccess";
import {
  ensureInventoryItemTx,
  syncMarketplaceListingsTx,
  formatLedgerDetails,
  invalidateInventoryCaches,
  generateMovementRef,
} from "@/lib/inventory/inventory-service";

export type StocktakeStage =
  | "DRAFT"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "APPROVED"
  | "POSTED"
  | "CANCELLED";

export interface StocktakeLineItem {
  productId: string;
  name?: string;
  sku?: string;
  expectedQty: number;
  countedQty: number;
  variance?: number;
  costPrice?: number;
}

export interface StocktakeSessionData {
  sessionCode: string;
  stage: StocktakeStage;
  warehouseName: string;
  categoryFilter?: string;
  notes?: string;
  countedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  postedAt?: string | null;
  summary: {
    totalItemsCounted: number;
    discrepancyCount: number;
    positiveVarianceUnits: number;
    negativeVarianceUnits: number;
    netVarianceUnits: number;
    netFinancialImpact: number;
  };
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    systemQtyAtCount: number;
    liveSystemQtyAtPost?: number;
    countedQty: number;
    variance: number;
    costPrice: number;
    varianceValue: number;
  }>;
}

function parseAuditFindings(
  rawFindings?: string | null,
): StocktakeSessionData | null {
  if (!rawFindings) return null;
  try {
    const parsed = JSON.parse(rawFindings);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
      return parsed as StocktakeSessionData;
    }
  } catch {
    // Legacy plain-text findings fallback
  }
  return null;
}

/**
 * GET /api/admin/inventory/audit?companyId=...
 * Lists stocktaking sessions (draft, submitted, posted, cancelled) for a company.
 */
async function handleGetAudits(req: Request, context: any) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("companyId") || context?.companyId;

  const authRes = await resolveAuthorizedCompany(
    context?.user || context,
    rawCompanyId,
  );
  if (!authRes.authorized || !authRes.companyId) {
    return formatResponse(
      false,
      null,
      authRes.error || "Unauthorized company access",
      authRes.status || 403,
    );
  }
  const companyId = authRes.companyId;

  const rawAudits = await prisma.inventoryAudit.findMany({
    where: { companyId },
    orderBy: { auditDate: "desc" },
    take: 50,
    include: {
      conductor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const sessions = rawAudits.map((a: any) => {
    const structured = parseAuditFindings(a.findings);
    const fallbackStage: StocktakeStage =
      a.status === "COMPLETED"
        ? "POSTED"
        : a.status === "CANCELLED"
          ? "CANCELLED"
          : "DRAFT";

    return {
      id: a.id,
      companyId: a.companyId,
      auditDate: a.auditDate,
      dbStatus: a.status,
      sessionCode:
        structured?.sessionCode || `STK-${a.id.slice(-6).toUpperCase()}`,
      stage: structured?.stage || fallbackStage,
      warehouseName: structured?.warehouseName || "Main Warehouse",
      categoryFilter: structured?.categoryFilter || "ALL",
      notes: structured?.notes || a.notes || (!structured ? a.findings : "") || "",
      countedBy:
        structured?.countedBy ||
        a.conductor?.name ||
        a.conductor?.email ||
        "Store Auditor",
      reviewedBy: structured?.reviewedBy || null,
      approvedBy: structured?.approvedBy || null,
      postedAt:
        structured?.postedAt ||
        (a.status === "COMPLETED" ? a.updatedAt.toISOString() : null),
      summary: structured?.summary || {
        totalItemsCounted: 0,
        discrepancyCount: 0,
        positiveVarianceUnits: 0,
        negativeVarianceUnits: 0,
        netVarianceUnits: 0,
        netFinancialImpact: 0,
      },
      items: structured?.items || [],
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  });

  return formatResponse(
    true,
    { sessions },
    "Stocktaking sessions fetched successfully.",
    200,
  );
}

/**
 * POST /api/admin/inventory/audit
 *
 * Supports the full stocktaking lifecycle:
 * - stage: "DRAFT" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "CANCELLED"
 *     Saves or updates the stocktaking session without mutating live stock yet.
 * - stage: "POSTED" (default when not specified)
 *     Reconciles physical counted quantities against live system stock:
 *     Variance = Counted Quantity - System Quantity
 *     New Quantity = Counted Quantity (Reconciliation, NEVER Counted + System)
 *     Prevents duplicate posting if session was already POSTED.
 */
async function handlePostAudit(req: Request, context: any) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      sessionId,
      companyId: bodyCompanyId,
      items,
      notes,
      stage: requestedStage,
      warehouseName = "Main Warehouse",
      categoryFilter = "ALL",
      countedBy,
      reviewedBy,
      approvedBy,
    } = body as {
      sessionId?: string;
      companyId?: string;
      items?: StocktakeLineItem[];
      notes?: string;
      stage?: StocktakeStage;
      warehouseName?: string;
      categoryFilter?: string;
      countedBy?: string;
      reviewedBy?: string;
      approvedBy?: string;
    };

    const targetStage: StocktakeStage = requestedStage || "POSTED";

    const authCompanyRes = await resolveAuthorizedCompany(
      context?.user || context,
      bodyCompanyId || context?.companyId,
    );

    if (!authCompanyRes.authorized || !authCompanyRes.companyId) {
      return formatResponse(
        false,
        null,
        authCompanyRes.error || "Unauthorized company access",
        authCompanyRes.status || 403,
      );
    }

    const companyId = authCompanyRes.companyId;
    const actorId = context?.user?.id || null;
    const actorName =
      countedBy ||
      context?.user?.name ||
      context?.user?.email ||
      "Store Auditor";

    // Check existing session if sessionId is provided
    let existingAudit: any = null;
    let existingStructured: StocktakeSessionData | null = null;
    if (sessionId) {
      existingAudit = await prisma.inventoryAudit.findFirst({
        where: { id: sessionId, companyId },
      });
      if (!existingAudit) {
        return formatResponse(
          false,
          null,
          "Stocktaking session not found.",
          404,
        );
      }
      existingStructured = parseAuditFindings(existingAudit.findings);

      // CRITICAL GUARD: Prevent duplicate posting of an already posted session
      if (
        existingAudit.status === "COMPLETED" ||
        existingStructured?.stage === "POSTED"
      ) {
        return formatResponse(
          false,
          null,
          "This stocktaking session has already been posted and cannot be posted again.",
          409,
        );
      }
    }

    // Handle cancellation of an unposted session
    if (targetStage === "CANCELLED" && existingAudit) {
      const cancelledPayload: StocktakeSessionData = {
        ...(existingStructured || {
          sessionCode: `STK-${existingAudit.id.slice(-6).toUpperCase()}`,
          warehouseName,
          summary: {
            totalItemsCounted: 0,
            discrepancyCount: 0,
            positiveVarianceUnits: 0,
            negativeVarianceUnits: 0,
            netVarianceUnits: 0,
            netFinancialImpact: 0,
          },
          items: [],
        }),
        stage: "CANCELLED",
        notes: notes || existingStructured?.notes || "Session cancelled",
      };

      const cancelled = await prisma.inventoryAudit.update({
        where: { id: existingAudit.id },
        data: {
          status: "CANCELLED" as any,
          findings: JSON.stringify(cancelledPayload),
          notes: notes || existingAudit.notes || "Session cancelled",
          updatedAt: new Date(),
        },
      });

      return formatResponse(
        true,
        { sessionId: cancelled.id, stage: "CANCELLED" },
        "Stocktaking session cancelled.",
        200,
      );
    }

    const rawItems: Array<{
      productId: string;
      name?: string;
      sku?: string;
      expectedQty?: number;
      countedQty: number;
      costPrice?: number;
    }> = Array.isArray(items)
      ? items
      : existingStructured?.items.map((it) => ({
          productId: it.productId,
          name: it.name,
          sku: it.sku,
          expectedQty: it.systemQtyAtCount,
          countedQty: it.countedQty,
          costPrice: it.costPrice,
        })) || [];

    if (rawItems.length === 0) {
      return formatResponse(
        false,
        null,
        "No counted items provided for stocktaking session.",
        400,
      );
    }

    const validItems = rawItems.filter(
      (i) =>
        i.productId &&
        typeof i.countedQty === "number" &&
        !Number.isNaN(i.countedQty) &&
        i.countedQty >= 0,
    );

    if (validItems.length === 0) {
      return formatResponse(
        false,
        null,
        "No valid non-negative product counts found in payload.",
        400,
      );
    }

    // Resolve authoritative product metadata for all counted items
    const productIds = validItems.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, companyId },
      include: {
        inventoryItems: {
          select: { id: true, quantity: true, companyId: true },
        },
      },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    const sessionCode =
      existingStructured?.sessionCode || generateMovementRef("STK");

    let positiveVarianceUnits = 0;
    let negativeVarianceUnits = 0;
    let netFinancialImpact = 0;
    let discrepancyCount = 0;

    const normalizedSessionItems = validItems
      .filter((line) => productMap.has(line.productId))
      .map((line) => {
        const prod = productMap.get(line.productId)!;
        const primaryInv =
          prod.inventoryItems.find((it) => it.companyId === companyId) ||
          prod.inventoryItems[0];
        const liveSystemQty = Math.max(
          0,
          Number(primaryInv?.quantity ?? prod.quantity ?? 0),
        );
        const systemQtyAtCount =
          typeof line.expectedQty === "number" &&
          !Number.isNaN(line.expectedQty)
            ? Math.max(0, Math.round(line.expectedQty))
            : liveSystemQty;
        const countedQty = Math.max(0, Math.round(line.countedQty));
        const variance = countedQty - liveSystemQty;
        const costPrice = Number(line.costPrice ?? prod.costPrice ?? 0);
        const varianceValue = variance * costPrice;

        if (variance !== 0) {
          discrepancyCount++;
          if (variance > 0) positiveVarianceUnits += variance;
          if (variance < 0) negativeVarianceUnits += Math.abs(variance);
          netFinancialImpact += varianceValue;
        }

        return {
          productId: prod.id,
          name: line.name || prod.name,
          sku:
            line.sku ||
            prod.model ||
            `SKU-${prod.id.slice(-8).toUpperCase()}`,
          systemQtyAtCount,
          liveSystemQtyAtPost: liveSystemQty,
          countedQty,
          variance,
          costPrice,
          varianceValue,
        };
      });

    if (normalizedSessionItems.length === 0) {
      return formatResponse(
        false,
        null,
        "None of the submitted products belong to this company.",
        400,
      );
    }

    const sessionPayload: StocktakeSessionData = {
      sessionCode,
      stage: targetStage,
      warehouseName,
      categoryFilter,
      notes: notes || existingStructured?.notes || "",
      countedBy: actorName,
      reviewedBy:
        reviewedBy ||
        existingStructured?.reviewedBy ||
        (targetStage === "SUBMITTED" ||
        targetStage === "APPROVED" ||
        targetStage === "POSTED"
          ? actorName
          : undefined),
      approvedBy:
        approvedBy ||
        existingStructured?.approvedBy ||
        (targetStage === "APPROVED" || targetStage === "POSTED"
          ? actorName
          : undefined),
      postedAt: targetStage === "POSTED" ? new Date().toISOString() : null,
      summary: {
        totalItemsCounted: normalizedSessionItems.length,
        discrepancyCount,
        positiveVarianceUnits,
        negativeVarianceUnits,
        netVarianceUnits: positiveVarianceUnits - negativeVarianceUnits,
        netFinancialImpact,
      },
      items: normalizedSessionItems,
    };

    // Resolve valid conductor User ID for InventoryAudit foreign key (`conductedBy`)
    let validUserId = actorId;
    if (!validUserId || !/^[0-9a-fA-F]{24}$/.test(validUserId)) {
      const companyRecord = await prisma.company.findUnique({
        where: { id: companyId },
        select: { userId: true },
      });
      validUserId = companyRecord?.userId || null;
      if (!validUserId) {
        const fallbackUser = await prisma.user.findFirst({
          select: { id: true },
        });
        validUserId = fallbackUser?.id || null;
      }
    }

    // If stage is DRAFT, IN_PROGRESS, SUBMITTED, or APPROVED -> save session without mutating stock yet
    if (targetStage !== "POSTED") {
      let savedAudit: any;
      if (existingAudit) {
        savedAudit = await prisma.inventoryAudit.update({
          where: { id: existingAudit.id },
          data: {
            status: "IN_PROGRESS" as any,
            findings: JSON.stringify(sessionPayload),
            notes: notes || existingAudit.notes || null,
            updatedAt: new Date(),
          },
        });
      } else if (validUserId) {
        savedAudit = await prisma.inventoryAudit.create({
          data: {
            companyId,
            conductedBy: validUserId,
            auditDate: new Date(),
            status: "IN_PROGRESS" as any,
            findings: JSON.stringify(sessionPayload),
            notes: notes || null,
          },
        });
      }

      return formatResponse(
        true,
        {
          sessionId: savedAudit?.id || null,
          sessionCode,
          stage: targetStage,
          summary: sessionPayload.summary,
          items: sessionPayload.items,
        },
        `Stocktaking session (${sessionCode}) saved as ${targetStage}.`,
        200,
      );
    }

    // === STAGE === "POSTED": Execute Atomic Stocktake Reconciliation ===
    let adjustedCount = 0;
    let unchangedCount = 0;
    const reconciliationDetails: Array<{
      productId: string;
      name: string;
      previousStock: number;
      countedStock: number;
      variance: number;
    }> = [];

    const txResult = await prisma.$transaction(
      async (tx) => {
        for (const item of normalizedSessionItems) {
          const prod = await tx.product.findFirst({
            where: { id: item.productId, companyId },
          });
          if (!prod) continue;

          const invItem = await ensureInventoryItemTx(
            tx,
            prod.id,
            companyId,
            prod.quantity,
          );

          const liveSystemStock = Math.max(
            0,
            Number(invItem.quantity ?? prod.quantity ?? 0),
          );
          const countedStock = Math.max(0, Math.round(item.countedQty));
          // CRITICAL RECONCILIATION FORMULA:
          // Variance = Physically Counted Quantity - System Quantity
          // Resulting Stock = Physically Counted Quantity (NEVER System + Counted)
          const variance = countedStock - liveSystemStock;

          item.liveSystemQtyAtPost = liveSystemStock;
          item.variance = variance;
          item.varianceValue = variance * item.costPrice;

          reconciliationDetails.push({
            productId: prod.id,
            name: prod.name,
            previousStock: liveSystemStock,
            countedStock,
            variance,
          });

          if (variance === 0) {
            if (prod.quantity !== countedStock) {
              await tx.product.update({
                where: { id: prod.id },
                data: {
                  quantity: countedStock,
                  isAvailable: countedStock > 0,
                },
              });
            }
            await syncMarketplaceListingsTx(tx, prod.id, countedStock);
            unchangedCount++;
            continue;
          }

          // 1. Update InventoryItem to exact countedStock
          await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: {
              quantity: countedStock,
              updatedAt: new Date(),
            },
          });

          // 2. Update Product to exact countedStock
          await tx.product.update({
            where: { id: prod.id },
            data: {
              quantity: countedStock,
              isAvailable: countedStock > 0,
              updatedAt: new Date(),
            },
          });

          // 3. Synchronize attached Ghuba Marketplace Listings
          await syncMarketplaceListingsTx(tx, prod.id, countedStock);

          // 4. Write auditable STOCKTAKE_ADJUSTMENT ledger entry
          const sign = variance > 0 ? `+${variance}` : `${variance}`;
          await tx.inventoryLog.create({
            data: {
              inventoryId: invItem.id,
              action: "STOCKTAKE_ADJUSTMENT",
              quantity: Math.abs(variance),
              damaged: 0,
              details: formatLedgerDetails(
                `Stocktake Reconciliation (${sessionCode}): System ${liveSystemStock} → Counted ${countedStock} (${sign} variance)${
                  notes ? ` | ${notes}` : ""
                }`,
                {
                  referenceId: sessionCode,
                  referenceType: "STOCKTAKE",
                  movementType: "STOCKTAKE_ADJUSTMENT",
                  productId: prod.id,
                  companyId,
                  warehouseName,
                  sourceLocation: warehouseName,
                  previousQuantity: liveSystemStock,
                  newQuantity: countedStock,
                  delta: variance,
                  actorId,
                  actorName,
                  reason:
                    notes ||
                    `Physical stocktake reconciliation (${sessionCode})`,
                  relatedStocktakeId: existingAudit?.id || sessionCode,
                },
              ),
              ...(validUserId ? { userId: validUserId } : {}),
            },
          });

          adjustedCount++;
        }

        let finalAuditRecord: any = null;
        if (existingAudit) {
          finalAuditRecord = await tx.inventoryAudit.update({
            where: { id: existingAudit.id },
            data: {
              status: "COMPLETED" as any,
              findings: JSON.stringify(sessionPayload),
              notes: notes || existingAudit.notes || null,
              updatedAt: new Date(),
            },
          });
        } else if (validUserId) {
          finalAuditRecord = await tx.inventoryAudit.create({
            data: {
              companyId,
              conductedBy: validUserId,
              auditDate: new Date(),
              status: "COMPLETED" as any,
              findings: JSON.stringify(sessionPayload),
              notes: notes || null,
            },
          });
        }

        return finalAuditRecord;
      },
      { maxWait: 10000, timeout: 25000 },
    );

    await invalidateInventoryCaches(companyId);

    return formatResponse(
      true,
      {
        sessionId: txResult?.id || sessionId || null,
        sessionCode,
        stage: "POSTED",
        totalAudited: normalizedSessionItems.length,
        adjustedCount,
        unchangedCount,
        summary: sessionPayload.summary,
        reconciledItems: reconciliationDetails,
      },
      `Stocktake (${sessionCode}) reconciled and posted: ${adjustedCount} product(s) adjusted, ${unchangedCount} verified exact.`,
      200,
    );
  } catch (err: any) {
    console.error("[STOCK_AUDIT_POST_ERROR]", err);
    return formatResponse(
      false,
      null,
      err.message || "Failed to process stocktake reconciliation",
      500,
    );
  }
}

export const GET = withApiHandler(handleGetAudits, {
  requireAuth: true,
});

export const POST = withApiHandler(handlePostAudit, {
  requireAuth: true,
  allowedRoles: ["SUPER_ADMIN", "ADMIN", "COMPANY_ADMIN", "MANAGER"],
});
