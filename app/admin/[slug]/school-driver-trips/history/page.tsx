// app/admin/[adminSlug]/trips/history/page.tsx
import React from "react";
import TripHistoryClient from "./TripHistoryClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function TripHistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: adminSlug } = await params;
  let historyData = [];
  const cookieHeader = (await cookies()).toString();

  try {
    const res = await fetch(`${apiBaseUrl}/admin/trips/history?driverId=${adminSlug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour, history doesn't change fast
      headers: { Cookie: cookieHeader },
    });

    if (res.ok) {
      const rawData = await res.json();
      historyData = rawData.data;
    }
  } catch (err) {
    console.error("Failed to fetch trip history", err);
  }

  return <TripHistoryClient adminSlug={adminSlug} initialHistory={historyData} />;
}