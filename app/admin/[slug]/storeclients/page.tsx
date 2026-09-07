// app/admin/clients/page.tsx
import React from "react";
import ClientsClient, { Client } from "./ClientsClient"; // Import the ClientsClient component and Client type
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: fetches the clients on every request (next: { revalidate: 60 }),
 * then renders the client component with the fetched data.
 */
export default async function ClientsPage({ params }: PageProps) {
  const { slug }  = await params;
  const cookieStore = (await cookies()).toString();
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  let clientsData: Client[] = [];

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/clients?companyId=${companyId}`,
      { 
        headers: { cookie: cookieStore }, 
        next: { revalidate: 60 } 
      }
    );

    if (res.ok) {
      clientsData = (await res.json()).data as Client[];
    } else {
      console.error(
        "[ClientsPage] Failed to fetch clients →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[ClientsPage] Error fetching clients →", err.message);
  }

  // Pass companyId so ClientsClient can include it in POST/PATCH/DELETE calls
  return (
    <ClientsClient
      companyId={companyId}
      clientsData={clientsData}
    />
  );
}
