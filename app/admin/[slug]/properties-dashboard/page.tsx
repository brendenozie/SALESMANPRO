// app/admin/[slug]/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminDashboardClient from './AdminDashboardClient';

interface AdminDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used across admin layouts[cite: 18]
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)[cite: 18]
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-red-500 font-sans">Company not found</div>;
  }

  // Use the actual database ID for your API calls and child routes[cite: 18]
  const companyId = company.id;

  return <AdminDashboardClient companyId={companyId} slug={slug} />;
}