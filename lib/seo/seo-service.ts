/**
 * lib/seo/seo-service.ts
 *
 * Central Unified SEO Service.
 * Provides the single source of truth for generating Next.js Metadata
 * and server-rendered JSON-LD across SalesmanPro, Ghuba, and Tenant Stores.
 */

import type { Metadata } from "next";
import { SEOContext, SEOMetadataResult } from "./seo-types";
import { buildCanonicalUrl } from "./canonical-builder";
import { buildPageTitle } from "./title-builder";
import { buildPageDescription } from "./description-builder";
import { generateStructuredData, extractImageUrls } from "./structured-data";

export class SEOService {
  /**
   * Generates production-grade Next.js Metadata and JSON-LD schema array.
   */
  public static generate(ctx: SEOContext): SEOMetadataResult {
    const canonicalUrl = buildCanonicalUrl({
      siteType: ctx.siteType,
      path: ctx.currentPath || "/",
      tenant: ctx.tenant,
      requestHost: ctx.requestHost,
      override: ctx.canonicalOverride || ctx.customSEO?.canonicalUrl,
    });

    const title = buildPageTitle(ctx);
    const description = buildPageDescription(ctx);

    // Resolve representative OpenGraph / Twitter social images
    const rawImages = (ctx.entity as any)?.images || (ctx.entity as any)?.image;
    const entityImages = extractImageUrls(Array.isArray(rawImages) ? rawImages : rawImages ? [rawImages] : []);
    
    let socialBanner: string;
    if (ctx.customSEO?.image) {
      socialBanner = ctx.customSEO.image;
    } else if (entityImages.length > 0) {
      socialBanner = entityImages[0];
    } else if (ctx.tenant?.logoUrl || ctx.tenant?.bannerUrl) {
      socialBanner = (ctx.tenant.logoUrl || ctx.tenant.bannerUrl)!;
    } else if (ctx.siteType === "GHUBA") {
      socialBanner = "https://ghuba.shop/static/images/social-banner.png";
    } else {
      socialBanner = "https://salesmanpro.site/static/images/twitter-card.png";
    }

    // Determine robot indexing rules
    const shouldNoIndex = Boolean(
      ctx.noIndex ||
      ctx.customSEO?.noIndex ||
      (ctx.entity as any)?.ghubaStatus === "REJECTED" ||
      (ctx.entity as any)?.status === "INACTIVE"
    );

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
            "max-image-preview": "large" as const,
            "max-snippet": -1,
          },
        };

    const siteName =
      ctx.siteType === "GHUBA"
        ? "Ghuba Marketplace"
        : ctx.siteType === "TENANT_STORE"
        ? ctx.tenant?.name || "Store"
        : "SalesmanPro";

    const metadata: Metadata = {
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

    const jsonLd = generateStructuredData(ctx, canonicalUrl);

    return {
      metadata,
      jsonLd,
      canonicalUrl,
    };
  }
}

/**
 * Convenience helper for React Server Components to render JSON-LD script tags.
 */
export function renderJsonLdScript(schemas: Record<string, any>[]) {
  if (!schemas || schemas.length === 0) return null;
  return schemas.map((schema, index) => (
    schema ? {
      __html: JSON.stringify(schema),
      key: `jsonld-${index}-${schema["@type"] || "item"}`,
    } : null
  )).filter(Boolean);
}
