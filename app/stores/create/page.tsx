/*
  File: app/stores/create/page.tsx
  Server component fetching categories and rendering client form
*/
import React from 'react';

interface CategoryOption { id: string; name: string; }

export const dynamic = 'force-dynamic';

export default async function CreateStorePage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/shop/categories`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const availableCategories: CategoryOption[] = data.categories.map((c: any) => ({ id: c.id, name: c.name }));

  return <CreateStoreForm availableCategories={availableCategories} />;
}

// Import client component below
import CreateStoreForm from '../../../components/stores/create/CreateStoreForm/CreateStoreForm';


