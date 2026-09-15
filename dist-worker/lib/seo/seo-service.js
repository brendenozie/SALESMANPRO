"use strict";
/**
 * lib/seo/seo-service.ts
 *
 * Central Unified SEO Service.
 * Provides the single source of truth for generating Next.js Metadata
 * and server-rendered JSON-LD across SalesmanPro, Ghuba, and Tenant Stores.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderJsonLdScript = exports.SEOService = void 0;
const canonical_builder_1 = require("./canonical-builder");
const title_builder_1 = require("./title-builder");
const description_builder_1 = require("./description-builder");
const structured_data_1 = require("./structured-data");
class SEOService {
    /**
     * Generates production-grade Next.js Metadata and JSON-LD schema array.
     */
    static generate(ctx) {
        const canonicalUrl = (0, canonical_builder_1.buildCanonicalUrl)({
            siteType: ctx.siteType,
            path: ctx.currentPath || "/",
            tenant: ctx.tenant,
            requestHost: ctx.requestHost,
            override: ctx.canonicalOverride || ctx.customSEO?.canonicalUrl,
        });
        const title = (0, title_builder_1.buildPageTitle)(ctx);
        const description = (0, description_builder_1.buildPageDescription)(ctx);
        // Resolve representative OpenGraph / Twitter social images
        const rawImages = ctx.entity?.images || ctx.entity?.image;
        const entityImages = (0, structured_data_1.extractImageUrls)(Array.isArray(rawImages) ? rawImages : rawImages ? [rawImages] : []);
        let socialBanner;
        if (ctx.customSEO?.image) {
            socialBanner = ctx.customSEO.image;
        }
        else if (entityImages.length > 0) {
            socialBanner = entityImages[0];
        }
        else if (ctx.tenant?.logoUrl || ctx.tenant?.bannerUrl) {
            socialBanner = (ctx.tenant.logoUrl || ctx.tenant.bannerUrl);
        }
        else if (ctx.siteType === "GHUBA") {
            socialBanner = "https://ghuba.shop/static/images/social-banner.png";
        }
        else {
            socialBanner = "https://salesmanpro.site/static/images/twitter-card.png";
        }
        // Determine robot indexing rules
        const shouldNoIndex = Boolean(ctx.noIndex ||
            ctx.customSEO?.noIndex ||
            ctx.entity?.ghubaStatus === "REJECTED" ||
            ctx.entity?.status === "INACTIVE");
        const robots = shouldNoIndex
            ? {
                index: false,
                follow: false,
                nocache: true,
                googleBot: {
                    index: false,
                    follow: false,
                },
            }
            : {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    "max-video-preview": -1,
                    "max-image-preview": "large",
                    "max-snippet": -1,
                },
            };
        const siteName = ctx.siteType === "GHUBA"
            ? "Ghuba Marketplace"
            : ctx.siteType === "TENANT_STORE"
                ? ctx.tenant?.name || "Store"
                : "SalesmanPro";
        const metadata = {
            title,
            description,
            alternates: {
                canonical: canonicalUrl,
            },
            robots,
            openGraph: {
                title,
                description,
                url: canonicalUrl,
                siteName,
                images: [
                    {
                        url: socialBanner,
                        width: 1200,
                        height: 630,
                        alt: title,
                    },
                ],
                locale: "en_US",
                type: ctx.pageType === "ARTICLE" || ctx.pageType === "BLOG" ? "article" : "website",
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [socialBanner],
            },
        };
        if (ctx.tenant?.logoUrl) {
            metadata.icons = {
                icon: ctx.tenant.logoUrl,
                apple: ctx.tenant.logoUrl,
            };
        }
        const jsonLd = (0, structured_data_1.generateStructuredData)(ctx, canonicalUrl);
        return {
            metadata,
            jsonLd,
            canonicalUrl,
        };
    }
}
exports.SEOService = SEOService;
/**
 * Convenience helper for React Server Components to render JSON-LD script tags.
 */
function renderJsonLdScript(schemas) {
    if (!schemas || schemas.length === 0)
        return null;
    return schemas.map((schema, index) => (schema ? {
        __html: JSON.stringify(schema),
        key: `jsonld-${index}-${schema["@type"] || "item"}`,
    } : null)).filter(Boolean);
}
exports.renderJsonLdScript = renderJsonLdScript;
