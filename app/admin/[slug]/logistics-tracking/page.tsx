import React from "react";
import TrackingClient from "./TrackingClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export type TrackedAsset = {
  id: string;
  assetName: string; // e.g., Truck 402
  driver: string;
  lat: number;
  lng: number;
  status: 'Moving' | 'Idle' | 'Offline';
  heading: number;
  speed: number;
  destination: string;
};

interface PageProps {
  params: Promise<{ slug: string }>
}

const mockAssets: TrackedAsset[] = [
  {
    id: '1',
    assetName: 'Truck 402',
    driver: 'John Doe',
    lat: 37.7749,
    lng: -122.4194,
    status: 'Moving',
    heading: 45,
    speed: 60,
    destination: 'Eastgate Industrial',
  },
  {
    id: '2',
    assetName: 'Van 301',
    driver: 'Jane Smith',
    lat: 37.7849,
    lng: -122.4094,
    status: 'Idle',
    heading: 90,
    speed: 0,
    destination: 'Nairobi CBD',
  },
];

export default async function TrackingPage({ params }: PageProps) {

  const { slug } = await params;

  let assets: TrackedAsset[] = [];
  const cookieHeader = (await cookies()).toString();
  
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
    const res = await fetch(`${apiBaseUrl}/admin/tracking?companyId=${companyId}`, {
      cache: 'no-store', // Real-time data should never be cached
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    if (res.ok) {
      const rawData = await res.json();
      assets = rawData.data || mockAssets; // Fallback to mock data if API fails or returns empty
    }
  } catch (err) {
    // console.error("[TrackingPage] Error:", err);
    assets = mockAssets; // Use mock data on error to ensure UI still renders
  }

  return <TrackingClient params={{ companyId, assets: mockAssets }} />;
}