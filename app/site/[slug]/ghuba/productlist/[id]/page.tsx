// ./app/site/[slug]/ghuba/productlist/[id]/page.tsx
export const revalidate = 300; // 5 minutes

import type { Metadata } from "next";
import { ListingStatus } from "@prisma/client";
import { fetchWithCache } from "@/lib/cache";
import ProductPageClient from "./ProductPageClient";
import prisma from "@/server/db/prismadb";
import { redirect } from "next/navigation";
import { extractListingId, getListingPublicUrl } from "@/lib/ghuba-slug";
import { SEOService } from "@/lib/seo";

// Public-safe Product projection strictly excluding private margin/cost/supplier fields
const publicProductSelect = {
  id: true,
  name: true,
  description: true,
  longDescription: true,
  category: true,
  subCategory: true,
  subCategoryName: true,
  images: true,
  videos: true,
  tags: true,
  brand: true,
  model: true,
  color: true,
  size: true,
  weight: true,
  condition: true,
  dimensions: true,
  material: true,
  quantity: true,
  sellingPrice: true,
  discount: true,
  finalPrice: true,
  isOnOffer: true,
  isFlashDeal: true,
  isDiscounted: true,
  isNewArrival: true,
  isFeatured: true,
  make: true,
  trim: true,
  type: true,
  mileage: true,
  engineType: true,
  engineSize: true,
  horsepower: true,
  torque: true,
  fuelType: true,
  fuelEconomy: true,
  transmission: true,
  drivetrain: true,
  vin: true,
  logbookStatus: true,
  serviceHistory: true,
  negotiable: true,
  financingAvailable: true,
  tradeIn: true,
  features: true,
  author: true,
  publisher: true,
  isbn: true,
  createdAt: true,
  updatedAt: true,
};

// Helper to handle Date serialization for Client Components
const serialize = (item: any) => ({
  ...item,
  createdAt: item.createdAt?.toISOString?.() || item.createdAt,
  updatedAt: item.updatedAt?.toISOString?.() || item.updatedAt,
  expirationDate: item.expirationDate?.toISOString?.() || null,
  product: item.product
    ? {
        ...item.product,
        createdAt: item.product.createdAt?.toISOString?.() || item.product.createdAt,
        updatedAt: item.product.updatedAt?.toISOString?.() || item.product.updatedAt,
        releaseDate: item.product.releaseDate?.toISOString?.() || null,
      }
    : null,
  productCategory: item.productCategory
    ? {
        ...item.productCategory,
        createdAt: item.productCategory.createdAt?.toISOString?.() || item.productCategory.createdAt,
        updatedAt: item.productCategory.updatedAt?.toISOString?.() || item.productCategory.updatedAt,
      }
    : null,
});

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

const listingWhere = {
  status: "ACTIVE" as ListingStatus,
  isAvailable: true,
  ghubaAdminApproved: true,
  ghubaStatus: "APPROVED",
};

/**
 * Cached listing fetcher shared between generateMetadata and Page component
 */
const getCachedListing = (listingId: string) =>
  fetchWithCache(
    `ghuba:listing:${listingId}`,
    async () => {
      return prisma.marketplaceListings.findUnique({
        where: { id: listingId },
        include: {
          product: {
            select: publicProductSelect,
          },
          productCategory: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              site: true,
            },
          },
        },
      });
    },
    { ttlSeconds: 300, swrSeconds: 600 }
  );

/**
 * Cached similar listings fetcher with SWR to eliminate sequential waterfalls
 */
const getCachedSimilarListings = (categoryId?: string | null, excludeId?: string) =>
  fetchWithCache(
    `ghuba:similar:${categoryId || "all"}:${excludeId}`,
    async () => {
      let items = await prisma.marketplaceListings.findMany({
        where: {
          ...listingWhere,
          productCategoryId: categoryId || undefined,
          id: { not: excludeId },
        },
        include: {
          product: { select: publicProductSelect },
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      });

      if (items.length === 0 && excludeId) {
        items = await prisma.marketplaceListings.findMany({
          where: { ...listingWhere, id: { not: excludeId } },
          include: {
            product: { select: publicProductSelect },
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
          take: 4,
          orderBy: { createdAt: "desc" },
        });
      }

      return items;
    },
    { ttlSeconds: 300, swrSeconds: 600 }
  );

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listingId = extractListingId(id);

  try {
    const listing = await getCachedListing(listingId);

    if (!listing) {
      return {
        title: "Listing Not Found | Ghuba Marketplace",
        description: "The requested listing could not be found.",
      };
    }

    const isVehicle = Boolean(
      listing.make ||
      listing.type?.toLowerCase().includes("vehicle") ||
      listing.type?.toLowerCase().includes("car")
    );
    const isProperty = Boolean(
      listing.type?.toLowerCase().includes("property") ||
      listing.type?.toLowerCase().includes("realestate")
    );

    const pageType = isVehicle ? "VEHICLE" : isProperty ? "PROPERTY" : "PRODUCT";
    const canonicalPath = getListingPublicUrl(listing);

    const seoResult = SEOService.generate({
      siteType: "GHUBA",
      pageType,
      entity: {
        ...listing,
        seller: listing.company,
      },
      currentPath: canonicalPath,
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Marketplace", url: "/ghuba/productlist" },
        { name: listing.name, url: canonicalPath },
      ],
    });

    return seoResult.metadata;
  } catch {
    return {
      title: "Ghuba Marketplace Listing",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug, id } = await params;
  const listingId = extractListingId(id);

  const listing = await getCachedListing(listingId);

  if (!listing) return <div>Product not found</div>;

  // If accessed directly via legacy raw 24-hex ObjectId, redirect to canonical SEO-friendly URL
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const canonicalPath = getListingPublicUrl(listing);
    const targetUrl = slug && slug !== "ghuba" ? `/site/${slug}${canonicalPath}` : canonicalPath;
    redirect(targetUrl);
  }

  const serializedListing = serialize(listing);

  // Fetch similar listings via cache (parallel-ready, no un-cached waterfalls)
  const similar = await getCachedSimilarListings(listing.productCategoryId, listing.id);
  const serializedSimilar = (similar || []).map(serialize);

  const isVehicle = Boolean(
    listing.make ||
    listing.type?.toLowerCase().includes("vehicle") ||
    listing.type?.toLowerCase().includes("car")
  );
  const isProperty = Boolean(
    listing.type?.toLowerCase().includes("property") ||
    listing.type?.toLowerCase().includes("realestate")
  );

  const seoResult = SEOService.generate({
    siteType: "GHUBA",
    pageType: isVehicle ? "VEHICLE" : isProperty ? "PROPERTY" : "PRODUCT",
    entity: {
      ...listing,
      seller: listing.company,
    },
    currentPath: getListingPublicUrl(listing),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Marketplace", url: "/ghuba/productlist" },
      { name: listing.name, url: getListingPublicUrl(listing) },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoResult.jsonLd) }}
      />
      <ProductPageClient
        listing={serializedListing}
        related={serializedSimilar}
      />
    </>
  );
}