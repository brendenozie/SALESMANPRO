import React from "react";
import RoutesClient from "./RoutesClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type Route = {
  id: string;
  routeCode: string;
  origin: string;
  destination: string;
  status: 'active' | 'scheduled' | 'delayed' | 'completed';
  distance: number;
  progress: number; // 0-100
  priority: 'High' | 'Standard' | 'Critical';
  driverName: string;
  eta: string;
  cargoType: string;
};

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function RoutesPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  let routesData: Route[] = [];
  const cookieHeader = (await cookies()).toString();
  
  try {
    const res = await fetch(`${apiBaseUrl}/admin/routes?companyId=${companyId}`, {
      next: { revalidate: 30 }, // Faster revalidation for routes
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    if (res.ok) {
      const rawData = await res.json();
      routesData = rawData.data || [];
    }
  } catch (err) {
    console.error("[RoutesPage] Error:", err);
  }

  return <RoutesClient params={{ companyId, routesData }} />;
}