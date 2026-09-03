"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedSiteCategories = exports.getCachedLocations = exports.getCachedAdminCategories = void 0;
/* File: lib/services/store-data.ts */
const cache_1 = require("next/cache");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
/**
 * Fetches admin categories directly from the database with a 5-minute memory cache window
 */
exports.getCachedAdminCategories = (0, cache_1.unstable_cache)(async (limit = 100) => {
    try {
        const results = await prismadb_1.default.productCategory.findMany({
            take: limit,
            // where: { isActive: true }, // Filter out inactive items early
            // select: { id: true, name: true, slug: true }, // ONLY pull fields your frontend selects actually use!
            orderBy: { name: "asc" },
        });
        return { results };
    }
    catch (error) {
        console.error("Failed to query admin categories directly:", error);
        return { results: [] };
    }
}, ["admin-categories-cache-key"], { revalidate: 300, tags: ["categories"] });
/**
 * Fetches locations directly from the database with a 5-minute memory cache window
 */
exports.getCachedLocations = (0, cache_1.unstable_cache)(async () => {
    try {
        const data = await prismadb_1.default.location.findMany({
            orderBy: {
                sortOrder: "asc", // Order by sortOrder for consistent list/tree building
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                latitude: true,
                longitude: true,
                seoTitle: true,
                seoDescription: true,
                metaKeywords: true,
                sortOrder: true,
                visible: true,
                createdAt: true,
                updatedAt: true,
                createdBy: true,
                updatedBy: true,
                status: true,
                parentId: true,
                localization: true,
                attributes: true,
            },
            // where: {
            //   OR: [
            //     {
            // companyId: null, // Global locations
            //company location is empty
            // CompanyLocation: {
            //   none: {},
            // },
            //     },
            //   ],
            // },
        });
        return { data };
    }
    catch (error) {
        console.error("Failed to query locations directly:", error);
        return { data: [] };
    }
}, ["locations-cache-key"], { revalidate: 300, tags: ["locations"] });
/**
 * Fetches global site-level categories with a 10-minute memory cache window
 */
exports.getCachedSiteCategories = (0, cache_1.unstable_cache)(async (limit = 100) => {
    try {
        return await prismadb_1.default.companyCategory.findMany({
            where: {
                status: "active", // Only show active industries
                // ...(nameQuery && { name: { contains: nameQuery, mode: 'insensitive' } })
            },
            include: {
                variants: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        link: true,
                        description: true,
                        tag: true,
                        desktopPreviewImage: true,
                        mobilePreviewImage: true
                        // Exclude internal timestamps if not needed to save bandwidth
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }
    catch (error) {
        console.error("Failed to query site categories directly:", error);
        return [];
    }
}, ["site-categories-cache-key"], { revalidate: 600, tags: ["siteCategories"] });
