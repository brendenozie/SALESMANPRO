// app/admin/[adminSlug]/trips/today/page.tsx
import React from "react";
import TodayTripsClient from "./TodayTripsClient";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function TodayTripsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: adminSlug } = await params;
  let tripsData = [];
  const cookieHeader = (await cookies()).toString();

    // const { slug } = await params;
  
    // const session = await getAuthSession();
  
    // // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    // const identifier = slug || session?.user?.id || '';
  
    // // 2. Retrieve the memoized company data (no extra DB cost)
    // const company = await findCompanyCached(identifier, "page");
  
    // if (!company) {
    //   return <div>Company not found</div>;
    // }
  
    // // Use the actual database ID for your API calls, ensuring consistency
    // const companyId = company.id;

  try {
    const res = await fetch(`${apiBaseUrl}/admin/trips/today?driverId=${adminSlug}`, {
      cache: 'no-store', // Always get fresh data for "Today"
      headers: { Cookie: cookieHeader },
    });

    if (res.ok) {
      const rawData = await res.json();
      tripsData = rawData.data;
    }
  } catch (err) {
    console.error("Failed to fetch today's trips", err);
  }

  return <TodayTripsClient adminSlug={adminSlug} initialTrips={tripsData} />;
}