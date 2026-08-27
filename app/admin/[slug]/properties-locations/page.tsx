// src/app/admin/[slug]/properties-locations/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import PropertyLocationsClient from './PropertyLocationsClient';

interface LocationsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertiesLocationsPage({ params }: LocationsPageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used across admin layouts
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-red-500 font-sans">Company not found</div>;
  }

  // Use the actual database ID for your API calls, ensuring consistency
  const companyId = company.id;

  return <PropertyLocationsClient companyId={companyId} slug={slug} />;
}