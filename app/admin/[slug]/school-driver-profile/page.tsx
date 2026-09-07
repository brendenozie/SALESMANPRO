// app/driver/profile/page.tsx
import React from "react";
import ProfileClient from "./ProfileClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DriverProfilePage({ params }: PageProps) {
  let driverData = null;
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
    const res = await fetch(`${apiBaseUrl}/driver/me`, {
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });

    if (res.ok) {
      const rawData = await res.json();
      driverData = rawData.data;
    }
  } catch (err) {
    console.error("Failed to fetch driver profile", err);
  }

  return <ProfileClient initialData={driverData} />;
}