"use strict";
/**
 * lib/website-builder/website-service.ts
 *
 * Server-side data service for managing Website instances, drafts,
 * atomic publishing, revision histories, rollback, and cache invalidation.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollbackWebsiteRevision = exports.getWebsiteRevisions = exports.publishWebsite = exports.saveWebsiteDraft = exports.getPublishedWebsiteConfig = exports.getOrCreateWebsite = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const cache_1 = require("next/cache");
const website_builder_1 = require("@/types/website-builder");
const template_compiler_1 = require("./template-compiler");
const template_registry_1 = require("./template-registry");
/**
 * Get or automatically synthesize a tenant's editable Website configuration.
 * Guarantees zero-friction migration for existing stores.
 */
async function getOrCreateWebsite(companySlugOrId) {
    // 1. Fetch Company with all necessary relations for compilation
    const company = await prismadb_1.default.company.findFirst({
        where: {
            OR: [
                { id: companySlugOrId.length === 24 ? companySlugOrId : undefined },
                { slug: companySlugOrId },
            ],
        },
        include: {
            socialLinks: true,
            policies: true,
            faqs: true,
            testimonials: { include: { author: true } },
            heroSlides: true,
            promotions: true,
            CoreValues: true,
            addresses: true,
            SEO: true,
            website: true,
        },
    });
    if (!company) {
        throw new Error(`Company '${companySlugOrId}' not found.`);
    }
    // Deterministically resolve canonical template for this tenant
    const canonical = (0, template_registry_1.resolveCanonicalTemplate)(company.category, company.variant, company.website?.templateKey);
    // 2. If Website already exists, return draftConfig or publishedConfig
    if (company.website) {
        const rawConfig = company.website.draftConfig || company.website.publishedConfig;
        if (rawConfig) {
            try {
                const parsed = website_builder_1.CompiledWebsiteConfigSchema.parse(rawConfig);
                let needsDbSync = false;
                // If parsed.templateKey is missing or mismatched with canonical, migrate it
                if (!parsed.templateKey || parsed.templateKey !== canonical.id) {
                    parsed.templateKey = canonical.id;
                    needsDbSync = true;
                }
                // If website.templateKey is not canonical, sync it
                if (company.website.templateKey !== canonical.id) {
                    needsDbSync = true;
                }
                if (needsDbSync) {
                    await prismadb_1.default.website.update({
                        where: { id: company.website.id },
                        data: {
                            templateKey: canonical.id,
                            draftConfig: parsed,
                        },
                    });
                    company.website.templateKey = canonical.id;
                }
                return {
                    website: company.website,
                    config: parsed,
                    isNew: false,
                };
            }
            catch (err) {
                console.warn("Stored website config was malformed, regenerating...", err);
            }
        }
    }
    // 3. Otherwise, run the compiler to create the initial website
    const compiledConfig = (0, template_compiler_1.compileWebsiteFromCompany)(company);
    compiledConfig.templateKey = canonical.id;
    // Save to database
    const createdWebsite = await prismadb_1.default.website.upsert({
        where: { companyId: company.id },
        create: {
            companyId: company.id,
            name: company.name || "Store Website",
            templateKey: compiledConfig.templateKey,
            theme: compiledConfig.theme,
            navigation: compiledConfig.navigation,
            draftConfig: compiledConfig,
            publishedConfig: compiledConfig,
            status: "PUBLISHED",
            publishedAt: new Date(),
            revisions: {
                create: {
                    companyId: company.id,
                    versionNumber: 1,
                    changeSummary: "Initial automatic template migration from store profile",
                    source: "MIGRATION",
                    snapshot: compiledConfig,
                },
            },
        },
        update: {
            draftConfig: compiledConfig,
            publishedConfig: compiledConfig,
            theme: compiledConfig.theme,
            navigation: compiledConfig.navigation,
        },
    });
    return {
        website: createdWebsite,
        config: compiledConfig,
        isNew: true,
    };
}
exports.getOrCreateWebsite = getOrCreateWebsite;
/**
 * Get the cached, published website configuration for public storefront rendering.
 */
async function getPublishedWebsiteConfig(companySlug) {
    try {
        const company = await prismadb_1.default.company.findUnique({
            where: { slug: companySlug },
            select: {
                id: true,
                website: {
                    select: {
                        publishedConfig: true,
                        status: true,
                    },
                },
            },
        });
        if (!company?.website?.publishedConfig) {
            return null;
        }
        return website_builder_1.CompiledWebsiteConfigSchema.parse(company.website.publishedConfig);
    }
    catch (err) {
        console.error(`Error loading published website config for ${companySlug}:`, err);
        return null;
    }
}
exports.getPublishedWebsiteConfig = getPublishedWebsiteConfig;
/**
 * Save working changes to the tenant's draft configuration.
 */
async function saveWebsiteDraft(companyId, draftConfig, userId) {
    // Validate schema before saving
    const validated = website_builder_1.CompiledWebsiteConfigSchema.parse(draftConfig);
    await prismadb_1.default.website.update({
        where: { companyId },
        data: {
            templateKey: validated.templateKey,
            draftConfig: validated,
            theme: validated.theme,
            navigation: validated.navigation,
            updatedAt: new Date(),
        },
    });
    return validated;
}
exports.saveWebsiteDraft = saveWebsiteDraft;
/**
 * Publish the current draft configuration atomically.
 * Updates publishedConfig, creates a new WebsiteRevision, and busts storefront cache.
 */
async function publishWebsite(companyId, changeSummary = "Published website updates", userId) {
    const website = await prismadb_1.default.website.findUnique({
        where: { companyId },
        include: {
            company: { select: { slug: true } },
            revisions: {
                orderBy: { versionNumber: "desc" },
                take: 1,
            },
        },
    });
    if (!website || !website.draftConfig) {
        throw new Error("No draft website configuration found to publish.");
    }
    // Validate the draft config
    const validatedConfig = website_builder_1.CompiledWebsiteConfigSchema.parse(website.draftConfig);
    validatedConfig.publishedAt = new Date().toISOString();
    const nextVersion = (website.revisions?.[0]?.versionNumber || 0) + 1;
    // Atomic database transaction
    await prismadb_1.default.$transaction([
        prismadb_1.default.website.update({
            where: { companyId },
            data: {
                templateKey: validatedConfig.templateKey,
                publishedConfig: validatedConfig,
                status: "PUBLISHED",
                publishedAt: new Date(),
                updatedAt: new Date(),
            },
        }),
        prismadb_1.default.websiteRevision.create({
            data: {
                websiteId: website.id,
                companyId,
                versionNumber: nextVersion,
                changeSummary,
                source: "MANUAL",
                snapshot: validatedConfig,
                publishedBy: userId || null,
            },
        }),
    ]);
    // Invalidate Next.js cache for this tenant's storefront
    if (website.company?.slug) {
        try {
            (0, cache_1.revalidatePath)(`/site/${website.company.slug}`);
            (0, cache_1.revalidatePath)(`/site/${website.company.slug}/[...pageSlug]`);
            (0, cache_1.revalidatePath)(`/${website.company.slug}`);
            (0, cache_1.revalidatePath)(`/${website.company.slug}/[...pageSlug]`);
        }
        catch (e) {
            // Ignore during build / SSR edge
        }
    }
    return {
        publishedConfig: validatedConfig,
        versionNumber: nextVersion,
    };
}
exports.publishWebsite = publishWebsite;
/**
 * Fetch revision history for a website.
 */
async function getWebsiteRevisions(companyId) {
    return prismadb_1.default.websiteRevision.findMany({
        where: { companyId },
        orderBy: { versionNumber: "desc" },
        take: 20,
        select: {
            id: true,
            versionNumber: true,
            changeSummary: true,
            source: true,
            publishedBy: true,
            createdAt: true,
        },
    });
}
exports.getWebsiteRevisions = getWebsiteRevisions;
/**
 * Restore a past snapshot to the draft.
 */
async function rollbackWebsiteRevision(companyId, revisionId, userId) {
    const revision = await prismadb_1.default.websiteRevision.findFirst({
        where: { id: revisionId, companyId },
    });
    if (!revision || !revision.snapshot) {
        throw new Error("Revision snapshot not found.");
    }
    const restoredConfig = website_builder_1.CompiledWebsiteConfigSchema.parse(revision.snapshot);
    await saveWebsiteDraft(companyId, restoredConfig, userId);
    return restoredConfig;
}
exports.rollbackWebsiteRevision = rollbackWebsiteRevision;
