import { getTenantProductDetail, getTenantProductMetadata } from '@/lib/tenant-product-service';
import type { Metadata } from 'next';
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


export async function generateMetadata({ params }: any): Promise<Metadata> {
  const resolved = params instanceof Promise ? await params : params;
  const targetId = resolved?.id || resolved?.productId;
  return getTenantProductMetadata(resolved?.slug, targetId);
}

export default async function ProductPage({ params }: any) {
  const resolved = params instanceof Promise ? await params : params;
  const { slug } = resolved || {};
  const targetId = resolved?.id || resolved?.productId;

  if (!slug || !targetId) notFound();

  const data = await getTenantProductDetail(slug, targetId);
  if (!data) notFound();

  const product = data.product;
  const relatedWithImages = data.related;
  const rawStore = data.company;

  return (
    // Pass rawStore to ProductDetail to access theme settings in client component
    <ProductDetail product={product as MarketListingForm} related={relatedWithImages as MarketListingForm[]} storeData={rawStore as unknown as StoreForm} />
  );
}
