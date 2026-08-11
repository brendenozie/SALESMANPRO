// app/trainers/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import TrainersClient from './TrainersClient';

interface TrainersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TrainersPage({ params }: TrainersPageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-slate-900 dark:text-slate-50">Company not found</div>;
  }

  return <TrainersClient slug={slug || ''} companyId={company.id} />;
}