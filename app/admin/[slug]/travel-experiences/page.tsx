// app/admin/[slug]/travel-experiences/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import TravelExperiencesManagementClient from './TravelExperiencesManagementClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TravelExperiencesManagementPage({ params }: PageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used across administrative layouts[cite: 18]
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data with zero redundant DB cost[cite: 18]
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-12 text-center text-red-500 font-sans">
        Company profile could not be resolved.
      </div>
    );
  }

  // Pass the verified company ID and slug down to the client container
  const companyId = company.id;

  return <TravelExperiencesManagementClient slug={slug} companyId={companyId} />;
}