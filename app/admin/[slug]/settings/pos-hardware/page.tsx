import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { findCompanyCached } from '@/lib/company-fetcher';
import POSHardwareSettingsClient from './POSHardwareSettingsClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: 'POS Hardware & Peripherals Manager | SalesmanPro',
  description: 'Configure receipt printers, electronic scales, cash drawers, and secondary customer displays.',
};

export default async function POSHardwareSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await findCompanyCached(slug, 'page');

  if (!company) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-zinc-500">Loading POS hardware settings...</p>
          </div>
        </div>
      }
    >
      <POSHardwareSettingsClient
        companyId={company.id}
        companySlug={slug}
        companyName={company.name || 'Store'}
      />
    </Suspense>
  );
}
