'use client';

import dynamic from 'next/dynamic';
import { useStoreContext } from '@/contexts/StoreContext';
import { folderMap, siteComponentNameMap } from '@/components/site/layouts/siteLayoutMap';
import { StoreForm } from '@/types/typings';

type DynamicStoreBodyProps = {
  // We'll pass the initial data to this component
  initialStoreData: StoreForm;
};

// Re-implement your normalization logic
function normalizeCategory(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, '')
    .replace(/\s+/g, ' ');
}

export default function DynamicStoreBody({ initialStoreData }: DynamicStoreBodyProps) {
  const { storeFormData } = useStoreContext();

  // If the context is empty, use the initial data passed from the server.
  // This is a robust way to handle both initial load and subsequent client-side updates.
  const dataToUse = storeFormData || initialStoreData;

  if (!dataToUse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  // 1. Determine the category
  const key = normalizeCategory(dataToUse.category || 'other');

  // 2. Map category to Layout folder name
  const folder = folderMap[key] ?? folderMap['default'];

  // 3. Map Layout folder name to the specific Site Component name
  const siteComponentName = siteComponentNameMap[folder] ?? siteComponentNameMap['DefaultLayout'];

  // 4. Dynamically import the component
  const BodyComponent = dynamic<{ storeData: StoreForm }>(
    () => import(`@/components/site/layouts/${folder}/body/${siteComponentName}`).then(mod => mod.default),
    {
      loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
      ssr: false, // This is now in a Client Component, so it's allowed.
    }
  );

  if (!BodyComponent) {
    console.error(`Error: No dynamic component found for category: ${dataToUse.category}. Resolved to site component: ${siteComponentName}`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Error loading store content.</p>
      </div>
    );
  }

  return <BodyComponent storeData={dataToUse} />;
}