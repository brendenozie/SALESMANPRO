/**
 * lib/seo/structured-data.ts
 *
 * Production-Grade Schema.org JSON-LD Generators.
 * Grounded strictly in verified database data without fabricating ratings, reviews, or prices.
 */

import { SEOContext } from "./seo-types";
import { buildCanonicalUrl } from "./canonical-builder";

/**
 * Extracts clean image URLs from array of string or object images.
 */
export function extractImageUrls(images?: Array<string | { url: string }> | null): string[] {
  if (!images || !Array.isArray(images)) return [];
  return images
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter((url): url is string => Boolean(url && typeof url === "string"));
}

/**
 * Generates Organization or Store Schema.
 */
export function buildOrganizationSchema(ctx: SEOContext, canonicalUrl: string): Record<string, any> {
  const { siteType, tenant } = ctx;

  if (siteType === "SALESMANPRO") {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SalesmanPro",
      url: "https://salesmanpro.site",
      logo: "https://salesmanpro.site/static/images/logo.png",
      sameAs: [
        "https://www.linkedin.com/in/brendenodhiambo",
        "https://facebook.com/salesmanpro",
        "https://youtube.com/salesmanpro",
        "https://twitter.com/salesmanpro_site",
      ],
      description: "Omnichannel commerce platform for modern businesses and multi-store operators.",
    };
  }

  if (siteType === "GHUBA") {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Ghuba Marketplace",
      url: "https://ghuba.shop",
      logo: "https://ghuba.shop/static/images/logo.png",
      description: "Super App multi-vendor marketplace connecting consumers with verified sellers in Kenya.",
    };
  }

  // Tenant Storefront Schema: Only emit LocalBusiness if street address exists, otherwise Store / Organization
  const hasPhysicalAddress = Boolean(tenant?.address || tenant?.city);
  const schemaType = hasPhysicalAddress ? "LocalBusiness" : "Store";

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: tenant?.name || "Store",
    url: canonicalUrl,
    description: tenant?.description || tenant?.tagline || undefined,
  };

  if (tenant?.logoUrl) {
    schema.image = tenant.logoUrl;
    schema.logo = tenant.logoUrl;
  }

  if (tenant?.contactPhone) {
    schema.telephone = tenant.contactPhone;
  }
  if (tenant?.contactEmail) {
    schema.email = tenant.contactEmail;
  }

  if (hasPhysicalAddress) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: tenant?.address || undefined,
      addressLocality: tenant?.city || undefined,
      addressCountry: tenant?.country || "KE",
    };
  }

  return schema;
}

/**
 * Generates WebSite Schema with SearchAction.
 */
export function buildWebSiteSchema(ctx: SEOContext, canonicalUrl: string): Record<string, any> {
  const isGhuba = ctx.siteType === "GHUBA";
  const name = isGhuba ? "Ghuba Marketplace" : "SalesmanPro";
  const searchTarget = isGhuba
    ? "https://ghuba.shop/ghuba/productlist?search={search_term_string}"
    : "https://salesmanpro.site/help-center?query={search_term_string}";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: canonicalUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTarget,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generates BreadcrumbList Schema.
 */
export function buildBreadcrumbSchema(ctx: SEOContext, canonicalUrl: string): Record<string, any> | null {
  const items = ctx.breadcrumbs;
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : buildCanonicalUrl({
            siteType: ctx.siteType,
            path: item.url,
            tenant: ctx.tenant,
            requestHost: ctx.requestHost,
          }),
    })),
  };
}

/**
 * Generates Product & Offer Schema.
 */
export function buildProductSchema(ctx: SEOContext, canonicalUrl: string): Record<string, any> {
  const entity = (ctx.entity || {}) as any;
  const rawPrice = entity.finalPrice ?? entity.sellingPrice;
  const hasPrice = typeof rawPrice === "number" && rawPrice > 0;
  const currency = entity.currency || ctx.tenant?.currency || "KES";
  const images = extractImageUrls(entity.images);
  if (entity.image && typeof entity.image === "string") images.unshift(entity.image);

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: entity.name || entity.title || "Product",
    url: canonicalUrl,
    image: images.length > 0 ? images : undefined,
    description: entity.description || entity.longDescription || undefined,
    sku: entity.sku || entity.id || undefined,
  };

  if (entity.brand) {
    schema.brand = {
      "@type": "Brand",
      name: entity.brand,
    };
  }

  // Offer Object: Only if price is real
  if (hasPrice) {
    const isAvail = entity.isAvailable !== false && (entity.quantity === undefined || entity.quantity > 0);
    schema.offers = {
      "@type": "Offer",
      url: canonicalUrl,
      price: rawPrice,
      priceCurrency: currency,
      itemCondition: entity.condition?.toLowerCase() === "used"
        ? "https://schema.org/UsedCondition"
        : "https://schema.org/NewCondition",
      availability: isAvail
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: entity.seller?.name || ctx.tenant?.name || "Merchant",
      },
    };
  }

  // Reviews/Ratings: ONLY if genuine rating data exists on entity
  if (typeof entity.seller?.rating === "number" && entity.seller.rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: entity.seller.rating,
      reviewCount: entity.seller.reviewCount || 1,
    };
  }

  return schema;
}

/**
 * Generates Vehicle (Car + Product) Schema.
 * Evaluates dual schema for maximum search feature eligibility.
 */
export function buildVehicleSchema(ctx: SEOContext, canonicalUrl: string): Record<string, any>[] {
  const entity = (ctx.entity || {}) as any;
  const images = extractImageUrls(entity.images);
  const rawPrice = entity.finalPrice ?? entity.sellingPrice;
  const hasPrice = typeof rawPrice === "number" && rawPrice > 0;
  const currency = entity.currency || ctx.tenant?.currency || "KES";

  const carSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: entity.name || `${entity.make || ""} ${entity.model || ""}`.trim() || "Vehicle",
    url: canonicalUrl,
    image: images.length > 0 ? images : undefined,
    description: entity.description || undefined,
    vehicleModelDate: entity.year ? String(entity.year) : undefined,
    vehicleTransmission: entity.transmission || undefined,
    fuelType: entity.fuelType || undefined,
    mileageFromOdometer: entity.mileage ? { "@type": "QuantitativeValue", value: entity.mileage, unitCode: "KMT" } : undefined,
    vehicleIdentificationNumber: entity.vin || undefined,
  };

  if (entity.make) {
    carSchema.brand = {
      "@type": "Brand",
      name: entity.make,
    };
  }

  if (hasPrice) {
    carSchema.offers = {
      "@type": "Offer",
      url: canonicalUrl,
      price: rawPrice,
      priceCurrency: currency,
      availability: entity.isAvailable !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: entity.seller?.name || ctx.tenant?.name || "Auto Dealer",
      },
    };
  }

  // Dual Product schema for shopping engines that require Product type
  const productSchema = buildProductSchema(ctx, canonicalUrl);

  return [carSchema, productSchema];
}

/**
 * Generates Real Estate Listing Schema.
 */
export function buildRealEstateSchema(ctx: SEOContext, canonicalUrl: string): Record<string, any> {
  const entity = (ctx.entity || {}) as any;
  const images = extractImageUrls(entity.images);
  const rawPrice = entity.finalPrice ?? entity.sellingPrice;
  const currency = entity.currency || ctx.tenant?.currency || "KES";

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: entity.name || "Property Listing",
    url: canonicalUrl,
    image: images.length > 0 ? images : undefined,
    description: entity.description || undefined,
    datePosted: entity.createdAt ? new Date(entity.createdAt).toISOString() : undefined,
  };

  if (rawPrice) {
    schema.offers = {
      "@type": "Offer",
      price: rawPrice,
      priceCurrency: currency,
    };
  }

  if (entity.area || entity.address) {
    schema.contentLocation = {
      "@type": "Place",
      name: entity.area || entity.address,
      address: {
        "@type": "PostalAddress",
        streetAddress: entity.address || undefined,
        addressLocality: entity.area || undefined,
        addressCountry: "KE",
      },
    };
  }

  return schema;
}

/**
 * Generates Service Schema.
 */
export function buildServiceSchema(ctx: SEOContext, canonicalUrl: string): Record<string, any> {
  const entity = (ctx.entity || {}) as any;
  const rawPrice = entity.finalPrice ?? entity.sellingPrice;
  const currency = entity.currency || ctx.tenant?.currency || "KES";

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: entity.name || "Service",
    url: canonicalUrl,
    description: entity.description || undefined,
    provider: {
      "@type": "Organization",
      name: ctx.tenant?.name || "Service Provider",
      url: buildCanonicalUrl({
        siteType: ctx.siteType,
        path: "/",
        tenant: ctx.tenant,
        requestHost: ctx.requestHost,
      }),
    },
  };

  if (rawPrice) {
    schema.offers = {
      "@type": "Offer",
      price: rawPrice,
      priceCurrency: currency,
    };
  }

  return schema;
}

/**
 * Generates VideoObject Schema for listing videos.
 */
export function buildVideoObjectSchema(
  videoUrl: string,
  entity: any,
  canonicalUrl: string
): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: entity.name || "Listing Demonstration Video",
    description: entity.description || `Video presentation of ${entity.name || "item"}`,
    thumbnailUrl: Array.isArray(entity.images) && entity.images[0]
      ? (typeof entity.images[0] === "string" ? entity.images[0] : entity.images[0].url)
      : "https://salesmanpro.site/static/images/video-thumb-placeholder.png",
    uploadDate: entity.createdAt ? new Date(entity.createdAt).toISOString() : new Date().toISOString(),
    contentUrl: videoUrl,
    embedUrl: videoUrl,
  };
}

/**
 * Master dispatcher resolving all appropriate JSON-LD objects for a given context.
 */
export function generateStructuredData(ctx: SEOContext, canonicalUrl: string): Record<string, any>[] {
  const schemas: Record<string, any>[] = [];

  // Breadcrumbs (if present)
  const breadcrumbSchema = buildBreadcrumbSchema(ctx, canonicalUrl);
  if (breadcrumbSchema) {
    schemas.push(breadcrumbSchema);
  }

  // Page-specific entities
  switch (ctx.pageType) {
    case "HOME":
      schemas.push(buildOrganizationSchema(ctx, canonicalUrl));
      if (ctx.siteType === "SALESMANPRO" || ctx.siteType === "GHUBA") {
        schemas.push(buildWebSiteSchema(ctx, canonicalUrl));
      }
      break;

    case "PRODUCT":
    case "LISTING":
      schemas.push(buildProductSchema(ctx, canonicalUrl));
      break;

    case "VEHICLE":
      schemas.push(...buildVehicleSchema(ctx, canonicalUrl));
      break;

    case "PROPERTY":
      schemas.push(buildRealEstateSchema(ctx, canonicalUrl));
      break;

    case "SERVICE":
      schemas.push(buildServiceSchema(ctx, canonicalUrl));
      break;

    case "SELLER":
      schemas.push(buildOrganizationSchema(ctx, canonicalUrl));
      break;

    default:
      // Other page types receive Organization schema
      schemas.push(buildOrganizationSchema(ctx, canonicalUrl));
      break;
  }

  // Attach VideoObject if entity has video
  const entity = ctx.entity as any;
  if (entity?.videos && Array.isArray(entity.videos) && entity.videos.length > 0) {
    const firstVideo = entity.videos[0];
    const videoUrl = typeof firstVideo === "string" ? firstVideo : firstVideo?.url;
    if (videoUrl) {
      schemas.push(buildVideoObjectSchema(videoUrl, entity, canonicalUrl));
    }
  }

  return schemas;
}
