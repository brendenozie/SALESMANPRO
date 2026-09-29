/**
 * app/api/admin/marketplace/bulk-import/route.ts
 *
 * Dedicated Bulk Import Gateway for Products, Marketplace Listings,
 * Synchronized Publishing, and Link Matching.
 */

import { formatResponse } from "@/lib/formatResponse";
import { enforceBulkProductEdit } from "@/lib/subscriptions/enforce-limits";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import {
  previewBulkImport,
  executeBulkImport,
  BulkImportMode,
} from "@/lib/marketplace/bulkImportService";

async function handleGet(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const mode = (url.searchParams.get("mode") || "PRODUCTS_ONLY") as BulkImportMode;

  if (action === "TEMPLATE") {
    let headers: string[] = [];
    let sampleRow: string[] = [];

    switch (mode) {
      case "PRODUCTS_ONLY":
        headers = ["Product Name", "SKU", "Category", "Selling Price", "Cost Price", "Stock Quantity", "Description", "Brand", "Condition"];
        sampleRow = ["Ergonomic Desk Chair", "CHAIR-001", "Furniture", "12000", "7500", "25", "High-comfort mesh office chair", "ErgoPro", "New"];
        break;
      case "MARKETPLACE_ONLY":
        headers = ["Title", "SKU", "Category", "Selling Price", "Quantity", "Description", "Image URLs", "Condition"];
        sampleRow = ["Wireless Noise Cancelling Headphones", "AUDIO-88", "Electronics", "8500", "15", "Premium sound with 30hr battery life", "https://example.com/img1.jpg", "New"];
        break;
      case "PRODUCTS_AND_PUBLISH":
        headers = ["Product Name", "SKU", "Category", "Selling Price", "Cost Price", "Stock Quantity", "Description", "Image URLs", "Brand"];
        sampleRow = ["Stainless Steel Blender", "KITCH-500", "Appliances", "6500", "3800", "40", "1000W professional kitchen blender", "https://example.com/blender.jpg", "ChefMaster"];
        break;
      case "LINK_EXISTING":
        headers = ["Listing Title", "Product SKU", "Selling Price", "Category"];
        sampleRow = ["Premium Running Shoes", "SHOE-NIKE-42", "4500", "Fashion"];
        break;
    }

    const csvContent = `${headers.join(",")}\n${sampleRow.join(",")}\n`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${mode.toLowerCase()}_template.csv"`,
      },
    });
  }

  return formatResponse(false, null, "Invalid GET request", 400);
}

async function handlePost(req: Request, context: any) {
  const companyId = context.companyId;
  if (!companyId) {
    return formatResponse(false, null, "Authorized company context required", 403);
  }

  // --- Subscription Plan Enforcement: Bulk Product Edit Gate ---
  const bulkCheck = await enforceBulkProductEdit(companyId);
  if (!bulkCheck.allowed) {
    return formatResponse(false, { upgradeRequired: bulkCheck.upgradeRequired }, bulkCheck.message, 403);
  }

  const body = await req.json().catch(() => ({}));
  const { action, mode = "PRODUCTS_ONLY", rows } = body;

  if (!Array.isArray(rows) || rows.length === 0) {
    return formatResponse(false, null, "rows[] array is required and cannot be empty", 400);
  }

  if (rows.length > 5000) {
    return formatResponse(false, null, "Maximum 5,000 rows per import batch", 413);
  }

  // 1. PREVIEW MODE
  if (action === "PREVIEW") {
    const preview = await previewBulkImport(companyId, rows, mode);
    return formatResponse(true, preview, "Import preview generated", 200);
  }

  // 2. EXECUTE MODE
  if (action === "EXECUTE") {
    const result = await executeBulkImport(companyId, rows, mode);
    const statusCode = result.success ? 200 : 207; // Multi-status if partial failures
    return formatResponse(
      result.success,
      result,
      `Import processed: ${result.createdCount} created, ${result.updatedCount} updated, ${result.linkedCount} linked, ${result.failedCount} failed`,
      statusCode
    );
  }

  return formatResponse(false, null, `Unknown bulk import action: ${action}`, 400);
}

export const GET = withApiHandler(handleGet, {
  requireAuth: true,
  requireTenant: false,
});

export const POST = withApiHandler(handlePost, {
  requireAuth: true,
  requireTenant: true,
  allowedRoles: ["SUPER_ADMIN", "ADMIN", "COMPANY_ADMIN", "MANAGER"],
  timeoutMs: 60_000, // 60s for batch processing
});
