import { MetadataRoute } from "next";
import { headers } from "next/headers";
import prisma from "@/server/db/prismadb";
import siteMetadata from "@/data/siteMetadata";
import { cleanHost } from "@/lib/seo/canonical-builder";
import { getListingPublicUrl } from "@/lib/ghuba-slug";

export const revalidate = 3600; // Cache for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let host = siteMetadata.siteUrl.replace(/^https?:\/\//, "");

  try {
    const headersList = await headers();
    const rawHost = headersList.get("host");
    if (rawHost) {
      host = cleanHost(rawHost);
    }
  } catch {
    // Fallback during static pre-rendering
  }

  const isGhuba = host === "ghuba.shop" || host.startsWith("ghuba.");
  const isPrimary = host === "salesmanpro.site" || host === "www.salesmanpro.site" || host === "localhost";

  // --------------------------------------------------------------------------
  // SURFACE 1: GHUBA MARKETPLACE SITEMAP
  // --------------------------------------------------------------------------
  if (isGhuba) {
    const baseUrl = "https://ghuba.shop";

    // 1. Core Marketplace Routes
    const coreRoutes: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/ghuba/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
      { url: `${baseUrl}/ghuba/productlist`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/ghuba/our-stores`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/ghuba/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/ghuba/how-to-buy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/ghuba/terms-&-conditions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
      { url: `${baseUrl}/ghuba/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ];

    // 2. Active, Approved Marketplace Listings (up to 5,000 for standard sitemap chunk)
    try {
      const activeListings = await prisma.marketplaceListings.findMany({
        where: {
          isAvailable: true,
          ghubaAdminApproved: true,
          ghubaStatus: "APPROVED",
        },
        select: {
          id: true,
          name: true,
          make: true,
          model: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5000,
      });

      const listingRoutes: MetadataRoute.Sitemap = activeListings.map((listing) => {
        const canonicalPath = getListingPublicUrl(listing);
        return {
          url: `${baseUrl}${canonicalPath}`,
          lastModified: listing.updatedAt ? new Date(listing.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        };
      });

      // 3. Active Categories
      const categories = await prisma.productCategory.findMany({
        select: { id: true, name: true, updatedAt: true },
        take: 200,
      });

      const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
        url: `${baseUrl}/ghuba/productlist?category=${encodeURIComponent(c.name)}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

      return [...coreRoutes, ...categoryRoutes, ...listingRoutes];
    } catch {
      return coreRoutes;
    }
  }

  // --------------------------------------------------------------------------
  // SURFACE 2: TENANT STOREFRONT SITEMAP (Subdomain or Custom Domain)
  // --------------------------------------------------------------------------
  if (!isPrimary) {
    const tenantHost = host;
    const baseUrl = `https://${tenantHost}`;

    // Extract tenant slug from subdomain or query domain directly
    let tenantSlugOrDomain = tenantHost;
    if (tenantHost.endsWith(".salesmanpro.site")) {
      tenantSlugOrDomain = tenantHost.replace(".salesmanpro.site", "");
    }

    try {
      const company = await prisma.company.findFirst({
        where: {
          OR: [
            { slug: tenantSlugOrDomain },
            { domain: tenantHost },
            { domain: `www.${tenantHost}` },
          ],
        },
        select: {
          id: true,
          slug: true,
          updatedAt: true,
          Subscription: true,
          subscriptionCompanies: {
            where: { status: "ACTIVE" },
            take: 1,
            select: { id: true },
          },
        },
      });

      if (!company) {
        return [];
      }

      // Home route
      const storeRoutes: MetadataRoute.Sitemap = [
        {
          url: baseUrl,
          lastModified: company.updatedAt ? new Date(company.updatedAt) : new Date(),
          changeFrequency: "daily",
          priority: 1.0,
        },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
      ];

      // Products belonging to this tenant
      const products = await prisma.marketplaceListings.findMany({
        where: {
          companyId: company.id,
          isAvailable: true,
        },
        select: {
          id: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 2000,
      });

      const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${baseUrl}/products/${p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

      return [...storeRoutes, ...productRoutes];
    } catch {
      return [{ url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 }];
    }
  }

  // --------------------------------------------------------------------------
  // SURFACE 3: SALESMANPRO PLATFORM SITEMAP
  // --------------------------------------------------------------------------
  const platformBaseUrl = "https://salesmanpro.site";

  const staticPlatformRoutes: MetadataRoute.Sitemap = [
    { url: platformBaseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${platformBaseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${platformBaseUrl}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${platformBaseUrl}/careers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${platformBaseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${platformBaseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${platformBaseUrl}/help-center`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${platformBaseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${platformBaseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Active verified stores indexable on the primary platform directory
  try {
    const activeStores = await prisma.company.findMany({
      where: {
        slug: { not: "" },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    });

    const storeProfiles: MetadataRoute.Sitemap = activeStores
      .filter((s) => Boolean(s.slug && s.slug !== "ghuba"))
      .map((s) => ({
        url: `${platformBaseUrl}/site/${s.slug}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticPlatformRoutes, ...storeProfiles];
  } catch {
    return staticPlatformRoutes;
  }
}