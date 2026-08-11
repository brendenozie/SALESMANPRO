import React from "react";
import { cookies } from "next/headers";
import MarketplaceManagementClient from "./CompaniesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompanyManagementPage({ params }: PageProps ) {
  let listings = [];
  let meta = {};
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
    const res = await fetch(`${apiBaseUrl}/admin/marketplace-gh`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store'
    });

    if (res.ok) {
      const json = await res.json();
      console.log("Fetched listings:", json);
      listings = json.data.results || [];
      meta = json.data.meta || {};
    }
  } catch (err) {
    console.error("Failed to fetch listings:", err);
  }

  return <MarketplaceManagementClient initialListings={listings} initialMeta={meta} />;
}