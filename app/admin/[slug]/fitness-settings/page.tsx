// app/settings/page.tsx
import React from 'react';
import { getSettingsData } from '@/constant/Data';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import SettingsClient from './SettingsClient';

interface SettingsProps {
  params: Promise<{ slug: string }>;
}

export default async function SettingsPage({ params }: SettingsProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-white">Company not found</div>;
  }

  // Retrieve initial settings on the server
  const initialSettings = getSettingsData(company.id);

  return <SettingsClient initialSettings={initialSettings} />;
}