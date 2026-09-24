// app/settings/page.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from '@/server/db/prismadb';
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

  // 3. Fetch real settings from database or fallback to company profile
  const dbSettings = await prisma.companySettings.findUnique({
    where: { companyId: company.id },
  });

  const initialSettings = {
    gymName: dbSettings?.companyName || company.name || 'Fitness & Wellness Hub',
    contactEmail: dbSettings?.contactEmail || company.email || '',
    contactPhone: dbSettings?.contactPhone || company.phone || '',
    address: dbSettings?.address || company.address || '',
    currency: dbSettings?.currency || 'USD',
    timezone: dbSettings?.timezone || 'America/New_York',
  };

  return <SettingsClient initialSettings={initialSettings} companyId={company.id} slug={slug} />;
}