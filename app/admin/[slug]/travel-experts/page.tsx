// app/admin/[slug]/experts/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminExpertsClient from './AdminExpertsClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminExpertsPage({ params }: PageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used across administrative layouts[cite: 19]
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data with no extra database cost[cite: 19]
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-rose-500 font-sans font-bold">
        Company not found
      </div>
    );
  }

  // Use the verified database ID for your API endpoints, ensuring consistency[cite: 19]
  const companyId = company.id;

  return <AdminExpertsClient slug={slug} companyId={companyId} />;
}