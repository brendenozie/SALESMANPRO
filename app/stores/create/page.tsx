/*
  File: app/stores/create/page.tsx
  Server component fetching categories and rendering client form
*/
import React from 'react';
import { cookies } from 'next/headers';

const apiBaserUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const dynamic = 'force-dynamic';

export default async function CreateStorePage() {
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(
    `${apiBaserUrl}/admin/get-all-categories`,
    { cache: 'no-store', headers: { Cookie: cookieHeader, } }
  );

  const dataCategories = await res.json();
  
  const availableCategories = dataCategories.data?.results || [];

  const response = await fetch(`${apiBaserUrl}/admin/locations`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  });

  const dataLocations = await response.json();

  const availableLocations = dataLocations.data?.data || [];

  return <CreateStoreForm 
    availableCategories={availableCategories} 
    availableLocations={availableLocations} 
  />;
}

// Import client component below
import CreateStoreForm from '../../../components/stores/create/CreateStoreForm/CreateStoreForm';




