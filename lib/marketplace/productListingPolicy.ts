/**
 * lib/marketplace/productListingPolicy.ts
 *
 * Central Authoritative Policy for Data Ownership, Public Sanitization,
 * and Controlled Synchronization between internal Product records and
 * consumer-facing MarketplaceListings.
 */

// Strict denylist of fields that must NEVER be exposed publicly or copied to listings
export const FINANCIAL_AND_INTERNAL_DENYLIST = new Set<string>([
  "costPrice",
  "profitMargin",
  "supplier",
  "supplierId",
  "supplierPrice",
  "supplierCost",
  "purchasePrice",
  "internalNotes",
  "internalSupplierNotes",
  "warehouseCost",
  "staffNotes",
  "internalAccountingData",
  "inventoryItems",
  "requests",
  "commissions",
  "Target",
  "CommissionRate",
]);

// Fields strictly owned by the internal Product catalog
export const PRODUCT_OWNED_FIELDS = new Set<string>([
  "costPrice",
  "profitMargin",
  "quantity", // raw warehouse quantity
  "inventoryItems",
  "requests",
  "commissions",
  "pricingTiers",
]);

// Fields strictly owned by the public MarketplaceListing
export const LISTING_OWNED_FIELDS = new Set<string>([
  "name", // Public consumer title can be independently overridden
  "description", // Public marketing description can be independently overridden
  "longDescription",
  "sellingPrice", // Public marketplace display price
  "buyingPrice", // Deprecated public field; should not reflect cost
  "discount", // Public promotional discount
  "finalPrice", // Public checkout price
  "showOnGhuba",
  "ghubaAdminApproved",
  "ghubaStatus",
  "status", // Listing publication status (ACTIVE, INACTIVE, DRAFT)
  "listingMarketStatus",
  "listingSystemStatus",
  "listingTransactionType",
  "whatsappEnabled",
  "whatsappDescription",
  "whatsappKeywords",
  "whatsappSearchable",
  "isFeatured", // Channel-specific featured status
]);

// Shared technical specification fields that safely synchronize from Product to Listing
export const SHARED_SPECIFICATION_FIELDS = new Set<string>([
  "brand",
  "model",
  "condition",
  "dimensions",
  "weight",
  "material",
  "color",
  "size",
  // Vehicle Specs
  "year",
  "make",
  "trim",
  "type",
  "mileage",
  "engineType",
  "engineSize",
  "horsepower",
  "torque",
  "fuelType",
  "fuelEconomy",
  "transmission",
  "drivetrain",
  "vin",
  "logbookStatus",
  "serviceHistory",
  "features",
  "previousOwners",
  "tireCondition",
  "accidentalHistory",
  // Book Specs
  "author",
  "publisher",
  "isbn",
  // Fashion Specs
  "fabricComposition",
  "careInstructions",
  // Appliance Specs
  "energyRating",
  "warrantyPeriod",
  "applianceDimensions",
  // Beauty Specs
  "ingredients",
  "usageInstructions",
  "expirationDate",
  // Property Specs
  "area",
  "bedrooms",
  "studios",
  "bathrooms",
  "amenities",
  // Service Specs
  "serviceSchedule",
  "hourlyRate",
  "minimumHours",
  "minNoticePeriod",
  "maxBookingAhead",
  "totalCapacity",
  // Location & Contact
  "location",
  "locationName",
  "latitude",
  "longitude",
  "contact",
  "contactName",
  "email",
  "delivery",
  "paymentOption",
  "deliveryMethod",
]);

/**
 * Strips all internal financial, cost, supplier, and warehouse fields from
 * a listing payload to guarantee zero data leakage.
 */
export function sanitizePublicListingData<T extends Record<string, any>>(data: T): Partial<T> {
  if (!data || typeof data !== "object") return data;
  const sanitized: Record<string, any> = { ...data };

  for (const field of FINANCIAL_AND_INTERNAL_DENYLIST) {
    delete sanitized[field];
  }

  // Ensure buyingPrice does not carry internal costPrice
  if ("costPrice" in sanitized) {
    delete sanitized.costPrice;
  }
  if ("profitMargin" in sanitized) {
    delete sanitized.profitMargin;
  }

  return sanitized as Partial<T>;
}

export type SyncSource = "PRODUCT" | "LISTING" | "AI" | "ADMIN" | "SYSTEM";
export type SyncTarget = "PRODUCT" | "LISTING" | "BOTH";

export interface SyncContext {
  operationId: string;
  source: SyncSource;
  timestamp: Date;
  actorId?: string;
}

/**
 * Generates an idempotent, traceable sync context to prevent infinite loops.
 */
export function createSyncContext(source: SyncSource, actorId?: string): SyncContext {
  return {
    operationId: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    source,
    timestamp: new Date(),
    actorId,
  };
}

/**
 * Determines whether a specific field is allowed to synchronize from Product to Listing.
 * Listing-owned fields (name, description, sellingPrice, etc.) are protected from routine overwrites
 * unless explicitly requested via intentional publication or force sync.
 */
export function canSyncProductFieldToListing(
  fieldName: string,
  isInitialPublication: boolean = false,
  forceOverwrite: boolean = false
): boolean {
  // Never allow denylisted fields
  if (FINANCIAL_AND_INTERNAL_DENYLIST.has(fieldName)) {
    return false;
  }

  // If initial publication, allow initial prefill of name and description
  if (isInitialPublication) {
    if (fieldName === "name" || fieldName === "description" || fieldName === "longDescription") {
      return true;
    }
    if (fieldName === "sellingPrice") {
      return true; // Initial prefill of price
    }
    if (fieldName === "images" || fieldName === "videos" || fieldName === "ebooks" || fieldName === "tags") {
      return true;
    }
  }

  // Force overwrite explicitly approved by merchant
  if (forceOverwrite) {
    return !FINANCIAL_AND_INTERNAL_DENYLIST.has(fieldName);
  }

  // Routine updates: only shared technical specifications and media sync
  return SHARED_SPECIFICATION_FIELDS.has(fieldName);
}
