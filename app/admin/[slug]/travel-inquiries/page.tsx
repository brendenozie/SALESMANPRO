// app/admin/[slug]/inquiries/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminInquiriesClient from './AdminInquiriesClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminInquiries({ params }: PageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in layout layouts
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600 font-bold">
        Company not found
      </div>
    );
  }

  // Use the actual database ID for your operations or data passing
  const companyId = company.id;

  return <AdminInquiriesClient slug={slug} companyId={companyId} />;
}