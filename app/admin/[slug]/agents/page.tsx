import React from "react";
import AgentsClient from "./AgentsClient";

import { cookies } from "next/headers";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  params: {
    slug: string; // This is the companyId
  };
}

/**
 * Server Component: fetches agents and passes the companyId and data
 * to the client component.
 */
export default async function AgentsPage({ params }: PageProps) {
  const companyId = params.slug;
  let agentsData: Agent[] = [];
  const cookieHeader = await cookies().toString();
  
  try {
    const res = await fetch(`${apiUrl}/admin/agents?companyId=${companyId}`, {
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
      agentsData = Array.isArray(rawData.data) ? rawData.data.map((agent: any) => ({
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
  return <AgentsClient params={{
    companyId: companyId,
    agentsData
  }} />;
}