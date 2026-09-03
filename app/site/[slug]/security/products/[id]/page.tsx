// app/[slug]/products/[productId]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb'; // This import is for server-side
// import ProductCard from '@/components/shop/ProductCard'; // Assuming ProductCard is the correct component for individual products
import { StoreForm, MarketListingForm } from '@/types/typings'; // Import relevant types
import { findCompanyCached } from '@/lib/company-fetcher';
import ProductDetail from './ProductDetail';

interface PageProps {
  params: Promise<{ slug: string; productId: string }>;
}

// Ensure this is a server component as it fetches data
export const revalidate = 60;

export default async function ProductPage({ params }: PageProps) {
  const { slug, productId } = await params;

  // Fetch store data
  const rawStore = await findCompanyCached(slug, "lean");
  if (!rawStore) notFound();

  // Fetch product and related items
  const product = await prisma.marketplaceListings.findFirst({
    where: { id: productId, company: { slug } },
    // Ensure images are included if your schema supports it and it's needed
    // include: { images: true }, // Uncomment if 'images' is a relation in your Prisma schema
  });
  if (!product) notFound();

  // Assuming product.images is an array of objects with a 'url' property
  // Add a fallback for images if the include is not enabled or data structure differs
  // const productWithImages = {
  //   ...product,
  //   images: product.images || [{ url: '/placeholder-image.png' }], // Fallback for images
  //   rating: 4.5, // product.rating ||  Default rating if not available
  //   reviews: 100, // product.reviews || Default reviews if not available
  // };


  const related = await prisma.marketplaceListings.findMany({
    where: {
      companyId: product.companyId,
      productCategoryId: product.productCategoryId,
      NOT: { id: product.id },
    },
    take: 4,
    // include: { images: true }, // Uncomment if 'images' is a relation in your Prisma schema
  });

  // Prepare related products with fallback images
  const relatedWithImages = related.map(item => ({
    ...item,
    images: item.images || [{ url: '/placeholder-image.png' }],
  }));

  return (
    // Pass rawStore to ProductDetail to access theme settings in client component
    <ProductDetail product={product as MarketListingForm} related={relatedWithImages as MarketListingForm[]} storeData={rawStore as unknown as StoreForm} />
  );
}
