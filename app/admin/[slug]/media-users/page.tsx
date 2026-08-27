// app/admin/[adminSlug]/users/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import UsersClient from './UsersClient';

interface PageProps {
  params: Promise<{ adminSlug?: string; slug?: string }>;
}

export default async function UserManagementPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.adminSlug || resolvedParams.slug || '';

  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)[cite: 16]
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return <div className="p-8 text-center text-red-500">Company not found</div>;
  }

  return <UsersClient companyId={company.id} />;
}