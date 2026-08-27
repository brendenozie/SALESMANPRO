// app/admin/[slug]/packages/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminPackagesClient from './AdminPackagesClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminPackages({ params }: PageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in layout layouts
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-rose-600 font-bold">
        Company not found
      </div>
    );
  }

  // Use the actual database ID for your operations
  const companyId = company.id;

  return <AdminPackagesClient slug={slug} companyId={companyId} />;
}