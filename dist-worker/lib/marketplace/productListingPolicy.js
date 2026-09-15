"use strict";
/**
 * lib/marketplace/productListingPolicy.ts
 *
 * Central Authoritative Policy for Data Ownership, Public Sanitization,
 * and Controlled Synchronization between internal Product records and
 * consumer-facing MarketplaceListings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.canSyncProductFieldToListing = exports.createSyncContext = exports.sanitizePublicListingData = exports.SHARED_SPECIFICATION_FIELDS = exports.LISTING_OWNED_FIELDS = exports.PRODUCT_OWNED_FIELDS = exports.FINANCIAL_AND_INTERNAL_DENYLIST = void 0;
// Strict denylist of fields that must NEVER be exposed publicly or copied to listings
exports.FINANCIAL_AND_INTERNAL_DENYLIST = new Set([
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
exports.PRODUCT_OWNED_FIELDS = new Set([
    "costPrice",
    "profitMargin",
    "quantity",
    "inventoryItems",
    "requests",
    "commissions",
    "pricingTiers",
]);
// Fields strictly owned by the public MarketplaceListing
exports.LISTING_OWNED_FIELDS = new Set([
    "name",
    "description",
    "longDescription",
    "sellingPrice",
    "buyingPrice",
    "discount",
    "finalPrice",
    "showOnGhuba",
    "ghubaAdminApproved",
    "ghubaStatus",
    "status",
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
exports.SHARED_SPECIFICATION_FIELDS = new Set([
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
function sanitizePublicListingData(data) {
    if (!data || typeof data !== "object")
        return data;
    const sanitized = { ...data };
    for (const field of exports.FINANCIAL_AND_INTERNAL_DENYLIST) {
        delete sanitized[field];
    }
    // Ensure buyingPrice does not carry internal costPrice
    if ("costPrice" in sanitized) {
        delete sanitized.costPrice;
    }
    if ("profitMargin" in sanitized) {
        delete sanitized.profitMargin;
    }
    return sanitized;
}
exports.sanitizePublicListingData = sanitizePublicListingData;
/**
 * Generates an idempotent, traceable sync context to prevent infinite loops.
 */
function createSyncContext(source, actorId) {
    return {
        operationId: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        source,
        timestamp: new Date(),
        actorId,
    };
}
exports.createSyncContext = createSyncContext;
/**
 * Determines whether a specific field is allowed to synchronize from Product to Listing.
 * Listing-owned fields (name, description, sellingPrice, etc.) are protected from routine overwrites
 * unless explicitly requested via intentional publication or force sync.
 */
function canSyncProductFieldToListing(fieldName, isInitialPublication = false, forceOverwrite = false) {
    // Never allow denylisted fields
    if (exports.FINANCIAL_AND_INTERNAL_DENYLIST.has(fieldName)) {
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
        return !exports.FINANCIAL_AND_INTERNAL_DENYLIST.has(fieldName);
    }
    // Routine updates: only shared technical specifications and media sync
    return exports.SHARED_SPECIFICATION_FIELDS.has(fieldName);
}
exports.canSyncProductFieldToListing = canSyncProductFieldToListing;
