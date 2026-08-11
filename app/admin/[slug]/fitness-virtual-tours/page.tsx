// app/virtual-tours/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import VirtualToursClient from './VirtualToursClient';

interface AdminVirtualToursPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminVirtualToursPage({ params }: AdminVirtualToursPageProps) {
  const { slug } = await params;

  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-slate-900 dark:text-slate-100">Company not found</div>;
  }

  return <VirtualToursClient slug={slug || ''} companyId={company.id} />;
}