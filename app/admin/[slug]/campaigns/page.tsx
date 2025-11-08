// app/admin/campaigns/page.tsx
import React from "react";
import CampaignsClient from "./CampaignsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  params:Promise<{ slug: string }>
}

/**
 * Server Component: fetches the campaigns on every request (next: { revalidate: 60 }),
 * then renders the client component with the fetched data.
 */
export default async function CampaignsPage({ params }: PageProps) {
  const { slug : companyId } = await params; // Assuming campaigns can be filtered by companyId
  const cookieHeader = (await cookies()).toString();
  let campaignsData: Campaign[] = [];

  try {
    // Adjust the API endpoint if your campaigns API supports companyId filtering
    const res = await fetch(`${apiBaseUrl}/campaigns?companyId=${companyId}`, { next: { revalidate: 60 }, headers: { cookie: cookieHeader } });
    if (res.ok) {
      let data = await res.json();
      campaignsData = data.map((campaign: any) => ({
        ...campaign,
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString() : null,
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString() : null,
        createdAt: new Date(campaign.createdAt).toISOString(),
        updatedAt: new Date(campaign.updatedAt).toISOString(),
      })) as Campaign[];
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
