import React from 'react';
import CategoryManagerClient from './CategoryManagerClient';
import { IStoreCategory } from '@/types/typings';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { getStoreCategoriesByCompanyId } from '@/lib/store-category-service';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Server Component: fetches store-specific category settings
 * directly from database and passes them down to the client component.
 */
export default async function CategoryManagerPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;
  const storeCategories: IStoreCategory[] = await getStoreCategoriesByCompanyId(companyId);

  return <CategoryManagerClient initialCategories={storeCategories} apiBaseUrl={apiBaseUrl} companyId={companyId} />;
}

