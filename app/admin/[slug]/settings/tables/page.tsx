import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { findCompanyCached } from '@/lib/company-fetcher';
import FloorPlanManagementClient from './FloorPlanManagementClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: 'Floor Plan, Tables & Bar Stations | SalesmanPro Admin',
  description: 'Add, edit, reassign, and manage restaurant tables, bar counters, and dining floor sections.',
};

export default async function FloorPlanSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await findCompanyCached(slug, 'page');

  if (!company) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-slate-400">Loading floor plan settings...</p>
          </div>
        </div>
      }
    >
      <FloorPlanManagementClient
        companyId={company.id}
        companySlug={slug}
        companyName={company.name || 'Store'}
      />
    </Suspense>
  );
}
