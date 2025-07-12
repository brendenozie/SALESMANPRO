// pages/StorePage.jsx (or .tsx)

'use client';

import React, { ReactNode } from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import categoryBodyLayoutMap from '@/components/site/layouts/StoreBody';


// (3) In your component, just look up the normalized key.
export default function StorePage() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  // Normalize category (lowercase everything—keep whitespace/punctuation if you want,
  // or strip it out here, as long as your keys match the object above).
  // const rawCategory = storeFormData.category || 'other';
  // // const type = rawCategory.toLowerCase();
  const type = normalizeCategory(storeFormData.category || 'other');

  // Look up in the map; fallback to DefaultSite if not present.
  const ComponentToRender = categoryBodyLayoutMap[type] ?? categoryBodyLayoutMap['default'];;
  return <ComponentToRender />;
}

function normalizeCategory(raw:string) {
  return raw
    .trim()              // remove leading/trailing spaces
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, '') // strip out unexpected characters (except “&” or space)
    .replace(/\s+/g, ' ')        // collapse multiple spaces to one
}