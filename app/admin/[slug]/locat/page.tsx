// app/admin/[slug]/locations/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import LocationManagementClient from './LocationManagementClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LocationManagementPage({ params }: PageProps) {
  const { slug } = await params;

  const session = await getAuthSession();

  // Safely resolve the exact same identifier used across the application
  const identifier = slug || session?.user?.id || '';

  // Retrieve company data on the server
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return <div>Company not found</div>;
  }

  return <LocationManagementClient companyId={company.id} />;
}