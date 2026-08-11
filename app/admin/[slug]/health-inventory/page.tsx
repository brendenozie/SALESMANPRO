// app/inventory/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import InventoryClient from './InventoryClient';

interface AdminInventoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminInventoryPage({ params }: AdminInventoryPageProps) {
  const { slug } = await params;

  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-gray-900 dark:text-white">Company not found</div>;
  }

  // Use the actual database ID for API calls or passing down as props
  const companyId = company.id;

  return <InventoryClient companyId={companyId} slug={slug || ''} />;
}