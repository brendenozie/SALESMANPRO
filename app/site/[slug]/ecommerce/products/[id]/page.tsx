import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import { ProductDetail } from './ProductDetail';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { MarketListingForm } from '@/types/typings';
import { findCompanyCached } from '@/lib/company-fetcher';
import { fetchWithCache, buildTenantCacheKey } from '@/lib/cache';

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

  // Resolve tenant first to ensure strict tenant isolation
  const company = await findCompanyCached(slug, "lean");
  if (!company) notFound();

  // Fetch product with tenant scope and singleflight cache protection
  const productKey = buildTenantCacheKey(company.id, "product_detail", { id });
  const product = await fetchWithCache(
    productKey,
    () =>
      prisma.marketplaceListings.findFirst({
        where: { id: id, companyId: company.id },
        include: {
          productCategory: true,
        },
      }),
    300
  );

  if (!product) notFound();

  // Fetch related products with tenant scope and singleflight caching
  const relatedKey = buildTenantCacheKey(company.id, "related_products", {
    categoryId: product.productCategoryId || "none",
    excludeId: product.id,
  });

  const related = await fetchWithCache(
    relatedKey,
    () =>
      prisma.marketplaceListings.findMany({
        where: {
          companyId: company.id,
          productCategoryId: product.productCategoryId,
          NOT: { id: product.id },
        },
        take: 8,
        include: { productCategory: true },
      }),
    300
  );


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
    productCategoryId: product.productCategoryId || '',
    finalPrice: typeof product.finalPrice === 'number' ? product.finalPrice : Number(product.sellingPrice) || 0,
    sellingPrice: typeof product.sellingPrice === 'number' ? product.sellingPrice : 0,
    startDealDate: product.startDealDate instanceof Date ? product.startDealDate.toISOString() : product.startDealDate,
    endDealDate: product.endDealDate instanceof Date ? product.endDealDate.toISOString() : product.endDealDate,
    expirationDate: product.expirationDate instanceof Date ? product.expirationDate.toISOString() : product.expirationDate,
    availabilityStart: product.availabilityStart instanceof Date ? product.availabilityStart.toISOString() : product.availabilityStart,
    availabilityEnd: product.availabilityEnd instanceof Date ? product.availabilityEnd.toISOString() : product.availabilityEnd,
    listingMarketStatus: product.listingMarketStatus as any,
  } as MarketListingForm;

  const relatedForClient : MarketListingForm[] = related.map(r => ({
    ...r,
    images: normalizeImages(r.images),
    productCategoryId: r.productCategoryId || '',
    finalPrice: typeof r.finalPrice === 'number' ? r.finalPrice : Number(r.sellingPrice) || 0,
    sellingPrice: typeof r.sellingPrice === 'number' ? r.sellingPrice : 0,
    startDealDate: r.startDealDate instanceof Date ? r.startDealDate.toISOString() : r.startDealDate,
    endDealDate: r.endDealDate instanceof Date ? r.endDealDate.toISOString() : r.endDealDate,
    expirationDate: r.expirationDate instanceof Date ? r.expirationDate.toISOString() : r.expirationDate,
    availabilityStart: r.availabilityStart instanceof Date ? r.availabilityStart.toISOString() : r.availabilityStart,
    availabilityEnd: r.availabilityEnd instanceof Date ? r.availabilityEnd.toISOString() : r.availabilityEnd,
    listingMarketStatus: r.listingMarketStatus as any,
    listingSystemStatus: r.listingSystemStatus as any,
  })) as MarketListingForm[];

  // Pass only necessary props to the client component (smaller bundle)
  return (
    <div  className=" bg-[#fafaf9] dark:bg-black transition-colors duration-300">
      
      <div className="py-16 bg-[#fafaf9] dark:bg-black transition-colors duration-300">
      </div>
      {/* ProductDetail is a client component, defined below */}
      <ProductDetail
        product={productForClient}
        related={relatedForClient}
      />
      <div className="py-16 bg-[#fafaf9] dark:bg-black transition-colors duration-300">
        <NewsletterSection className="bg-[#fafaf9] dark:bg-black " />
      </div>
    </div>
  );
}
