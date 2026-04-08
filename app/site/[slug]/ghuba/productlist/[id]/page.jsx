// ./app/site/[slug]/ghuba/productlist/[id]/page.jsx
import { PrismaClient } from "@prisma/client";
import ProductPageClient from "./ProductPageClient"; // We will create this next

const prisma = new PrismaClient();

// Helper to handle Date serialization for Client Components
const serialize = (item) => ({
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

export default async function Page({ params }) {
  const { id } = await params;

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    include: { product: true, productCategory: true },
  });

  if (!listing) return <div>Product not found</div>;

  const serializedListing = serialize(listing);

  // Fetch similar listings
  let similar = await prisma.marketplaceListing.findMany({
    where: {
      productCategoryId: listing.productCategoryId,
      id: { not: id },
    },
    include: { product: true },
    take: 4,
  });

  if (similar.length === 0) {
    similar = await prisma.marketplaceListing.findMany({
      where: { id: { not: id } },
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