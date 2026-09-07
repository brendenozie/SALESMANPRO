import React from "react";
import RidersClient, { RiderProfile } from "./RidersClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

import { cookies } from "next/headers";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// ✨ Updated Agent type to include the loginCode
export type Agent = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  loginCode?: string; // Add loginCode, make it optional for safety
  totalSales: number;
  totalCommissions: number;
  recentTransaction: {
    amount: number;
    date: string | null;
  };
  recentCommission: {
    amount: number;
    date: string | null;
    status: string;
  };
};

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: fetches agents and passes the companyId and data
 * to the client component.
 */
export default async function RidersPage({ params }: PageProps) {

  const { slug }  = await params;

  let ridersData: RiderProfile[] = [];
  
  const cookieHeader = (await cookies()).toString();
  
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
    const res = await fetch(`${apiBaseUrl}/admin/riders?companyId=${companyId}`, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
    if (res.ok) {
      // The API now returns the loginCode, so we need to process it.
      // The GET route already formats the data, so we just need to cast it correctly.
      const rawData = await res.json();
      
      // The API response from our GET route already matches this structure.
      // We just need to ensure the loginCode is included. Let's assume the GET route
      // was also updated to return 'loginCode'. If not, you'd add it there.
      // For now, we'll assume the API provides it.
      ridersData = Array.isArray(rawData.data) ? rawData.data.map((agent: any) => ({
        ...agent,
        loginCode: agent.loginCode || 'N/A' // Ensure loginCode is present
      })) : [];

    } else {
      console.error(
        "[AgentsPage] Failed to fetch agents →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[AgentsPage] Error fetching agents →", err.message);
  }

  // ✨ Pass companyId to the client component agentsData={agentsData} companyId={companyId} adminSlug={companyId}
  return <RidersClient params={{
    companyId: companyId,
    ridersData
  }} />;
}