// app/admin/[slug]/inquiries/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import InquiriesClient from './InquiriesClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InquiriesPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return <div>Company not found</div>;
  }

  return <InquiriesClient companyId={company.id} />;
}