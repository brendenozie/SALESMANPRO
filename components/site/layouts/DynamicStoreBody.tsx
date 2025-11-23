// components/site/layouts/DynamicStoreBody.tsx

'use client';

import dynamic from 'next/dynamic';
import { useStoreContext } from '@/contexts/StoreContext';
import { folderMap, siteComponentNameMap } from '@/components/site/layouts/siteLayoutMap';
import { StoreForm } from '@/types/typings';

// No props are needed anymore.
export default function DynamicStoreBody() {
  // Rely ONLY on the context. It's now the single source of truth.
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  // All subsequent logic remains the same, just use `storeFormData`
  const key = normalizeCategory(storeFormData.category || storeFormData.variant || 'other');
  const folder = folderMap[key] ?? folderMap['default'];
  const siteComponentName = siteComponentNameMap[folder] ?? siteComponentNameMap['DefaultLayout'];

  const BodyComponent = dynamic<{ storeData: StoreForm }>(
    () => import(`@/components/site/layouts/${folder}/body/${siteComponentName}`).then(mod => mod.default),
    {
      loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
      ssr: false,
    }
  );

  if (!BodyComponent) {
    console.error(`Error: No dynamic component found for category: ${storeFormData.category}. Resolved to site component: ${siteComponentName}`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Error loading store content.</p>
      </div>
    );
  }

  return <BodyComponent storeData={storeFormData} />;
}

// Keep your normalization function
function normalizeCategory(raw: string) {
 return raw
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9& ]/g, '')
  .replace(/\s+/g, ' ');
}