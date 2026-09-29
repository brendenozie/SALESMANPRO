/**
 * app/api/admin/marketplace/link/route.ts
 *
 * Dedicated Admin API for Product ↔ Listing Linking, Candidate Search,
 * Disconnection, and Conflict Resolution.
 */

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import {
  linkListingToProduct,
  unlinkListing,
  createProductFromListing,
  searchLinkCandidates,
  compareProductAndListing,
} from "@/lib/marketplace/linkingService";
import { enforceMarketplaceAccess } from "@/lib/subscriptions/enforce-limits";

async function handleGet(req: Request, context: any) {
  const companyId = context.companyId;
  if (!companyId) {
    return formatResponse(false, null, "Authorized company context required", 403);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "SEARCH_CANDIDATES";

  if (action === "SEARCH_CANDIDATES") {
    const query = url.searchParams.get("q") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const candidates = await searchLinkCandidates(companyId, query, limit);
    return formatResponse(true, candidates, "Link candidates retrieved", 200);
  }

  if (action === "COMPARE") {
    const productId = url.searchParams.get("productId");
    const listingId = url.searchParams.get("listingId");

    if (!productId || !listingId) {
      return formatResponse(false, null, "Both productId and listingId are required", 400);
    }

    const comparison = await compareProductAndListing(companyId, productId, listingId);
    if (!comparison.success) {
      return formatResponse(false, null, comparison.error || "Comparison failed", 400);
    }
    return formatResponse(true, comparison.comparison, "Comparison completed", 200);
  }

  return formatResponse(false, null, `Unknown action: ${action}`, 400);
}

async function handlePost(req: Request, context: any) {
  const companyId = context.companyId;
  if (!companyId) {
    return formatResponse(false, null, "Authorized company context required", 403);
  }

  const marketplaceCheck = await enforceMarketplaceAccess(companyId);
  if (!marketplaceCheck.allowed) {
    return formatResponse(false, null, marketplaceCheck.message, 403);
  }

  const body = await req.json().catch(() => ({}));
  const { action, listingId, productId, pricePreference, syncSpecs, costPrice, initialStock, sku, items } = body;

  // 1. LINK ACTION
  if (action === "LINK") {
    if (!listingId || !productId) {
      return formatResponse(false, null, "listingId and productId are required", 400);
    }

    const result = await linkListingToProduct({
      companyId,
      listingId,
      productId,
      pricePreference,
      syncSpecs,
    });

    if (!result.success) {
      return formatResponse(false, null, result.error || "Failed to link records", 400);
    }
    return formatResponse(true, result, "Listing linked to product successfully", 200);
  }

  // 2. UNLINK ACTION
  if (action === "UNLINK") {
    if (!listingId) {
      return formatResponse(false, null, "listingId is required", 400);
    }

    const result = await unlinkListing(companyId, listingId);
    if (!result.success) {
      return formatResponse(false, null, result.error || "Failed to unlink listing", 400);
    }
    return formatResponse(true, result, "Listing unlinked from product successfully", 200);
  }

  // 3. CREATE PRODUCT FROM LISTING
  if (action === "CREATE_PRODUCT_FROM_LISTING") {
    if (!listingId) {
      return formatResponse(false, null, "listingId is required", 400);
    }

    const result = await createProductFromListing(companyId, listingId, {
      costPrice,
      initialStock,
      sku,
    });

    if (!result.success) {
      return formatResponse(false, null, result.error || "Failed to create product", 400);
    }
    return formatResponse(true, result, "Product created and linked successfully", 201);
  }

  // 4. BULK LINK ACTION
  if (action === "BULK_LINK") {
    if (!Array.isArray(items) || items.length === 0) {
      return formatResponse(false, null, "items[] array required for BULK_LINK", 400);
    }

    let linkedCount = 0;
    const errors: Array<{ listingId: string; productId: string; error: string }> = [];

    for (const item of items) {
      if (!item.listingId || !item.productId) continue;
      const res = await linkListingToProduct({
        companyId,
        listingId: item.listingId,
        productId: item.productId,
        pricePreference: item.pricePreference || "PRODUCT",
        syncSpecs: true,
      });

      if (res.success) {
        linkedCount++;
      } else {
        errors.push({ listingId: item.listingId, productId: item.productId, error: res.error || "Failed" });
      }
    }

    return formatResponse(
      true,
      { linkedCount, total: items.length, errors },
      `Bulk linking complete: ${linkedCount} linked, ${errors.length} failed`,
      200
    );
  }

  return formatResponse(false, null, `Invalid linking action: ${action}`, 400);
}

export const GET = withApiHandler(handleGet, {
  requireAuth: true,
  requireTenant: true,
  allowedRoles: ["SUPER_ADMIN", "ADMIN", "COMPANY_ADMIN", "MANAGER"],
});

export const POST = withApiHandler(handlePost, {
  requireAuth: true,
  requireTenant: true,
  allowedRoles: ["SUPER_ADMIN", "ADMIN", "COMPANY_ADMIN", "MANAGER"],
});
