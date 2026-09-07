import React from "react";
import VehiclesClient from "./VehiclesClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export type Vehicle = {
  id: string;
  vin: string;
  plateNumber: string;
  model: string;
  type: 'Heavy-Duty' | 'Medium Truck' | 'Delivery Van' | 'Motorbike';
  status: 'available' | 'en-route' | 'maintenance' | 'out-of-service';
  fuelLevel: number; // Percentage
  healthScore: number; // Percentage (Engine/Tire health)
  assignedDriver?: string;
  lastService: string;
};

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function VehiclesPage({ params }: PageProps) {

  const { slug } = await params;

  let vehiclesData: Vehicle[] = [];
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
    const res = await fetch(`${apiBaseUrl}/admin/vehicles?companyId=${companyId}`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    if (res.ok) {
      const rawData = await res.json();
      vehiclesData = rawData.data || [];
    }
  } catch (err) {
    // console.error("[VehiclesPage] Error:", err);
  }

  return <VehiclesClient params={{ companyId, vehiclesData }} />;
}