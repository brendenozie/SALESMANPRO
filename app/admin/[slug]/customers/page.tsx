// app/admin/clients/page.tsx

import React from "react";
import ClientsClient from "./ClientsClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSales: number;
  recentTransactionAmount: number;
  recentTransactionDate: string;
  status: "new" | "active";
};

interface PageProps {
  params: Promise<{ slug: string }>;
}


/**
 * Server Component that fetches clients on every request
 * (next: { revalidate: 60 }) and passes the array down to the client side.
 */
export default async function ClientsPage({ params }: PageProps) {
  let clientsData: Client[] = [];
  const cookieHeader = (await cookies()).toString();
  
    const { slug } = await params;
  
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

  try {
    const res = await fetch(`${apiBaseUrl}/admin/clients?companyId=${companyId}`, { next: { revalidate: 60 }, headers: { cookie: cookieHeader } });
    if (res.ok) {
      const json = await res.json();
      clientsData = (json.data || []) as Client[];
    }
  } catch (err: any) {
    // Error fetching clients
  }

  return <ClientsClient initialClients={clientsData} companyId={companyId} />;
}
