// app/admin/donations/page.tsx
import React from "react";
import DonationsClient from "./DonationsClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

type UserOption = { id: string; name: string; email: string };
type ProjectOption = { id: string; name: string };
type CampaignOption = { id: string; name: string };

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
  params:Promise<{ slug: string }>
}

/**
 * Server Component: fetches the donations on every request (next: { revalidate: 60 }),
 * then renders the client component with the fetched data.
 */
export default async function DonationsPage({ params }: PageProps) {

  const { slug } = await params; // Assuming donations can be filtered by companyId
  const cookieHeader = (await cookies()).toString();
  let donationsData: Donation[] = [];
  let donorsData: UserOption[] = [];
  let projectsData: ProjectOption[] = [];
  let campaignsData: CampaignOption[] = [];
    
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
    // Adjust the API endpoint if your donations API supports companyId filtering
    const res = await fetch(`${apiBaseUrl}/admin/donations?companyId=${companyId}`, { next: { revalidate: 60 }, headers: { cookie: cookieHeader } });
    if (res.ok) {
      let data = await res.json();
      // console.log("Fetched donations data:", data);
      // Convert donationDate and createdAt to ISO strings if they are Date objects
      donationsData = data.data.map((donation: any) => ({
        ...donation,
        donationDate: new Date(donation.donationDate).toISOString(),
        createdAt: new Date(donation.createdAt).toISOString(),
      }));
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

  
  try {
    // Adjust the API endpoint if your donors API supports companyId filtering
    const res = await fetch(`${apiBaseUrl}/admin/donors?companyId=${companyId}`, { next: { revalidate: 60 }, headers: { cookie: cookieHeader } });
    if (res.ok) {
      let data = await res.json();
      donorsData = data.map((donor: any) => ({
        id: donor.id,
        name: donor.name,
        email: donor.email,
      })) as UserOption[];
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


  
  try {
    // Adjust the API endpoint if your projects API supports companyId filtering
    const res = await fetch(`${apiBaseUrl}/admin/projects?companyId=${companyId}`, { next: { revalidate: 60 }, headers: { cookie: cookieHeader } });
    if (res.ok) {
      let data = await res.json();
      projectsData = data.map((project: any) => ({
        id: project.id,
        name: project.name,
      })) as ProjectOption[];
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

  
  try {
    // Adjust the API endpoint if your campaigns API supports companyId filtering
    const res = await fetch(`${apiBaseUrl}/admin/campaigns?companyId=${companyId}`, { next: { revalidate: 60 }, headers: { cookie: cookieHeader } });
    if (res.ok) {
      let data = await res.json();
      campaignsData = data.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
      })) as CampaignOption[];
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

  return <DonationsClient donationsData={donationsData}
              donorsData={donorsData}
              projectsData={projectsData}
              campaignsData={campaignsData}
   />;
}
