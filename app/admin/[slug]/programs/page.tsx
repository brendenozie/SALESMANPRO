// app/admin/[slug]/programs/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import ProgramManagementClient from './ProgramManagementClient';

interface ProgramManagementPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProgramManagementPage({ params }: ProgramManagementPageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)[cite: 18]
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-red-500 font-sans">Company not found</div>;
  }

  // Use the actual database ID for your API calls, ensuring consistency[cite: 18]
  const companyId = company.id;

  return <ProgramManagementClient companyId={companyId} slug={slug} />;
}