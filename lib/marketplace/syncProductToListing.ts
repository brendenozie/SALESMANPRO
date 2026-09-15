/**
 * lib/marketplace/syncProductToListing.ts
 *
 * Compatibility and Controlled Synchronization Adapter.
 * Bridges calls to the authoritative `productListingPolicy.ts` and `publicationService.ts`.
 */

import {
  publishProductToMarketplace,
  syncApprovedSharedFields,
  unpublishListing,
  reconcileProductListing,
} from "./publicationService";
import {
  canSyncProductFieldToListing,
  sanitizePublicListingData,
} from "./productListingPolicy";
import prisma from "@/server/db/prismadb";

export interface SyncProductOptions {
  /** Optional override fields if caller has explicitly provided approved shared updates */
  overrideData?: Record<string, any>;
  /**
   * Whether to publish to marketplace if not yet published.
   * Default is FALSE to ensure internal product creation does not blindly publish.
   */
  autoCreateIfMissing?: boolean;
  /** Explicit actor or context */
  actorId?: string;
}

/**
 * Synchronizes approved shared technical specifications and derived availability
 * from internal Product to attached listings.
 * Only creates a new listing if `autoCreateIfMissing` is explicitly passed as true.
 */
export async function syncProductToMarketplaceListings(
  productId: string,
  options: SyncProductOptions = {}
) {
  const { autoCreateIfMissing = false, overrideData, actorId } = options;

  // If explicit publication is requested, use the publication service
  if (autoCreateIfMissing) {
    return publishProductToMarketplace(productId, { actorId, ...overrideData });
  }

  // Otherwise, synchronize approved shared technical fields only
  const modifiedKeys = overrideData ? Object.keys(overrideData) : undefined;
  return syncApprovedSharedFields(productId, modifiedKeys);
}

/**
 * Finds or explicitly provisions a consumer-facing listing for a product.
 */
export async function ensureMarketplaceListingForProduct(productId: string) {
  const existing = await prisma.marketplaceListings.findFirst({
    where: { productId },
  });

  if (existing) {
    return existing;
  }

  const result = await publishProductToMarketplace(productId);
  if (result.success && result.listingId) {
    return prisma.marketplaceListings.findUnique({
      where: { id: result.listingId },
    });
  }

  return null;
}

/**
 * Back-propagates changes made on a consumer listing to the parent Product.
 * Protected: NEVER overwrites internal costs, profit margins, or internal catalog prices!
 */
export async function syncListingToProduct(listingId: string) {
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: listingId },
  });

  if (!listing || !listing.productId) {
    return { success: false, error: "Listing has no linked product." };
  }

  // Only sync non-financial, non-price shared specs back to product
  const safeUpdates: Record<string, any> = {};

  if (listing.brand) safeUpdates.brand = listing.brand;
  if (listing.model) safeUpdates.model = listing.model;
  if (listing.condition) safeUpdates.condition = listing.condition;
  if (listing.dimensions) safeUpdates.dimensions = listing.dimensions;
  if (listing.weight) safeUpdates.weight = listing.weight;
  if (Array.isArray(listing.material) && listing.material.length > 0) safeUpdates.material = listing.material;
  if (Array.isArray(listing.color) && listing.color.length > 0) safeUpdates.color = listing.color;
  if (Array.isArray(listing.size) && listing.size.length > 0) safeUpdates.size = listing.size;

  if (Object.keys(safeUpdates).length > 0) {
    await prisma.product.update({
      where: { id: listing.productId },
      data: {
        ...safeUpdates,
        updatedAt: new Date(),
      },
    });
  }

  return { success: true, productId: listing.productId };
}

export {
  publishProductToMarketplace,
  unpublishListing,
  syncApprovedSharedFields,
  reconcileProductListing,
  canSyncProductFieldToListing,
  sanitizePublicListingData,
};
