"use strict";
/**
 * lib/store-category-service.ts
 *
 * Direct database access layer for store categories and merchant inventory.
 * Eliminates flaky internal HTTP hops during Server Component rendering.
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
exports.getStoreMarketplaceListings = exports.getStoreInventoryProducts = exports.getStoreCategories = exports.getStoreCategoriesByCompanyId = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function getStoreCategoriesByCompanyId(companyId) {
    if (!companyId)
        return [];
    try {
        const rawCategories = await prismadb_1.default.storeCategory.findMany({
            where: { companyId },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        image: true,
                        icon: true,
                        allBrands: true,
                        tags: true,
                        subcategories: true,
                        description: true,
                        longDescription: true,
                        seoTitle: true,
                        seoDescription: true,
                        metaKeywords: true,
                        sortOrder: true,
                        visible: true,
                        isFeatured: true,
                        showInHomepage: true,
                        attributes: true,
                    },
                },
            },
            orderBy: { sortOrder: "asc" },
        });
        if (rawCategories.length > 0) {
            return rawCategories.map((sc) => ({
                id: sc.id,
                companyId: sc.companyId,
                categoryId: sc.categoryId || sc.category?.id,
                displayName: sc.displayName || sc.category?.name || "Category",
                icon: sc.icon || sc.category?.icon,
                sortOrder: sc.sortOrder ?? 0,
                visible: sc.visible ?? true,
                subcategories: Array.isArray(sc.subcategories)
                    ? sc.subcategories.map((sub) => ({
                        id: sub._id?.$oid || sub.id,
                        name: sub.name,
                        slug: sub.slug,
                        sortOrder: sub.sortOrder,
                        visible: sub.visible,
                    }))
                    : Array.isArray(sc.category?.subcategories)
                        ? sc.category.subcategories.map((sub) => ({
                            id: sub._id?.$oid || sub.id,
                            name: sub.name,
                            slug: sub.slug,
                            sortOrder: sub.sortOrder,
                            visible: sub.visible,
                        }))
                        : [],
                allBrands: sc.allBrands || [],
                category: {
                    id: sc.category?.id || sc.categoryId,
                    name: sc.category?.name || sc.displayName || "Category",
                    slug: sc.category?.slug,
                    description: sc.category?.description,
                    longDescription: sc.category?.longDescription,
                    seoTitle: sc.category?.seoTitle,
                    seoDescription: sc.category?.seoDescription,
                    metaKeywords: sc.category?.metaKeywords,
                    sortOrder: sc.category?.sortOrder ?? sc.sortOrder ?? 0,
                    visible: sc.category?.visible ?? sc.visible ?? true,
                    isFeatured: sc.category?.isFeatured,
                    showInHomepage: sc.category?.showInHomepage,
                    attributes: sc.category?.attributes,
                    subcategories: Array.isArray(sc.category?.subcategories)
                        ? sc.category.subcategories.map((sub) => ({
                            id: sub._id?.$oid || sub.id,
                            name: sub.name,
                            slug: sub.slug,
                            sortOrder: sub.sortOrder,
                            visible: sub.visible,
                        }))
                        : [],
                    icon: sc.category?.icon || sc.icon,
                    image: sc.category?.image || sc.image,
                },
            }));
        }
        // Fallback: If storeCategory records haven't been explicitly created yet,
        // find product categories that are actively linked to this company's products
        const productCategories = await prismadb_1.default.productCategory.findMany({
            where: {
                Product: { some: { companyId } },
            },
            take: 50,
            orderBy: { sortOrder: "asc" },
        });
        return productCategories.map((pc) => ({
            id: pc.id,
            companyId,
            categoryId: pc.id,
            displayName: pc.name,
            icon: pc.icon,
            sortOrder: pc.sortOrder ?? 0,
            visible: pc.visible ?? true,
            subcategories: Array.isArray(pc.subcategories)
                ? pc.subcategories.map((sub) => ({
                    id: sub._id?.$oid || sub.id,
                    name: sub.name,
                    slug: sub.slug,
                    sortOrder: sub.sortOrder,
                    visible: sub.visible,
                }))
                : [],
            allBrands: pc.allBrands || [],
            category: {
                id: pc.id,
                name: pc.name,
                slug: pc.slug,
                description: pc.description,
                longDescription: pc.longDescription,
                seoTitle: pc.seoTitle,
                seoDescription: pc.seoDescription,
                metaKeywords: pc.metaKeywords,
                sortOrder: pc.sortOrder ?? 0,
                visible: pc.visible ?? true,
                isFeatured: pc.isFeatured,
                showInHomepage: pc.showInHomepage,
                attributes: pc.attributes,
                subcategories: Array.isArray(pc.subcategories)
                    ? pc.subcategories.map((sub) => ({
                        id: sub._id?.$oid || sub.id,
                        name: sub.name,
                        slug: sub.slug,
                        sortOrder: sub.sortOrder,
                        visible: sub.visible,
                    }))
                    : [],
                icon: pc.icon,
                image: pc.image,
            },
        }));
    }
    catch (err) {
        console.error("[GET_STORE_CATEGORIES_ERROR]", err);
        return [];
    }
}
exports.getStoreCategoriesByCompanyId = getStoreCategoriesByCompanyId;
exports.getStoreCategories = getStoreCategoriesByCompanyId;
async function getStoreInventoryProducts(companyId, page = 1, limit = 50) {
    if (!companyId)
        return [];
    try {
        const { fetchCompanyInventoryProducts } = await Promise.resolve().then(() => __importStar(require("@/lib/inventory/inventory-service")));
        const { results } = await fetchCompanyInventoryProducts(companyId, {
            page,
            limit,
        });
        return results;
    }
    catch (err) {
        console.error("[GET_STORE_INVENTORY_PRODUCTS_ERROR]", err);
        return [];
    }
}
exports.getStoreInventoryProducts = getStoreInventoryProducts;
async function getStoreMarketplaceListings(companyId, page = 1, limit = 20) {
    if (!companyId) {
        return { results: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
    const offset = Math.max(0, (page - 1) * limit);
    try {
        const [total, listings] = await Promise.all([
            prismadb_1.default.marketplaceListings.count({ where: { companyId } }),
            prismadb_1.default.marketplaceListings.findMany({
                where: { companyId },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
                include: { productCategory: true },
            }),
        ]);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return {
            results: listings || [],
            meta: { page, limit, total, totalPages },
        };
    }
    catch (err) {
        console.error("[GET_STORE_MARKETPLACE_LISTINGS_ERROR]", err);
        return { results: [], meta: { page, limit, total: 0, totalPages: 1 } };
    }
}
exports.getStoreMarketplaceListings = getStoreMarketplaceListings;
