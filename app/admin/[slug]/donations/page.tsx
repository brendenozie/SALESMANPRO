// app/admin/donations/page.tsx
import React from "react";
import DonationsClient from "./DonationsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define the Donation type based on your Prisma schema
export type Donation = {
  id: string;
  donorId: string;
  donor: {
    id: string;
    name: string | null;
    email: string;
  };
  amount: number;
  currency: string;
  donationDate: string; // ISO string
  paymentMethod: string | null;
  notes: string | null;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  projectId: string | null;
  project: {
    id: string;
    name: string;
  } | null;
  campaignId: string | null;
  campaign: {
    id: string;
    name: string;
  } | null;
  transactionId: string | null;
  createdAt: string;
};

interface PageProps {
  params: {
    slug: string; // companyId - assuming donations can be filtered by company
  };
}

/**
 * Server Component: fetches the donations on every request (cache: "no-store"),
 * then renders the client component with the fetched data.
 */
export default async function DonationsPage({ params }: PageProps) {
  const companyId = params.slug; // Assuming donations can be filtered by companyId
  let donationsData: Donation[] = [];

  try {
    // Adjust the API endpoint if your donations API supports companyId filtering
    const res = await fetch(`${apiUrl}/donations?companyId=${companyId}`, { cache: "no-store" });
    if (res.ok) {
      donationsData = (await res.json()) as Donation[];
    } else {
      console.error(
        "[DonationsPage] Failed to fetch donations →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[DonationsPage] Error fetching donations →", err.message);
  }

  return <DonationsClient donationsData={donationsData} />;
}
