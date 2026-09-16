import prisma from "@/server/db/prismadb";
import { findCompanyCached } from "@/lib/company-fetcher";
import { fetchWithCache, buildTenantCacheKey } from "@/lib/cache";
import { SEOService } from "@/lib/seo";
import type { Metadata } from "next";
import { MarketListingForm, ListingMarketStatus } from "@/types/typings";

const normalizeImages = (images: any): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .map((img) => (typeof img === "string" ? img : img?.url))
      .filter(Boolean);
  }
  return [];
};

function sanitizeProduct(raw: any): MarketListingForm {
  return {
    ...raw,
    images: normalizeImages(raw.images),
    productCategoryId: raw.productCategoryId || "",
    finalPrice:
      typeof raw.finalPrice === "number"
        ? raw.finalPrice
        : Number(raw.sellingPrice) || 0,
    sellingPrice: typeof raw.sellingPrice === "number" ? raw.sellingPrice : 0,
    // Sensitive fields protection: explicitly zero/null out internal data
    buyingPrice: 0,
    costPrice: 0,
    profitMargin: undefined,
    supplier: undefined,
    supplierId: undefined,
    internalNotes: undefined,
    // Safe ISO date conversions
    startDealDate:
      raw.startDealDate instanceof Date
        ? raw.startDealDate.toISOString()
        : raw.startDealDate,
    endDealDate:
      raw.endDealDate instanceof Date
        ? raw.endDealDate.toISOString()
        : raw.endDealDate,
    expirationDate:
      raw.expirationDate instanceof Date
        ? raw.expirationDate.toISOString()
        : raw.expirationDate,
    availabilityStart:
      raw.availabilityStart instanceof Date
        ? raw.availabilityStart.toISOString()
        : raw.availabilityStart,
    availabilityEnd:
      raw.availabilityEnd instanceof Date
        ? raw.availabilityEnd.toISOString()
        : raw.availabilityEnd,
    createdAt:
      raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
    updatedAt:
      raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : raw.updatedAt,
    listingMarketStatus:
      (raw.listingMarketStatus as any) || ListingMarketStatus.AVAILABLE,
  } as MarketListingForm;
}

export interface TenantProductDetailResult {
  company: any;
  product: MarketListingForm;
  related: MarketListingForm[];
}

/**
 * High-performance, multi-tenant isolated product detail fetcher.
 * Uses Singleflight Redis + in-memory cache and sanitizes sensitive fields.
 */
export async function getTenantProductDetail(
  slug: string,
  id: string
): Promise<TenantProductDetailResult | null> {
  if (!slug || !id) return null;

  const company = await findCompanyCached(slug, "lean");
  if (!company) return null;

  // 1. Fetch main product with strict tenant isolation and singleflight caching
  const productKey = buildTenantCacheKey(company.id, "product_detail", { id });
  const rawProduct = await fetchWithCache(
    productKey,
    () =>
      prisma.marketplaceListings.findFirst({
        where: { id, companyId: company.id },
        include: {
          productCategory: true,
        },
      }),
    300
  );

  if (!rawProduct) return null;

  // 2. Fetch related products from the same category with singleflight caching
  const relatedKey = buildTenantCacheKey(company.id, "related_products", {
    categoryId: rawProduct.productCategoryId || "none",
    excludeId: id,
  });

  const rawRelated = await fetchWithCache(
    relatedKey,
    () =>
      prisma.marketplaceListings.findMany({
        where: {
          companyId: company.id,
          productCategoryId: rawProduct.productCategoryId,
          NOT: { id: rawProduct.id },
        },
        take: 8,
        include: { productCategory: true },
      }),
    300
  );

  const product = sanitizeProduct(rawProduct);
  const related = (rawRelated || []).map(sanitizeProduct);

  return { company, product, related };
}

/**
 * Fast cached metadata generator for any tenant product page.
 */
export async function getTenantProductMetadata(
  slug: string,
  id: string
): Promise<Metadata> {
  if (!slug || !id) return { title: "Product" };

  const company = await findCompanyCached(slug, "lean");
  if (!company) return { title: "Store" };

  const metaKey = buildTenantCacheKey(company.id, "product_meta", { id });
  const product = await fetchWithCache(
    metaKey,
    () =>
      prisma.marketplaceListings.findFirst({
        where: { id, companyId: company.id },
        select: {
          id: true,
          name: true,
          description: true,
          brand: true,
          finalPrice: true,
          sellingPrice: true,
          images: true,
          isAvailable: true,
        },
      }),
    300
  );

  if (!product) {
    return { title: `Product | ${company.name}` };
  }

  const seoResult = SEOService.generate({
    siteType: "TENANT_STORE",
    pageType: "PRODUCT",
    tenant: {
      id: company.id,
      slug: company.slug || slug,
      domain: company.domain,
      name: company.name,
      currency: company.currency,
      logoUrl: company.logoUrl,
    },
    entity: product,
    currentPath: `/products/${id}`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: product.name, url: `/products/${id}` },
    ],
  });

  return seoResult.metadata;
}

export interface TenantProductListOptions {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  take?: number;
}

/**
 * High-performance, cached product listing fetcher with tenant isolation.
 */
export async function getTenantProductList(
  slug: string,
  options: TenantProductListOptions = {}
) {
  const company = await findCompanyCached(slug, "lean");
  if (!company) return null;

  const {
    search,
    categoryId,
    minPrice,
    maxPrice,
    sort,
    take = 24,
  } = options;

  const where: any = { companyId: company.id };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (categoryId) where.productCategoryId = categoryId;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.finalPrice = {};
    if (minPrice !== undefined) where.finalPrice.gte = minPrice;
    if (maxPrice !== undefined) where.finalPrice.lte = maxPrice;
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "priceAsc") orderBy = { finalPrice: "asc" };
  if (sort === "priceDesc") orderBy = { finalPrice: "desc" };
  if (sort === "rating") orderBy = { providerRating: "desc" };

  const listCacheKey = buildTenantCacheKey(company.id, "product_list", {
    search: search || "",
    categoryId: categoryId || "",
    minPrice: minPrice ?? "",
    maxPrice: maxPrice ?? "",
    sort: sort || "",
    take,
  });

  const data = await fetchWithCache(
    listCacheKey,
    async () => {
      const [listings, categories] = await Promise.all([
        prisma.marketplaceListings.findMany({
          where,
          orderBy,
          take,
          select: {
            id: true,
            name: true,
            description: true,
            finalPrice: true,
            sellingPrice: true,
            images: true,
            productCategoryId: true,
            option: true,
            providerRating: true,
            isAvailable: true,
            isFeatured: true,
            isDiscounted: true,
            isOnOffer: true,
            isNewArrival: true,
            status: true,
          },
        }),
        prisma.storeCategory.findMany({
          where: { companyId: company.id },
          orderBy: { displayName: "asc" },
          select: {
            id: true,
            displayName: true,
            categoryId: true,
            category: true,
          },
        }),
      ]);
      return { listings, categories };
    },
    180
  );

  return {
    company,
    listings: (data?.listings || []).map(sanitizeProduct),
    categories: data?.categories || [],
  };
}
