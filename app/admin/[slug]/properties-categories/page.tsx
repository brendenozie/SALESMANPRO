// src/app/admin/[slug]/properties-categories/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import PropertyCategoriesClient from './PropertyCategoriesClient';

interface PropertiesCategoriesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertiesCategoriesPage({ params }: PropertiesCategoriesPageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact identifier used across admin layouts
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)[cite: 18]
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-red-500 font-sans">Company not found</div>;
  }

  // Use the actual database ID for your API calls[cite: 18]
  const companyId = company.id;

  return <PropertyCategoriesClient companyId={companyId} slug={slug} />;
}