import React from "react";
import { cookies } from "next/headers";
import LocationsClient from "./LocationsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

interface Location {
  id: string;
  locationId: string;
  parentId: string | null;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  capacity?: number | null;
  openHours?: string | null;
  status: "active" | "inactive" | "draft";
  sortOrder: number;
  visible: boolean;
  children?: Location[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function ClientInventoryPage({ params }: PageProps) {

  const { slug } = await params;

  const cookieHeader = (await cookies()).toString();

  let locations: Location[] = [];
  
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
    const res = await fetch(`${apiBaseUrl}/admin/locationsv2?companyId=${companyId}`, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    if (res.ok) {
      const result = await res.json();
      locations = result.data?.data || result.data || [];
    }
  } catch (err) {
    // Graceful error fallback
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <LocationsClient companyId={companyId} initialLocations={locations} />
    </div>
  );
}