// app/[slug]/products/[productId]/page.tsx
// Hybrid (Option B) refactor — server page + client ProductDetail

import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb'; // server-only
import { ProductDetail } from './ProductDetail'; // client component
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { MarketListingForm } from '@/types/typings';

export const revalidate = 60;

interface PageParams {
  slug: string;
  id: string;
}

interface PageProps {
  params: Promise<PageParams> | PageParams;
}

// Server component: fetch data, prepare props for the client ProductDetail
export default async function ProductPage({ params }: PageProps) {
  // support both direct and promised params
  const resolved = (params as any) instanceof Promise ? await params : params as PageParams;
  const { slug, id } = resolved;

  // validate params quickly
  if (!slug || !id) notFound();

  const product = await prisma.marketplaceListings.findFirst({
    where: { id: id },
    // include relations selectively if needed: images, variants, category
    include: {
      // images: true, // adjust to your schema
      productCategory: true,
    },
  });

  if (!product) notFound();

  const related = await prisma.marketplaceListings.findMany({
    where: {
      companyId: product.companyId,
      productCategoryId: product.productCategoryId,
      NOT: { id: product.id },
    },
    take: 8,
    include: { productCategory: true },
  });

  // Normalize images server-side to avoid runtime checks in client
const normalizeImages = (images: any): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean);
    }
    return [];
  };

  const productForClient: MarketListingForm = {
    ...product,
    images: normalizeImages(product.images),
    finalPrice: typeof product.finalPrice === 'number' ? product.finalPrice : Number(product.sellingPrice) || 0,
    sellingPrice: typeof product.sellingPrice === 'number' ? product.sellingPrice : 0,
    startDealDate: product.startDealDate instanceof Date ? product.startDealDate.toISOString() : product.startDealDate,
    endDealDate: product.endDealDate instanceof Date ? product.endDealDate.toISOString() : product.endDealDate,
    expirationDate: product.expirationDate instanceof Date ? product.expirationDate.toISOString() : product.expirationDate,
    availabilityStart: product.availabilityStart instanceof Date ? product.availabilityStart.toISOString() : product.availabilityStart,
    availabilityEnd: product.availabilityEnd instanceof Date ? product.availabilityEnd.toISOString() : product.availabilityEnd,
  };

  const relatedForClient : MarketListingForm[] = related.map(r => ({
    ...r,
    images: normalizeImages(r.images),
    startDealDate: r.startDealDate instanceof Date ? r.startDealDate.toISOString() : r.startDealDate,
    endDealDate: r.endDealDate instanceof Date ? r.endDealDate.toISOString() : r.endDealDate,
    expirationDate: r.expirationDate instanceof Date ? r.expirationDate.toISOString() : r.expirationDate,
    availabilityStart: r.availabilityStart instanceof Date ? r.availabilityStart.toISOString() : r.availabilityStart,
    availabilityEnd: r.availabilityEnd instanceof Date ? r.availabilityEnd.toISOString() : r.availabilityEnd,
  }));

  // Pass only necessary props to the client component (smaller bundle)
  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* ProductDetail is a client component, defined below */}
      <ProductDetail
        product={productForClient}
        related={relatedForClient}
      />

      <NewsletterSection />
    </div>
  );
}
