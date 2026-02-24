import React from "react";
import TrackingClient from "./TrackingClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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

export default async function TrackingPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  let assets: TrackedAsset[] = [];
  const cookieHeader = (await cookies()).toString();
  
  try {
    const res = await fetch(`${apiBaseUrl}/admin/tracking?companyId=${companyId}`, {
      cache: 'no-store', // Real-time data should never be cached
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    if (res.ok) {
      const rawData = await res.json();
      assets = rawData.data || [];
    }
  } catch (err) {
    console.error("[TrackingPage] Error:", err);
  }

  return <TrackingClient params={{ companyId, assets }} />;
}