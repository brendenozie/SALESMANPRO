"use strict";
/**
 * lib/marketplace/syncProductToListing.ts
 *
 * Compatibility and Controlled Synchronization Adapter.
 * Bridges calls to the authoritative `productListingPolicy.ts` and `publicationService.ts`.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePublicListingData = exports.canSyncProductFieldToListing = exports.reconcileProductListing = exports.syncApprovedSharedFields = exports.unpublishListing = exports.publishProductToMarketplace = exports.syncListingToProduct = exports.ensureMarketplaceListingForProduct = exports.syncProductToMarketplaceListings = void 0;
const publicationService_1 = require("./publicationService");
Object.defineProperty(exports, "publishProductToMarketplace", { enumerable: true, get: function () { return publicationService_1.publishProductToMarketplace; } });
Object.defineProperty(exports, "syncApprovedSharedFields", { enumerable: true, get: function () { return publicationService_1.syncApprovedSharedFields; } });
Object.defineProperty(exports, "unpublishListing", { enumerable: true, get: function () { return publicationService_1.unpublishListing; } });
Object.defineProperty(exports, "reconcileProductListing", { enumerable: true, get: function () { return publicationService_1.reconcileProductListing; } });
const productListingPolicy_1 = require("./productListingPolicy");
Object.defineProperty(exports, "canSyncProductFieldToListing", { enumerable: true, get: function () { return productListingPolicy_1.canSyncProductFieldToListing; } });
Object.defineProperty(exports, "sanitizePublicListingData", { enumerable: true, get: function () { return productListingPolicy_1.sanitizePublicListingData; } });
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
/**
 * Synchronizes approved shared technical specifications and derived availability
 * from internal Product to attached listings.
 * Only creates a new listing if `autoCreateIfMissing` is explicitly passed as true.
 */
async function syncProductToMarketplaceListings(productId, options = {}) {
    const { autoCreateIfMissing = false, overrideData, actorId } = options;
    // If explicit publication is requested, use the publication service
    if (autoCreateIfMissing) {
        return (0, publicationService_1.publishProductToMarketplace)(productId, { actorId, ...overrideData });
    }
    // Otherwise, synchronize approved shared technical fields only
    const modifiedKeys = overrideData ? Object.keys(overrideData) : undefined;
    return (0, publicationService_1.syncApprovedSharedFields)(productId, modifiedKeys);
}
exports.syncProductToMarketplaceListings = syncProductToMarketplaceListings;
/**
 * Finds or explicitly provisions a consumer-facing listing for a product.
 */
async function ensureMarketplaceListingForProduct(productId) {
    const existing = await prismadb_1.default.marketplaceListings.findFirst({
        where: { productId },
    });
    if (existing) {
        return existing;
    }
    const result = await (0, publicationService_1.publishProductToMarketplace)(productId);
    if (result.success && result.listingId) {
        return prismadb_1.default.marketplaceListings.findUnique({
            where: { id: result.listingId },
        });
    }
    return null;
}
exports.ensureMarketplaceListingForProduct = ensureMarketplaceListingForProduct;
/**
 * Back-propagates changes made on a consumer listing to the parent Product.
 * Protected: NEVER overwrites internal costs, profit margins, or internal catalog prices!
 */
async function syncListingToProduct(listingId) {
    const listing = await prismadb_1.default.marketplaceListings.findUnique({
        where: { id: listingId },
    });
    if (!listing || !listing.productId) {
        return { success: false, error: "Listing has no linked product." };
    }
    // Only sync non-financial, non-price shared specs back to product
    const safeUpdates = {};
    if (listing.brand)
        safeUpdates.brand = listing.brand;
    if (listing.model)
        safeUpdates.model = listing.model;
    if (listing.condition)
        safeUpdates.condition = listing.condition;
    if (listing.dimensions)
        safeUpdates.dimensions = listing.dimensions;
    if (listing.weight)
        safeUpdates.weight = listing.weight;
    if (Array.isArray(listing.material) && listing.material.length > 0)
        safeUpdates.material = listing.material;
    if (Array.isArray(listing.color) && listing.color.length > 0)
        safeUpdates.color = listing.color;
    if (Array.isArray(listing.size) && listing.size.length > 0)
        safeUpdates.size = listing.size;
    if (Object.keys(safeUpdates).length > 0) {
        await prismadb_1.default.product.update({
            where: { id: listing.productId },
            data: {
                ...safeUpdates,
                updatedAt: new Date(),
            },
        });
    }
    return { success: true, productId: listing.productId };
}
exports.syncListingToProduct = syncListingToProduct;
