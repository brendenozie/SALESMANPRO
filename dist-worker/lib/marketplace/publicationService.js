"use strict";
/**
 * lib/marketplace/publicationService.ts
 *
 * Controlled Domain Service for Product Publication, Unpublication,
 * Availability Derivation, and Non-destructive Reconciliation.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileProductListing = exports.resolveListingAvailability = exports.syncApprovedSharedFields = exports.unpublishListing = exports.publishProductToMarketplace = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const cache_1 = require("@/lib/cache");
const productListingPolicy_1 = require("./productListingPolicy");
/**
 * Explicitly publishes an internal Product to consumer-facing MarketplaceListings.
 * - Idempotent: If an active listing already exists, activates/refreshes it without duplication.
 * - Sanitized: Strictly strips internal costs, profit margins, and warehouse internals.
 */
async function publishProductToMarketplace(productId, options = {}) {
    const syncContext = (0, productListingPolicy_1.createSyncContext)("PRODUCT", options.actorId);
    const product = await prismadb_1.default.product.findUnique({
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
    const existingListing = await prismadb_1.default.marketplaceListings.findFirst({
        where: {
            productId: product.id,
            companyId: product.companyId,
        },
    });
    // Calculate derived availability: active flag + positive stock
    const isAvailable = Boolean(product.isAvailable && (product.quantity ?? 0) > 0);
    if (existingListing) {
        // Reactivate existing listing and update availability
        const updated = await prismadb_1.default.marketplaceListings.update({
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
    const rawInitialPayload = {
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
    const sanitized = (0, productListingPolicy_1.sanitizePublicListingData)(rawInitialPayload);
    const createdListing = await prismadb_1.default.marketplaceListings.create({
        data: {
            ...sanitized,
            subCategory: (sanitized.subCategory ?? product.subCategory ?? {}),
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
exports.publishProductToMarketplace = publishProductToMarketplace;
/**
 * Unpublishes a consumer-facing listing without deleting the underlying internal Product.
 */
async function unpublishListing(listingId, reason) {
    const listing = await prismadb_1.default.marketplaceListings.findUnique({
        where: { id: listingId },
        include: {
            company: { select: { id: true, slug: true } },
        },
    });
    if (!listing) {
        return { success: false, error: `Listing with ID ${listingId} not found.` };
    }
    await prismadb_1.default.marketplaceListings.update({
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
exports.unpublishListing = unpublishListing;
/**
 * Synchronizes approved shared technical specifications and derived availability
 * from internal Product to attached listings.
 * - Does NOT overwrite listing-owned custom titles, descriptions, or prices.
 */
async function syncApprovedSharedFields(productId, modifiedFieldNames, context) {
    const syncContext = context || (0, productListingPolicy_1.createSyncContext)("PRODUCT");
    const product = await prismadb_1.default.product.findUnique({
        where: { id: productId },
        include: {
            company: { select: { id: true, slug: true } },
        },
    });
    if (!product)
        return { success: false, error: "Product not found" };
    const attachedListings = await prismadb_1.default.marketplaceListings.findMany({
        where: { productId: product.id },
    });
    if (attachedListings.length === 0) {
        return { success: true, message: "No attached listings to synchronize.", syncedCount: 0 };
    }
    // Derived availability
    const isAvailable = Boolean(product.isAvailable && (product.quantity ?? 0) > 0);
    // Determine fields to sync
    const updateData = {
        isAvailable,
        updatedAt: new Date(),
    };
    const productRecord = product;
    const fieldsToCheck = modifiedFieldNames || Object.keys(productRecord);
    for (const field of fieldsToCheck) {
        if ((0, productListingPolicy_1.canSyncProductFieldToListing)(field, false, false)) {
            if (productRecord[field] !== undefined) {
                updateData[field] = productRecord[field];
            }
        }
    }
    const sanitizedUpdate = (0, productListingPolicy_1.sanitizePublicListingData)(updateData);
    for (const listing of attachedListings) {
        await prismadb_1.default.marketplaceListings.update({
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
exports.syncApprovedSharedFields = syncApprovedSharedFields;
/**
 * Derives and updates public listing availability based on internal inventory stock.
 */
async function resolveListingAvailability(productId) {
    const product = await prismadb_1.default.product.findUnique({
        where: { id: productId },
        select: { id: true, isAvailable: true, quantity: true, companyId: true },
    });
    if (!product)
        return;
    const isAvailable = Boolean(product.isAvailable && (product.quantity ?? 0) > 0);
    await prismadb_1.default.marketplaceListings.updateMany({
        where: { productId: product.id },
        data: {
            isAvailable,
            updatedAt: new Date(),
        },
    });
    if (product.companyId) {
        await (0, cache_1.cacheDel)(`tenant:${product.companyId}:products:*`);
    }
}
exports.resolveListingAvailability = resolveListingAvailability;
/**
 * Non-destructive reconciliation diagnostic reporting mismatches between
 * Products and MarketplaceListings.
 */
async function reconcileProductListing(companyId) {
    const [products, listings] = await Promise.all([
        prismadb_1.default.product.findMany({
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
        prismadb_1.default.marketplaceListings.findMany({
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
    const listingByProductId = new Map();
    const orphanedListings = [];
    for (const listing of listings) {
        if (listing.productId) {
            listingByProductId.set(listing.productId, listing);
        }
        else {
            orphanedListings.push(listing);
        }
    }
    const unlistedProducts = products.filter((p) => !listingByProductId.has(p.id));
    const priceDivergences = [];
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
exports.reconcileProductListing = reconcileProductListing;
/**
 * Invalidates tenant and public storefront caches safely.
 */
async function invalidatePublicCaches(companyId, slug) {
    try {
        await (0, cache_1.cacheDel)(`tenant:${companyId}:products:*`);
        await (0, cache_1.cacheDel)(`tenant:${companyId}:admin_products:*`);
        await (0, cache_1.cacheDel)(`tenant:${companyId}:listings:*`);
        await (0, cache_1.cacheDel)(`tenant:${companyId}:bulk-create:*`);
    }
    catch (err) {
        console.warn("[CACHE_DEL_ERROR]", err);
    }
    if (slug) {
        try {
            const { revalidateCompanyCache } = await Promise.resolve().then(() => __importStar(require("@/lib/company-fetcher")));
            await revalidateCompanyCache(slug);
        }
        catch {
            // Safe fallback outside Next.js request context
        }
    }
}
