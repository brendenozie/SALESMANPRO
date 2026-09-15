/**
 * lib/marketplace/linkingService.ts
 *
 * Domain Service for Product ↔ Marketplace Listing Linking, Unlinking,
 * Conflict Resolution, and Bi-directional Record Materialization.
 */

import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";
import { syncApprovedSharedFields } from "./publicationService";
import { revalidateCompanyCache } from "@/lib/company-fetcher";

export interface LinkOptions {
  companyId: string;
  listingId: string;
  productId: string;
  pricePreference?: "PRODUCT" | "LISTING";
  syncSpecs?: boolean;
}

export interface ConflictComparison {
  hasPriceConflict: boolean;
  productPrice: number;
  listingPrice: number;
  hasTitleConflict: boolean;
  productTitle: string;
  listingTitle: string;
  hasCategoryConflict: boolean;
  productCategory?: string | null;
  listingCategory?: string | null;
}

/**
 * Compares Product and Listing to detect field discrepancies before linking.
 */
export async function compareProductAndListing(
  companyId: string,
  productId: string,
  listingId: string
): Promise<{ success: boolean; error?: string; comparison?: ConflictComparison }> {
  const [product, listing] = await Promise.all([
    prisma.product.findFirst({
      where: { id: productId, companyId },
      select: {
        id: true,
        name: true,
        sellingPrice: true,
        category: true,
      },
    }),
    prisma.marketplaceListings.findFirst({
      where: { id: listingId, companyId },
      select: {
        id: true,
        name: true,
        sellingPrice: true,
        category: true,
      },
    }),
  ]);

  if (!product) return { success: false, error: "Product not found or unauthorized" };
  if (!listing) return { success: false, error: "Listing not found or unauthorized" };

  return {
    success: true,
    comparison: {
      hasPriceConflict: product.sellingPrice !== listing.sellingPrice,
      productPrice: product.sellingPrice,
      listingPrice: listing.sellingPrice,
      hasTitleConflict: product.name.trim().toLowerCase() !== listing.name.trim().toLowerCase(),
      productTitle: product.name,
      listingTitle: listing.name,
      hasCategoryConflict: (product.category || "").toLowerCase() !== (listing.category || "").toLowerCase(),
      productCategory: product.category,
      listingCategory: listing.category,
    },
  };
}

/**
 * Explicitly links an unlinked or existing MarketplaceListing to an internal Product.
 */
export async function linkListingToProduct(options: LinkOptions) {
  const { companyId, listingId, productId, pricePreference = "PRODUCT", syncSpecs = true } = options;

  const [product, listing] = await Promise.all([
    prisma.product.findFirst({
      where: { id: productId, companyId },
      include: { company: { select: { id: true, slug: true } } },
    }),
    prisma.marketplaceListings.findFirst({
      where: { id: listingId, companyId },
    }),
  ]);

  if (!product) {
    return { success: false, error: `Product ${productId} not found or unauthorized.` };
  }
  if (!listing) {
    return { success: false, error: `Listing ${listingId} not found or unauthorized.` };
  }

  // Determine derived availability: positive inventory stock
  const isAvailable = Boolean(product.isAvailable && (product.quantity ?? 0) > 0);

  // Determine pricing resolution
  const resolvedSellingPrice =
    pricePreference === "PRODUCT" ? product.sellingPrice : listing.sellingPrice;
  const resolvedFinalPrice =
    pricePreference === "PRODUCT"
      ? product.finalPrice ?? product.sellingPrice
      : listing.finalPrice ?? listing.sellingPrice;

  const updatedListing = await prisma.marketplaceListings.update({
    where: { id: listing.id },
    data: {
      product: { connect: { id: product.id } },
      sellingPrice: resolvedSellingPrice,
      finalPrice: resolvedFinalPrice,
      isAvailable,
      updatedAt: new Date(),
    },
  });

  // Synchronize technical specs from Product to Listing
  if (syncSpecs) {
    await syncApprovedSharedFields(product.id);
  }

  // Invalidate tenant and storefront caches
  await invalidateLinkingCaches(companyId, product.company?.slug);

  return {
    success: true,
    listingId: updatedListing.id,
    productId: product.id,
    resolvedPrice: resolvedSellingPrice,
  };
}

/**
 * Disconnects a MarketplaceListing from its Product without deleting either record.
 */
export async function unlinkListing(companyId: string, listingId: string) {
  const listing = await prisma.marketplaceListings.findFirst({
    where: { id: listingId, companyId },
    include: { company: { select: { id: true, slug: true } } },
  });

  if (!listing) {
    return { success: false, error: `Listing ${listingId} not found or unauthorized.` };
  }

  const updated = await prisma.marketplaceListings.update({
    where: { id: listing.id },
    data: {
      product: { disconnect: true },
      updatedAt: new Date(),
    },
  });

  await invalidateLinkingCaches(companyId, listing.company?.slug);

  return { success: true, listingId: updated.id, unlinked: true };
}

/**
 * Creates an internal inventory Product based on an unlinked MarketplaceListing.
 */
export async function createProductFromListing(
  companyId: string,
  listingId: string,
  overrides?: { costPrice?: number; initialStock?: number; sku?: string }
) {
  const listing = await prisma.marketplaceListings.findFirst({
    where: { id: listingId, companyId },
    include: { company: { select: { id: true, slug: true } } },
  });

  if (!listing) {
    return { success: false, error: `Listing ${listingId} not found or unauthorized.` };
  }

  if (listing.productId) {
    return {
      success: false,
      error: `Listing ${listingId} is already linked to Product ${listing.productId}.`,
    };
  }

  const costPrice = overrides?.costPrice ?? 0;
  const sellingPrice = listing.sellingPrice || 0;
  const quantity = overrides?.initialStock ?? listing.quantity ?? 1;
  const profitMargin =
    costPrice > 0 ? ((sellingPrice - costPrice) / costPrice) * 100 : 0;

  // Create Product in inventory
  const createdProduct = await prisma.product.create({
    data: {
      name: listing.name,
      description: listing.description,
      longDescription: listing.longDescription,
      category: listing.category,
      subCategoryName: listing.subCategoryName,
      brand: listing.brand,
      model: overrides?.sku || listing.model,
      tags: listing.tags,
      images: listing.images,
      videos: listing.videos,
      ebooks: listing.ebooks,
      color: listing.color,
      size: listing.size,
      weight: listing.weight,
      condition: listing.condition,
      dimensions: listing.dimensions,
      material: listing.material,
      quantity,
      costPrice,
      sellingPrice,
      finalPrice: listing.finalPrice ?? sellingPrice,
      profitMargin,
      isAvailable: quantity > 0,
      company: { connect: { id: companyId } },
      ...(listing.productCategoryId
        ? { productCategory: { connect: { id: listing.productCategoryId } } }
        : {}),
      status: "ACTIVE",
      listingMarketStatus: "AVAILABLE",
      listingSystemStatus: "ACTIVE",
    },
  });

  // Link the listing to the new product
  await prisma.marketplaceListings.update({
    where: { id: listing.id },
    data: {
      product: { connect: { id: createdProduct.id } },
      updatedAt: new Date(),
    },
  });

  await invalidateLinkingCaches(companyId, listing.company?.slug);

  return {
    success: true,
    productId: createdProduct.id,
    listingId: listing.id,
    product: createdProduct,
  };
}

/**
 * Searches candidates in the Product catalog to match with a listing.
 */
export async function searchLinkCandidates(
  companyId: string,
  query: string,
  limit = 10
) {
  if (!query || query.trim().length === 0) return [];

  const cleanQuery = query.trim();
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanQuery);

  const orConditions: any[] = [
    { model: { contains: cleanQuery, mode: "insensitive" } },
    { name: { contains: cleanQuery, mode: "insensitive" } },
    { brand: { contains: cleanQuery, mode: "insensitive" } },
  ];

  if (isObjectId) {
    orConditions.unshift({ id: cleanQuery });
  }

  // Search by exact ID, model (SKU), or name
  const products = await prisma.product.findMany({
    where: {
      companyId,
      OR: orConditions,
    },
    take: limit,
    select: {
      id: true,
      name: true,
      model: true,
      sellingPrice: true,
      costPrice: true,
      quantity: true,
      category: true,
      images: true,
      isAvailable: true,
    },
  });

  return products.map((p) => {
    let matchConfidence: "EXACT_ID" | "EXACT_SKU" | "NAME_SIMILAR" = "NAME_SIMILAR";
    if (p.id === cleanQuery) matchConfidence = "EXACT_ID";
    else if (p.model && p.model.toLowerCase() === cleanQuery.toLowerCase()) {
      matchConfidence = "EXACT_SKU";
    }

    return {
      ...p,
      matchConfidence,
      thumbnail: Array.isArray(p.images) && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any)?.url) : null,
    };
  });
}

async function invalidateLinkingCaches(companyId: string, slug?: string | null) {
  try {
    await cacheDel(`tenant:${companyId}:products:*`);
    await cacheDel(`tenant:${companyId}:listings:*`);
    await cacheDel(`admin:post-product:*`);
    await cacheDel(`admin:post-market-list:*`);
  } catch (err) {
    console.warn("[LINKING_CACHE_INVALIDATION_WARN]", err);
  }

  if (slug) {
    try {
      await revalidateCompanyCache(slug);
    } catch {}
  }
}
