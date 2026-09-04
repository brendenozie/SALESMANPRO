/* File: app/stores/create/page.tsx */
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

export const dynamic = "force-dynamic";

// 1. Ingest ultra-fast data services directly (Bypasses local HTTP loops)
import { 
  getCachedAdminCategories, 
  getCachedLocations, 
  getCachedSiteCategories 
} from '@/lib/services/store-data';

// 2. Progressive Code Splitting: Lazy load the heavy client-side multi-step form UI shell
const CreateStoreForm = nextDynamic(
  () => import('../../../components/stores/create/CreateStoreForm/CreateStoreForm'),
  {
    ssr: true, // Keep true to render HTML elements cleanly into initial payload
    loading: () => <FormLoaderFallback />
  }
);

export default async function CreateStorePage() {
  // Parallel Execution Matrix - executes purely on local memory/DB level inside the data center
  const [categories, locations, siteCategories] = await Promise.all([
    getCachedAdminCategories(100),
    getCachedLocations(),
    getCachedSiteCategories(100)
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/20 py-8">
      <Suspense fallback={<FormLoaderFallback />}>
        <CreateStoreForm
          availableCategories={(categories?.results?.map(cat => ({
            ...cat,
            subcategories: cat.subcategories && typeof cat.subcategories === 'object' ? cat.subcategories as any[] : undefined
          })) || []) as any[]}
          availableLocations={(locations?.data as unknown as any[]) || []}
          siteCategories={siteCategories || []}
        />
      </Suspense>
    </div>
  );
}

/**
 * An elegant, premium UI loading placeholder block displayed while 
 * the massive multi-step form chunks are being loaded in by the client
 */
function FormLoaderFallback() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-4 w-72 bg-gray-100 dark:bg-zinc-900 rounded-md" />
      </div>
      <div className="space-y-4 border border-gray-100 dark:border-zinc-900 p-6 rounded-2xl bg-white dark:bg-zinc-900/40 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-gray-100 dark:bg-zinc-900 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-gray-100 dark:bg-zinc-900 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800 rounded" />
          <div className="h-24 w-full bg-gray-100 dark:bg-zinc-900 rounded-xl" />
        </div>
      </div>
    </div>
  );
}