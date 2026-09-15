/**
 * lib/marketplace/bulkImportService.ts
 *
 * Enterprise Bulk Import Pipeline supporting Products, Marketplace Listings,
 * Combined Publishing, and Link Matching with Dry-run Previews, Row Validation,
 * and Partial Failure Isolation.
 */

import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";
import { publishProductToMarketplace } from "./publicationService";
import { linkListingToProduct } from "./linkingService";

export type BulkImportMode =
  | "PRODUCTS_ONLY"
  | "MARKETPLACE_ONLY"
  | "PRODUCTS_AND_PUBLISH"
  | "LINK_EXISTING";

export interface RawImportRow {
  name?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  description?: string;
  sellingPrice?: number | string;
  costPrice?: number | string;
  quantity?: number | string;
  images?: string | string[];
  brand?: string;
  color?: string | string[];
  material?: string | string[];
  size?: string | string[];
  condition?: string;
  id?: string; // Optional for updates
  [key: string]: any;
}

export interface NormalizedRow {
  rowNumber: number;
  name: string;
  sku: string;
  category: string;
  description: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  images: string[];
  brand: string;
  color: string[];
  material: string[];
  size: string[];
  condition: string;
  id?: string;
  actionIntent: "CREATE" | "UPDATE" | "LINK";
  targetId?: string;
}

export interface RowValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportPreviewResult {
  totalRows: number;
  validRowsCount: number;
  errorRowsCount: number;
  createCount: number;
  updateCount: number;
  linkCount: number;
  errors: RowValidationError[];
  sampleRows: Array<{
    rowNumber: number;
    name: string;
    sku: string;
    sellingPrice: number;
    actionIntent: "CREATE" | "UPDATE" | "LINK";
  }>;
}

export interface ImportExecutionResult {
  success: boolean;
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  linkedCount: number;
  failedCount: number;
  failedRows: Array<{ row: number; name: string; sku?: string; reason: string }>;
}

/**
 * Normalizes a raw imported row from CSV/Excel into structured, typed data.
 */
export function normalizeImportRow(raw: RawImportRow, index: number): NormalizedRow {
  const rowNumber = index + 1;
  const name = String(raw.name || raw["Product Name"] || raw["Item Name"] || raw.Title || "").trim();
  const sku = String(raw.sku || raw.SKU || raw.model || raw.Model || "").trim();
  const category = String(raw.category || raw.Category || raw["Product Category"] || "General").trim();
  const description = String(raw.description || raw.Description || "").trim();

  const parseNum = (val: any, fallback = 0): number => {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string") {
      const cleaned = val.replace(/[^0-9.-]+/g, "");
      const n = parseFloat(cleaned);
      return isNaN(n) ? fallback : n;
    }
    return fallback;
  };

  const sellingPrice = parseNum(raw.sellingPrice || raw.Price || raw["Selling Price"] || raw["selling price"]);
  const costPrice = parseNum(raw.costPrice || raw.Cost || raw["Cost Price"] || raw["buying price"]);
  const quantity = Math.max(0, Math.floor(parseNum(raw.quantity || raw.Stock || raw.Qty || raw["Stock Quantity"], 1)));

  // Normalize images
  let images: string[] = [];
  const rawImages = raw.images || raw.Image || raw.Images || raw.ImageSource || raw["Image URLs"];
  if (Array.isArray(rawImages)) {
    images = rawImages.map(String).filter((url) => url.startsWith("http"));
  } else if (typeof rawImages === "string" && rawImages.trim().length > 0) {
    images = rawImages
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((url) => url.startsWith("http"));
  }

  const normalizeList = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean);
    if (typeof val === "string") {
      return val.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  return {
    rowNumber,
    name,
    sku,
    category,
    description,
    sellingPrice,
    costPrice,
    quantity,
    images,
    brand: String(raw.brand || raw.Brand || "").trim(),
    color: normalizeList(raw.color || raw.Color),
    material: normalizeList(raw.material || raw.Material),
    size: normalizeList(raw.size || raw.Size),
    condition: String(raw.condition || raw.Condition || "New").trim(),
    id: raw.id ? String(raw.id).trim() : undefined,
    actionIntent: "CREATE",
  };
}

/**
 * Validates normalized rows and detects data issues before any database writes.
 */
export function validateImportRows(
  rows: NormalizedRow[],
  mode: BulkImportMode
): { validRows: NormalizedRow[]; errors: RowValidationError[] } {
  const errors: RowValidationError[] = [];
  const validRows: NormalizedRow[] = [];
  const seenSkus = new Set<string>();

  rows.forEach((row) => {
    let rowHasError = false;

    if (!row.name || row.name.length < 2) {
      errors.push({ row: row.rowNumber, field: "name", message: "Product name must be at least 2 characters" });
      rowHasError = true;
    }

    if (row.sellingPrice < 0 || isNaN(row.sellingPrice)) {
      errors.push({ row: row.rowNumber, field: "sellingPrice", message: "Selling price cannot be negative" });
      rowHasError = true;
    }

    if (mode === "PRODUCTS_ONLY" || mode === "PRODUCTS_AND_PUBLISH") {
      if (row.quantity < 0 || isNaN(row.quantity)) {
        errors.push({ row: row.rowNumber, field: "quantity", message: "Quantity cannot be negative" });
        rowHasError = true;
      }
    }

    // Check duplicate SKU inside the batch itself
    if (row.sku) {
      const lowerSku = row.sku.toLowerCase();
      if (seenSkus.has(lowerSku)) {
        errors.push({
          row: row.rowNumber,
          field: "sku",
          message: `Duplicate SKU '${row.sku}' in spreadsheet`,
        });
        rowHasError = true;
      } else {
        seenSkus.add(lowerSku);
      }
    }

    if (!rowHasError) {
      validRows.push(row);
    }
  });

  return { validRows, errors };
}

/**
 * Generates a preview analysis against current database records without modifying anything.
 */
export async function previewBulkImport(
  companyId: string,
  rawRows: RawImportRow[],
  mode: BulkImportMode
): Promise<ImportPreviewResult> {
  const normalized = rawRows.map((r, i) => normalizeImportRow(r, i));
  const { validRows, errors } = validateImportRows(normalized, mode);

  // Check matching against existing products
  const skus = validRows.map((r) => r.sku).filter(Boolean);
  const ids = validRows.map((r) => r.id).filter(Boolean) as string[];

  const existingProducts = await prisma.product.findMany({
    where: {
      companyId,
      OR: [
        { model: { in: skus } },
        { id: { in: ids } },
      ],
    },
    select: { id: true, model: true, name: true },
  });

  const productSkuMap = new Map<string, string>();
  const productIdSet = new Set<string>();

  existingProducts.forEach((p) => {
    if (p.model) productSkuMap.set(p.model.toLowerCase(), p.id);
    productIdSet.add(p.id);
  });

  let createCount = 0;
  let updateCount = 0;
  let linkCount = 0;

  validRows.forEach((row) => {
    const matchedId =
      (row.id && productIdSet.has(row.id) ? row.id : undefined) ||
      (row.sku ? productSkuMap.get(row.sku.toLowerCase()) : undefined);

    if (mode === "LINK_EXISTING") {
      if (matchedId) {
        row.actionIntent = "LINK";
        row.targetId = matchedId;
        linkCount++;
      } else {
        errors.push({
          row: row.rowNumber,
          field: "sku",
          message: `No matching product found in inventory for SKU '${row.sku}'`,
        });
      }
    } else {
      if (matchedId) {
        row.actionIntent = "UPDATE";
        row.targetId = matchedId;
        updateCount++;
      } else {
        row.actionIntent = "CREATE";
        createCount++;
      }
    }
  });

  return {
    totalRows: rawRows.length,
    validRowsCount: validRows.length,
    errorRowsCount: errors.length,
    createCount,
    updateCount,
    linkCount,
    errors,
    sampleRows: validRows.slice(0, 10).map((r) => ({
      rowNumber: r.rowNumber,
      name: r.name,
      sku: r.sku,
      sellingPrice: r.sellingPrice,
      actionIntent: r.actionIntent,
    })),
  };
}

/**
 * Executes the bulk import in batches of 50 with partial error isolation.
 */
export async function executeBulkImport(
  companyId: string,
  rawRows: RawImportRow[],
  mode: BulkImportMode
): Promise<ImportExecutionResult> {
  const normalized = rawRows.map((r, i) => normalizeImportRow(r, i));
  const { validRows, errors } = validateImportRows(normalized, mode);

  let createdCount = 0;
  let updatedCount = 0;
  let linkedCount = 0;
  const failedRows: Array<{ row: number; name: string; sku?: string; reason: string }> = errors.map((e) => ({
    row: e.row,
    name: "Row " + e.row,
    reason: `${e.field}: ${e.message}`,
  }));

  const BATCH_SIZE = 50;

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);

    for (const row of batch) {
      try {
        if (mode === "PRODUCTS_ONLY" || mode === "PRODUCTS_AND_PUBLISH") {
          let productId = row.id && /^[0-9a-fA-F]{24}$/.test(row.id) ? row.id : undefined;

          // Check for existing by SKU
          if (!productId && row.sku) {
            const existing = await prisma.product.findFirst({
              where: { companyId, model: row.sku },
              select: { id: true },
            });
            if (existing) productId = existing.id;
          }

          let savedProduct;

          if (productId) {
            // Update existing
            savedProduct = await prisma.product.update({
              where: { id: productId },
              data: {
                name: row.name,
                category: row.category,
                description: row.description || undefined,
                sellingPrice: row.sellingPrice,
                costPrice: row.costPrice,
                finalPrice: row.sellingPrice,
                quantity: row.quantity,
                brand: row.brand || undefined,
                color: row.color.length ? row.color : undefined,
                material: row.material.length ? row.material : undefined,
                size: row.size.length ? row.size : undefined,
                condition: row.condition || undefined,
                ...(row.images.length > 0 ? { images: row.images } : {}),
                isAvailable: row.quantity > 0,
                updatedAt: new Date(),
              },
            });
            updatedCount++;
          } else {
            // Create new
            savedProduct = await prisma.product.create({
              data: {
                company: { connect: { id: companyId } },
                name: row.name,
                model: row.sku || undefined,
                category: row.category,
                description: row.description || null,
                sellingPrice: row.sellingPrice,
                costPrice: row.costPrice,
                finalPrice: row.sellingPrice,
                quantity: row.quantity,
                brand: row.brand || null,
                color: row.color,
                material: row.material,
                size: row.size,
                condition: row.condition,
                images: row.images,
                isAvailable: row.quantity > 0,
                status: "ACTIVE",
                listingMarketStatus: "AVAILABLE",
                listingSystemStatus: "ACTIVE",
              },
            });
            createdCount++;
          }

          // If mode requires immediate marketplace publication:
          if (mode === "PRODUCTS_AND_PUBLISH" && savedProduct) {
            await publishProductToMarketplace(savedProduct.id, {
              marketplacePrice: row.sellingPrice,
              showOnGhuba: true,
            });
            linkedCount++;
          }
        } else if (mode === "MARKETPLACE_ONLY") {
          // Ingest unlinked marketplace listings
          await prisma.marketplaceListings.create({
            data: {
              company: { connect: { id: companyId } },
              name: row.name,
              category: row.category,
              subCategory: {},
              description: row.description || null,
              sellingPrice: row.sellingPrice,
              finalPrice: row.sellingPrice,
              quantity: row.quantity,
              brand: row.brand || null,
              model: row.sku || null,
              color: row.color,
              material: row.material,
              size: row.size,
              condition: row.condition,
              images: row.images,
              isAvailable: row.quantity > 0,
              showOnGhuba: true,
              status: "ACTIVE",
              listingMarketStatus: "AVAILABLE",
              listingSystemStatus: "ACTIVE",
            },
          });
          createdCount++;
        } else if (mode === "LINK_EXISTING") {
          let targetProductId = row.targetId;
          if (!targetProductId) {
            if (row.id && /^[0-9a-fA-F]{24}$/.test(row.id)) {
              targetProductId = row.id;
            } else if (row.sku) {
              const matchedProd = await prisma.product.findFirst({
                where: { companyId, model: row.sku },
                select: { id: true },
              });
              if (matchedProd) targetProductId = matchedProd.id;
            }
          }

          if (!targetProductId) {
            throw new Error(`Target product not found in inventory for SKU '${row.sku || row.name}'`);
          }

          // Find or create listing and link
          let existingListing = await prisma.marketplaceListings.findFirst({
            where: {
              companyId,
              OR: [
                ...(row.sku ? [{ model: row.sku }] : []),
                { name: row.name },
              ],
            },
            select: { id: true },
          });

          if (!existingListing) {
            existingListing = await prisma.marketplaceListings.create({
              data: {
                company: { connect: { id: companyId } },
                name: row.name,
                category: row.category,
                subCategory: {},
                sellingPrice: row.sellingPrice,
                finalPrice: row.sellingPrice,
                quantity: row.quantity,
                images: row.images,
                status: "ACTIVE",
              },
              select: { id: true },
            });
          }

          await linkListingToProduct({
            companyId,
            listingId: existingListing.id,
            productId: targetProductId,
            pricePreference: "PRODUCT",
          });
          linkedCount++;
        }
      } catch (err: any) {
        failedRows.push({
          row: row.rowNumber,
          name: row.name,
          sku: row.sku,
          reason: err?.message || "Internal database write error",
        });
      }
    }
  }

  // Bust caches after bulk import
  try {
    await cacheDel(`tenant:${companyId}:products:*`);
    await cacheDel(`tenant:${companyId}:listings:*`);
    await cacheDel(`tenant:${companyId}:bulk-create:*`);
    await cacheDel(`admin:post-product:*`);
  } catch (err) {}

  return {
    success: createdCount > 0 || updatedCount > 0 || linkedCount > 0 || failedRows.length === 0,
    totalProcessed: rawRows.length,
    createdCount,
    updatedCount,
    linkedCount,
    failedCount: failedRows.length,
    failedRows,
  };
}
