/*
  File: app/stores/create/page.tsx
  Server component fetching categories and rendering client form
*/
import React from 'react';
import { cookies } from 'next/headers';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const dynamic = 'force-dynamic';

export default async function CreateStorePage() {

  const cookieHeader = (await cookies()).toString();

  const res = await fetch(
    `${apiBaseUrl}/admin/get-all-categories?limit=100`,
    { cache: 'no-store', headers: { Cookie: cookieHeader, } }
  );

  const dataCategories = await res.json();
  
  const availableCategories = dataCategories.data?.results || [];

  const response = await fetch(`${apiBaseUrl}/admin/locations`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  });

  const dataLocations = await response.json();

  const availableLocations = dataLocations.data?.data || [];

  const resSiteCategories = await fetch(`${apiBaseUrl}/site-categories?limit=100`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  });

  const dataSiteCategories = await resSiteCategories.json();

  const siteCategories = dataSiteCategories.data || [];

  console.log(siteCategories);

  return <CreateStoreForm 
    availableCategories={availableCategories} 
    availableLocations={availableLocations} 
    siteCategories={siteCategories} // Pass site categories as well
  />;
}

// Import client component below
import CreateStoreForm from '../../../components/stores/create/CreateStoreForm/CreateStoreForm';




