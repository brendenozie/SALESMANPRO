"use strict";
/**
 * lib/marketplace/linkingService.ts
 *
 * Domain Service for Product ↔ Marketplace Listing Linking, Unlinking,
 * Conflict Resolution, and Bi-directional Record Materialization.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLinkCandidates = exports.createProductFromListing = exports.unlinkListing = exports.linkListingToProduct = exports.compareProductAndListing = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const cache_1 = require("@/lib/cache");
const publicationService_1 = require("./publicationService");
const company_fetcher_1 = require("@/lib/company-fetcher");
/**
 * Compares Product and Listing to detect field discrepancies before linking.
 */
async function compareProductAndListing(companyId, productId, listingId) {
    const [product, listing] = await Promise.all([
        prismadb_1.default.product.findFirst({
            where: { id: productId, companyId },
            select: {
                id: true,
                name: true,
                sellingPrice: true,
                category: true,
            },
        }),
        prismadb_1.default.marketplaceListings.findFirst({
            where: { id: listingId, companyId },
            select: {
                id: true,
                name: true,
                sellingPrice: true,
                category: true,
            },
        }),
    ]);
    if (!product)
        return { success: false, error: "Product not found or unauthorized" };
    if (!listing)
        return { success: false, error: "Listing not found or unauthorized" };
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
exports.compareProductAndListing = compareProductAndListing;
/**
 * Explicitly links an unlinked or existing MarketplaceListing to an internal Product.
 */
async function linkListingToProduct(options) {
    const { companyId, listingId, productId, pricePreference = "PRODUCT", syncSpecs = true } = options;
    const [product, listing] = await Promise.all([
        prismadb_1.default.product.findFirst({
            where: { id: productId, companyId },
            include: { company: { select: { id: true, slug: true } } },
        }),
        prismadb_1.default.marketplaceListings.findFirst({
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
    const resolvedSellingPrice = pricePreference === "PRODUCT" ? product.sellingPrice : listing.sellingPrice;
    const resolvedFinalPrice = pricePreference === "PRODUCT"
        ? product.finalPrice ?? product.sellingPrice
        : listing.finalPrice ?? listing.sellingPrice;
    const updatedListing = await prismadb_1.default.marketplaceListings.update({
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
        await (0, publicationService_1.syncApprovedSharedFields)(product.id);
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
exports.linkListingToProduct = linkListingToProduct;
/**
 * Disconnects a MarketplaceListing from its Product without deleting either record.
 */
async function unlinkListing(companyId, listingId) {
    const listing = await prismadb_1.default.marketplaceListings.findFirst({
        where: { id: listingId, companyId },
        include: { company: { select: { id: true, slug: true } } },
    });
    if (!listing) {
        return { success: false, error: `Listing ${listingId} not found or unauthorized.` };
    }
    const updated = await prismadb_1.default.marketplaceListings.update({
        where: { id: listing.id },
        data: {
            product: { disconnect: true },
            updatedAt: new Date(),
        },
    });
    await invalidateLinkingCaches(companyId, listing.company?.slug);
    return { success: true, listingId: updated.id, unlinked: true };
}
exports.unlinkListing = unlinkListing;
/**
 * Creates an internal inventory Product based on an unlinked MarketplaceListing.
 */
async function createProductFromListing(companyId, listingId, overrides) {
    const listing = await prismadb_1.default.marketplaceListings.findFirst({
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
    const profitMargin = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice) * 100 : 0;
    // Create Product in inventory
    const createdProduct = await prismadb_1.default.product.create({
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
    await prismadb_1.default.marketplaceListings.update({
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
exports.createProductFromListing = createProductFromListing;
/**
 * Searches candidates in the Product catalog to match with a listing.
 */
async function searchLinkCandidates(companyId, query, limit = 10) {
    if (!query || query.trim().length === 0)
        return [];
    const cleanQuery = query.trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanQuery);
    const orConditions = [
        { model: { contains: cleanQuery, mode: "insensitive" } },
        { name: { contains: cleanQuery, mode: "insensitive" } },
        { brand: { contains: cleanQuery, mode: "insensitive" } },
    ];
    if (isObjectId) {
        orConditions.unshift({ id: cleanQuery });
    }
    // Search by exact ID, model (SKU), or name
    const products = await prismadb_1.default.product.findMany({
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
        let matchConfidence = "NAME_SIMILAR";
        if (p.id === cleanQuery)
            matchConfidence = "EXACT_ID";
        else if (p.model && p.model.toLowerCase() === cleanQuery.toLowerCase()) {
            matchConfidence = "EXACT_SKU";
        }
        return {
            ...p,
            matchConfidence,
            thumbnail: Array.isArray(p.images) && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url) : null,
        };
    });
}
exports.searchLinkCandidates = searchLinkCandidates;
async function invalidateLinkingCaches(companyId, slug) {
    try {
        await (0, cache_1.cacheDel)(`tenant:${companyId}:products:*`);
        await (0, cache_1.cacheDel)(`tenant:${companyId}:listings:*`);
        await (0, cache_1.cacheDel)(`admin:post-product:*`);
        await (0, cache_1.cacheDel)(`admin:post-market-list:*`);
    }
    catch (err) {
        console.warn("[LINKING_CACHE_INVALIDATION_WARN]", err);
    }
    if (slug) {
        try {
            await (0, company_fetcher_1.revalidateCompanyCache)(slug);
        }
        catch { }
    }
}
