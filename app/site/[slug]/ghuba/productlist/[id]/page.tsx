// ./app/site/[slug]/ghuba/productlist/[id]/page.jsx
export const revalidate = 300; // 5 minutes

import { PrismaClient } from "@prisma/client";
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


interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug, id } = await params;

  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: id },
    include: { product: true, productCategory: true },
  });

  if (!listing) return <div>Product not found</div>;

  const serializedListing = serialize(listing);

  // Fetch similar listings
  let similar = await prisma.marketplaceListings.findMany({
    where: {
      productCategoryId: listing.productCategoryId,
      id: { not: id },
    },
    include: { product: true },
    take: 4,
  });

  if (similar.length === 0) {
    similar = await prisma.marketplaceListings.findMany({
      where: { id: { not: slug } },
      include: { product: true },
      take: 4,
    });
  }
  

  const serializedSimilar = similar.map(serialize);

  return (
    <ProductPageClient 
      listing={serializedListing} 
      similarListings={serializedSimilar} 
    />
  );
}