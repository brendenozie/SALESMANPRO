import React from "react";
import ClientInventoryClient from "./ClientInventoryClient";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import {
  getStoreCategoriesByCompanyId,
  getStoreMarketplaceListings,
} from "@/lib/store-category-service";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }> | { page?: string };
}

export default async function ClientInventoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams;

  const page = Number(resolvedSearchParams?.page || 1);
  const limit = 20;

  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  // Use the actual database ID for your API calls, ensuring consistency
  const companyId = company.id;

  // Load categories and marketplace listings directly from database with zero internal HTTP overhead
  const [categoriesData, { results: productsData, meta }] = await Promise.all([
    getStoreCategoriesByCompanyId(companyId),
    getStoreMarketplaceListings(companyId, page, limit),
  ]);

  return (
    <ClientInventoryClient
      companyId={companyId}
      slug={slug}
      page={page}
      limit={limit}
      searchParams={resolvedSearchParams}
      productsData={productsData as MarketListingForm[]}
      categoriesData={categoriesData}
      pagination={meta}
    />
  );
}

