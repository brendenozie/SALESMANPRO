/*
  File: app/stores/create/page.tsx
  Server component fetching categories and rendering client form
*/
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function CreateStorePage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/get-all-categories`,
    { cache: 'no-store' }
  );
  const dataCategories = await res.json();
  
  const availableCategories = dataCategories.results;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/locations`);
  
  const dataLoctions = await response.json();
      
  const availableLocations = dataLoctions.data || [];

  return <CreateStoreForm availableCategories={availableCategories} availableLocations={availableLocations} />;
}

// Import client component below
import CreateStoreForm from '../../../components/stores/create/CreateStoreForm/CreateStoreForm';



