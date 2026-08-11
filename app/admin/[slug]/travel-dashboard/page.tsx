// app/admin/[slug]/dashboard/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminDashboardClient from './AdminDashboardClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminDashboard({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used across layouts[cite: 16]
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)[cite: 16]
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-red-500 font-sans">Company not found</div>;
  }

  // Use the actual database ID for your API calls / dynamic links
  const companyId = company.id;

  return <AdminDashboardClient slug={slug} companyId={companyId} />;
}