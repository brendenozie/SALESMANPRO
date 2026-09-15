// ./app/site/[slug]/ghuba/productlist/[id]/page.tsx
export const revalidate = 300; // 5 minutes

import type { Metadata } from "next";
import { ListingStatus } from "@prisma/client";
import ProductPageClient from "./ProductPageClient";
import prisma from "@/server/db/prismadb";
import { redirect } from "next/navigation";
import { extractListingId, getListingPublicUrl } from "@/lib/ghuba-slug";
import { SEOService } from "@/lib/seo";

// Helper to handle Date serialization for Client Components
const serialize = (item: any) => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
  expirationDate: item.expirationDate?.toISOString() || null,
  product: item.product
    ? {
        ...item.product,
        createdAt: item.product.createdAt.toISOString(),
        updatedAt: item.product.updatedAt.toISOString(),
        releaseDate: item.product.releaseDate?.toISOString() || null,
      }
    : null,
  productCategory: item.productCategory
    ? {
        ...item.productCategory,
        createdAt: item.productCategory.createdAt.toISOString(),
        updatedAt: item.productCategory.updatedAt.toISOString(),
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listingId = extractListingId(id);

  try {
    const listing = await prisma.marketplaceListings.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        name: true,
        description: true,
        make: true,
        model: true,
        finalPrice: true,
        sellingPrice: true,
        images: true,
        type: true,
        category: true,
        isAvailable: true,
        company: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
    });

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

  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: listingId },
    include: {
      product: true,
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

  if (!listing) return <div>Product not found</div>;

  // If accessed directly via legacy raw 24-hex ObjectId, redirect to canonical SEO-friendly URL
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const canonicalPath = getListingPublicUrl(listing);
    const targetUrl = slug && slug !== "ghuba" ? `/site/${slug}${canonicalPath}` : canonicalPath;
    redirect(targetUrl);
  }

  const serializedListing = serialize(listing);

  // Fetch similar listings
  let similar = await prisma.marketplaceListings.findMany({
    where: {
      ...listingWhere,
      productCategoryId: listing.productCategoryId,
      id: { not: listing.id },
    },
    include: {
      product: true,
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
  });

  if (similar.length === 0) {
    similar = await prisma.marketplaceListings.findMany({
      where: { ...listingWhere, id: { not: listingId } },
      include: {
        product: true,
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
    });
  }

  const serializedSimilar = similar.map(serialize);

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