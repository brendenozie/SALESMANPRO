// app/admin/agents/page.tsx

import React from "react";
import AgentsClient from "./AgentsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type Agent = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
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
    slug: string; // companyId
  };
}

/**
 * Server Component: fetches the agents on every request (cache: "no-store"),
 * then renders the client component with the fetched data.
 */
export default async function AgentsPage({ params }: PageProps) {
  const companyId = params.slug;
  let agentsData: Agent[] = [];

  try {
    const res = await fetch(`${apiUrl}/admin/agents?companyId=${companyId}`, { cache: "no-store" });
    if (res.ok) {
      agentsData = (await res.json()) as Agent[];
      // Assuming the API returns an array of agents directly.
      // If your API returns { agents: [...] }, adjust accordingly:
      // const json = await res.json();
      // agentsData = json.agents;
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

  return <AgentsClient agentsData={agentsData} />;
}
