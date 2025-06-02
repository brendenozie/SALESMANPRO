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
  const data = await res.json();
  const availableCategories: ParentCategory[] = data.categories;//.map((c: any) => ({ id: c.id, name: c.name }));

  console.log(availableCategories);

  return <CreateStoreForm availableCategories={availableCategories} />;
}

// Import client component below
import CreateStoreForm from '../../../components/stores/create/CreateStoreForm/CreateStoreForm';
import { ParentCategory } from '../../../types/typings';


