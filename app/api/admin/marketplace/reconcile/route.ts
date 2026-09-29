/**
 * app/api/admin/marketplace/reconcile/route.ts
 *
 * GET /api/admin/marketplace/reconcile
 * Diagnostic endpoint for non-destructive reconciliation of Products and MarketplaceListings.
 * Reports:
 * - Products without marketplace listings (internal inventory vs published)
 * - Orphaned listings (listings with missing parent Product)
 * - Price divergences (reporting whether channel price differences exist)
 * - Zero destructive automatic modifications.
 */

import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { reconcileProductListing } from "@/lib/marketplace/publicationService";
import { enforceMarketplaceAccess } from "@/lib/subscriptions/enforce-limits";

export const GET = withApiHandler(
  async (request: Request, context: any) => {
    const companyId = context.companyId;
    if (!companyId) {
      return formatResponse(false, null, "Authorized company context required", 403);
    }

    // --- Subscription Plan Enforcement: Marketplace Access Gate ---
    const marketCheck = await enforceMarketplaceAccess(companyId);
    if (!marketCheck.allowed) {
      return formatResponse(false, { upgradeRequired: marketCheck.upgradeRequired }, marketCheck.message, 403);
    }

    const report = await reconcileProductListing(companyId);

    return formatResponse(
      true,
      report,
      "Product and marketplace listing reconciliation report generated successfully.",
      200,
    );
  },
  { requireAuth: true, requireTenant: true },
);
