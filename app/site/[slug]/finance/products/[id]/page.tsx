import { getTenantProductDetail, getTenantProductMetadata } from '@/lib/tenant-product-service';
import type { Metadata } from 'next';
// app/[slug]/products/[productId]/page.tsx
// Hybrid (Option B) refactor — server page + client ProductDetail

import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb'; // server-only
import FinanceLegalServiceView from './FinanceLegalServiceView'; // client component
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = (params as any) instanceof Promise ? await params : params as PageParams;
  return getTenantProductMetadata(resolved.slug, resolved.id);
}

export default async function ProductPage({ params }: PageProps) {
  // support both direct and promised params
  const resolved = (params as any) instanceof Promise ? await params : params as PageParams;
  const { slug, id } = resolved;

  // validate params quickly
  if (!slug || !id) notFound();

  const data = await getTenantProductDetail(slug, id);
  if (!data) notFound();

  const productForClient = data.product;
  const relatedForClient = data.related;

  // Pass only necessary props to the client component (smaller bundle)
  return (
    <div>
      {/* ProductDetail is a client component, defined below */}
      <FinanceLegalServiceView
        product={productForClient}
        related={relatedForClient}
      />

      <NewsletterSection />
    </div>
  );
}
