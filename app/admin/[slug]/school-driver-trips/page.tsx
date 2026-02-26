// app/admin/[adminSlug]/trips/today/page.tsx
import React from "react";
import TodayTripsClient from "./TodayTripsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function TodayTripsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: adminSlug } = await params;
  let tripsData = [];
  const cookieHeader = (await cookies()).toString();

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