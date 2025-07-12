// app/admin/campaigns/page.tsx
import React from "react";
import CampaignsClient from "./CampaignsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define the Campaign type based on your Prisma schema
export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null; // ISO string
  endDate: string | null; // ISO string
  goalAmount: number | null;
  currentAmount: number;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  // Include relations if needed
  // donations: any[];
  createdAt: string;
  updatedAt: string;
};

interface PageProps {
  params: {
    slug: string; // companyId - assuming campaigns can be filtered by company
  };
}

/**
 * Server Component: fetches the campaigns on every request (cache: "no-store"),
 * then renders the client component with the fetched data.
 */
export default async function CampaignsPage({ params }: PageProps) {
  const companyId = params.slug; // Assuming campaigns can be filtered by companyId
  let campaignsData: Campaign[] = [];

  try {
    // Adjust the API endpoint if your campaigns API supports companyId filtering
    const res = await fetch(`${apiUrl}/campaigns?companyId=${companyId}`, { cache: "no-store" });
    if (res.ok) {
      campaignsData = (await res.json()) as Campaign[];
    } else {
      console.error(
        "[CampaignsPage] Failed to fetch campaigns →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[CampaignsPage] Error fetching campaigns →", err.message);
  }

  return <CampaignsClient campaignsData={campaignsData} />;
}
