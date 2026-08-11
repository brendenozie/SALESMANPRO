import React from "react";
import RoutesClient from "./RoutesClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

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

  const { slug } = await params;

  let routesData: Route[] = [];
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
    const res = await fetch(`${apiBaseUrl}/admin/routes?companyId=${companyId}`, {
      next: { revalidate: 30 }, // Faster revalidation for routes
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    if (res.ok) {
      const rawData = await res.json();
      routesData = rawData.data || [];
    }
  } catch (err) {
    // console.error("[RoutesPage] Error:", err);
  }

  return <RoutesClient params={{ companyId, routesData }} />;
}