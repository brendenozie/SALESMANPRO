// app/admin/[adminSlug]/routes/page.tsx
import React from "react";
import RoutesClient, { RouteProfile } from "./RoutesClient";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function SchoolDriverRoutesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: adminSlug } = await params;
  let routesData: RouteProfile[] = [];
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
    const res = await fetch(`${apiBaseUrl}/admin/routes?driverId=${adminSlug}`, {
      next: { revalidate: 60 },
      headers: { Cookie: cookieHeader },
    });

    if (res.ok) {
      const rawData = await res.json();
      routesData = rawData.data; // Assuming API returns an array of RouteProfile
    }
  } catch (err) {
    console.error("Failed to fetch routes", err);
  }

  return <RoutesClient adminSlug={adminSlug} initialRoutes={routesData} />;
}