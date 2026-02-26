// app/admin/[adminSlug]/routes/page.tsx
import React from "react";
import RoutesClient, { RouteProfile } from "./RoutesClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function SchoolDriverRoutesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: adminSlug } = await params;
  let routesData: RouteProfile[] = [];
  const cookieHeader = (await cookies()).toString();

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