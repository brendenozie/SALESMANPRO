// ./app/site/[slug]/ghuba/productlist/[id]/page.jsx
export const revalidate = 300; // 5 minutes

import { ListingStatus, PrismaClient } from "@prisma/client";
import ProductPageClient from "./ProductPageClient"; // We will create this next
import prisma from '@/server/db/prismadb'; // This import is for server-side

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


import { redirect } from "next/navigation";
import { extractListingId, getListingPublicUrl } from "@/lib/ghuba-slug";

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

const listingWhere = {
  status: "ACTIVE" as ListingStatus,
  isAvailable: true,
  ghubaAdminApproved: true,
  ghubaStatus: "APPROVED",
};

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
      where: { ...listingWhere, id: { not: id } },
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

  return (
    <ProductPageClient 
      listing={serializedListing} 
      related={serializedSimilar} 
    />
  );
}