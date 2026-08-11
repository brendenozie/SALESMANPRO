// app/admin/[adminSlug]/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminDashboardClient from './AdminDashboardClient';

interface PageProps {
  params: Promise<{ adminSlug?: string; slug?: string }>;
}

export default async function AdminDashboardPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.adminSlug || resolvedParams.slug || '';

  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return <div>Company not found</div>;
  }

  return <AdminDashboardClient companyId={company.id} />;
}