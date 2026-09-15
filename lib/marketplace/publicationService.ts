/**
 * lib/marketplace/publicationService.ts
 *
 * Controlled Domain Service for Product Publication, Unpublication,
 * Availability Derivation, and Non-destructive Reconciliation.
 */

import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";
import {
  canSyncProductFieldToListing,
  sanitizePublicListingData,
  createSyncContext,
  SyncContext,
} from "./productListingPolicy";

export interface PublishOptions {
  actorId?: string;
  marketplacePrice?: number;
  customTitle?: string;
  customDescription?: string;
  showOnGhuba?: boolean;
}

/**
 * Explicitly publishes an internal Product to consumer-facing MarketplaceListings.
 * - Idempotent: If an active listing already exists, activates/refreshes it without duplication.
 * - Sanitized: Strictly strips internal costs, profit margins, and warehouse internals.
 */
export async function publishProductToMarketplace(
  productId: string,
  options: PublishOptions = {}
) {
  const syncContext = createSyncContext("PRODUCT", options.actorId);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      company: {
        select: { id: true, slug: true },
      },
    },
  });

  if (!product || !product.companyId) {
    return { success: false, error: `Product with ID ${productId} not found or has no company.` };
  }

  // Check if a listing already exists for this product
  const existingListing = await prisma.marketplaceListings.findFirst({
    where: {
      productId: product.id,
      companyId: product.companyId,
    },
  });

  // Calculate derived availability: active flag + positive stock
  const isAvailable = Boolean(product.isAvailable && (product.quantity ?? 0) > 0);

  if (existingListing) {
    // Reactivate existing listing and update availability
    const updated = await prisma.marketplaceListings.update({
      where: { id: existingListing.id },
      data: {
        status: "ACTIVE",
        listingSystemStatus: "ACTIVE",
        listingMarketStatus: "AVAILABLE",
        showOnGhuba: options.showOnGhuba ?? (product.showOnGhuba ?? true),
        isAvailable,
        ...(options.marketplacePrice != null ? { sellingPrice: options.marketplacePrice } : {}),
        ...(options.customTitle ? { name: options.customTitle } : {}),
        ...(options.customDescription ? { description: options.customDescription } : {}),
        updatedAt: new Date(),
      },
    });

    await invalidatePublicCaches(product.companyId, product.company?.slug);

    return {
      success: true,
      listingId: updated.id,
      action: "REACTIVATED",
      operationId: syncContext.operationId,
    };
  }

  // Construct sanitized initial prefill payload for new listing
  const rawInitialPayload: Record<string, any> = {
    name: options.customTitle || product.name,
    description: options.customDescription || product.description,
    longDescription: product.longDescription,
    tags: Array.isArray(product.tags) ? product.tags : [],
    brand: product.brand,
    model: product.model,
    color: Array.isArray(product.color) ? product.color : [],
    size: Array.isArray(product.size) ? product.size : [],
    weight: Array.isArray(product.weight) ? product.weight : [],
    condition: product.condition,
    dimensions: product.dimensions,
    material: Array.isArray(product.material) ? product.material : [],
    quantity: product.quantity ?? 1,
    images: Array.isArray(product.images) ? product.images : [],
    videos: Array.isArray(product.videos) ? product.videos : [],
    ebooks: Array.isArray(product.ebooks) ? product.ebooks : [],
    // Public Price: use specified marketplace price or prefill with product's sellingPrice
    sellingPrice: options.marketplacePrice != null ? options.marketplacePrice : (product.sellingPrice ?? 0),
    finalPrice: options.marketplacePrice != null ? options.marketplacePrice : (product.finalPrice ?? product.sellingPrice ?? 0),
    discount: product.discount ?? 0,
    isAvailable,
    isOnOffer: product.isOnOffer ?? false,
    isFlashDeal: product.isFlashDeal ?? false,
    isNewArrival: product.isNewArrival ?? false,
    isDiscounted: product.isDiscounted ?? false,
    isFeatured: product.isFeatured ?? false,
    startDealDate: product.startDealDate,
    endDealDate: product.endDealDate,
    category: product.category,
    subCategory: product.subCategory ?? {},
    subCategoryName: product.subCategoryName,
    // Category specific specs
    year: product.year,
    make: product.make,
    trim: product.trim,
    type: product.type,
    mileage: product.mileage,
    engineType: product.engineType,
    engineSize: product.engineSize,
    horsepower: product.horsepower,
    torque: product.torque,
    fuelType: product.fuelType,
    fuelEconomy: product.fuelEconomy,
    transmission: product.transmission,
    drivetrain: product.drivetrain,
    vin: product.vin,
    logbookStatus: product.logbookStatus,
    serviceHistory: product.serviceHistory,
    features: product.features ?? [],
    previousOwners: product.previousOwners,
    tireCondition: product.tireCondition,
    accidentalHistory: product.accidentalHistory ?? false,
    author: product.author,
    publisher: product.publisher,
    isbn: product.isbn,
    fabricComposition: product.fabricComposition,
    careInstructions: product.careInstructions,
    energyRating: product.energyRating,
    warrantyPeriod: product.warrantyPeriod,
    applianceDimensions: product.applianceDimensions,
    ingredients: product.ingredients,
    usageInstructions: product.usageInstructions,
    expirationDate: product.expirationDate,
    area: product.area,
    bedrooms: product.bedrooms ?? [],
    studios: product.studios ?? [],
    bathrooms: product.bathrooms,
    amenities: product.amenities ?? [],
    serviceSchedule: product.serviceSchedule,
    hourlyRate: product.hourlyRate,
    minimumHours: product.minimumHours,
    minNoticePeriod: product.minNoticePeriod,
    maxBookingAhead: product.maxBookingAhead,
    totalCapacity: product.totalCapacity,
    bookingSlots: product.bookingSlots ?? [],
    delivery: product.delivery ?? false,
    paymentOption: product.paymentOption || "AT SHOP",
    location: product.location,
    locationName: product.locationName,
    latitude: product.latitude,
    longitude: product.longitude,
    contact: product.contact,
    contactName: product.contactName,
    email: product.email,
  };

  // Strictly sanitize
  const sanitized = sanitizePublicListingData(rawInitialPayload);

  const createdListing = await prisma.marketplaceListings.create({
    data: {
      ...sanitized,
      subCategory: (sanitized.subCategory ?? product.subCategory ?? {}) as any,
      company: { connect: { id: product.companyId } },
      product: { connect: { id: product.id } },
      ...(product.productCategoryId
        ? { productCategory: { connect: { id: product.productCategoryId } } }
        : {}),
      status: "ACTIVE",
      listingSystemStatus: "ACTIVE",
      listingMarketStatus: "AVAILABLE",
      listingTransactionType: product.listingTransactionType || "SALE",
      showOnGhuba: options.showOnGhuba ?? (product.showOnGhuba ?? true),
      ghubaAdminApproved: true,
      ghubaStatus: "APPROVED",
      whatsappEnabled: true,
      whatsappSearchable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await invalidatePublicCaches(product.companyId, product.company?.slug);

  return {
    success: true,
    listingId: createdListing.id,
    action: "CREATED",
    operationId: syncContext.operationId,
  };
}

/**
 * Unpublishes a consumer-facing listing without deleting the underlying internal Product.
 */
export async function unpublishListing(listingId: string, reason?: string) {
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: listingId },
    include: {
      company: { select: { id: true, slug: true } },
    },
  });

  if (!listing) {
    return { success: false, error: `Listing with ID ${listingId} not found.` };
  }

  await prisma.marketplaceListings.update({
    where: { id: listingId },
    data: {
      status: "INACTIVE",
      listingSystemStatus: "INACTIVE",
      isAvailable: false,
      showOnGhuba: false,
      whatsappSearchable: false,
      updatedAt: new Date(),
    },
  });

  if (listing.companyId) {
    await invalidatePublicCaches(listing.companyId, listing.company?.slug);
  }

  return { success: true, listingId, reason };
}

/**
 * Synchronizes approved shared technical specifications and derived availability
 * from internal Product to attached listings.
 * - Does NOT overwrite listing-owned custom titles, descriptions, or prices.
 */
export async function syncApprovedSharedFields(
  productId: string,
  modifiedFieldNames?: string[],
  context?: SyncContext
) {
  const syncContext = context || createSyncContext("PRODUCT");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      company: { select: { id: true, slug: true } },
    },
  });

  if (!product) return { success: false, error: "Product not found" };

  const attachedListings = await prisma.marketplaceListings.findMany({
    where: { productId: product.id },
  });

  if (attachedListings.length === 0) {
    return { success: true, message: "No attached listings to synchronize.", syncedCount: 0 };
  }

  // Derived availability
  const isAvailable = Boolean(product.isAvailable && (product.quantity ?? 0) > 0);

  // Determine fields to sync
  const updateData: Record<string, any> = {
    isAvailable,
    updatedAt: new Date(),
  };

  const productRecord = product as Record<string, any>;
  const fieldsToCheck = modifiedFieldNames || Object.keys(productRecord);

  for (const field of fieldsToCheck) {
    if (canSyncProductFieldToListing(field, false, false)) {
      if (productRecord[field] !== undefined) {
        updateData[field] = productRecord[field];
      }
    }
  }

  const sanitizedUpdate = sanitizePublicListingData(updateData);

  for (const listing of attachedListings) {
    await prisma.marketplaceListings.update({
      where: { id: listing.id },
      data: sanitizedUpdate,
    });
  }

  if (product.companyId) {
    await invalidatePublicCaches(product.companyId, product.company?.slug);
  }

  return {
    success: true,
    syncedCount: attachedListings.length,
    operationId: syncContext.operationId,
  };
}

/**
 * Derives and updates public listing availability based on internal inventory stock.
 */
export async function resolveListingAvailability(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isAvailable: true, quantity: true, companyId: true },
  });

  if (!product) return;

  const isAvailable = Boolean(product.isAvailable && (product.quantity ?? 0) > 0);

  await prisma.marketplaceListings.updateMany({
    where: { productId: product.id },
    data: {
      isAvailable,
      updatedAt: new Date(),
    },
  });

  if (product.companyId) {
    await cacheDel(`tenant:${product.companyId}:products:*`);
  }
}

/**
 * Non-destructive reconciliation diagnostic reporting mismatches between
 * Products and MarketplaceListings.
 */
export async function reconcileProductListing(companyId: string) {
  const [products, listings] = await Promise.all([
    prisma.product.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        costPrice: true,
        sellingPrice: true,
        quantity: true,
        isAvailable: true,
        showOnGhuba: true,
      },
    }),
    prisma.marketplaceListings.findMany({
      where: { companyId },
      select: {
        id: true,
        productId: true,
        name: true,
        sellingPrice: true,
        status: true,
        isAvailable: true,
        showOnGhuba: true,
      },
    }),
  ]);

  const listingByProductId = new Map<string, typeof listings[0]>();
  const orphanedListings: typeof listings = [];

  for (const listing of listings) {
    if (listing.productId) {
      listingByProductId.set(listing.productId, listing);
    } else {
      orphanedListings.push(listing);
    }
  }

  const unlistedProducts = products.filter((p) => !listingByProductId.has(p.id));
  const priceDivergences: Array<{
    productId: string;
    listingId: string;
    productSellingPrice: number;
    listingSellingPrice: number;
    differenceType: "INTENTIONAL_CHANNEL_PRICE" | "SYNC_CANDIDATE";
  }> = [];

  for (const product of products) {
    const listing = listingByProductId.get(product.id);
    if (listing) {
      if (product.sellingPrice !== listing.sellingPrice) {
        priceDivergences.push({
          productId: product.id,
          listingId: listing.id,
          productSellingPrice: product.sellingPrice,
          listingSellingPrice: listing.sellingPrice,
          differenceType: "INTENTIONAL_CHANNEL_PRICE",
        });
      }
    }
  }

  return {
    companyId,
    totalProducts: products.length,
    totalListings: listings.length,
    unlistedProductsCount: unlistedProducts.length,
    orphanedListingsCount: orphanedListings.length,
    priceDivergenceCount: priceDivergences.length,
    unlistedProducts: unlistedProducts.map((p) => ({ id: p.id, name: p.name, quantity: p.quantity })),
    orphanedListings: orphanedListings.map((l) => ({ id: l.id, name: l.name })),
    priceDivergences,
  };
}

/**
 * Invalidates tenant and public storefront caches safely.
 */
async function invalidatePublicCaches(companyId: string, slug?: string | null) {
  try {
    await cacheDel(`tenant:${companyId}:products:*`);
    await cacheDel(`tenant:${companyId}:admin_products:*`);
    await cacheDel(`tenant:${companyId}:listings:*`);
    await cacheDel(`tenant:${companyId}:bulk-create:*`);
  } catch (err) {
    console.warn("[CACHE_DEL_ERROR]", err);
  }

  if (slug) {
    try {
      const { revalidateCompanyCache } = await import("@/lib/company-fetcher");
      await revalidateCompanyCache(slug);
    } catch {
      // Safe fallback outside Next.js request context
    }
  }
}
