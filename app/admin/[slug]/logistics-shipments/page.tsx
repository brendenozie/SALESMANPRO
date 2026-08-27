import React from "react";
import ShipmentsClient from "./ShipmentsClient";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type Shipment = {
  id: string;
  trackingNumber: string;
  customer: string;
  content: string;
  weight: string;
  status: 'In Warehouse' | 'In Transit' | 'Delivered' | 'On Hold' | 'Cancelled';
  lastLocation: string;
  shippingMode: 'Air Freight' | 'Sea Freight' | 'Land Transport';
  value: string;
  createdAt: string;
};

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ShipmentsPage({ params }: PageProps) {

  const { slug } = await params;

  let shipmentsData: Shipment[] = [];
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
    const res = await fetch(`${apiBaseUrl}/admin/shipments?companyId=${companyId}`, {
      next: { revalidate: 30 },
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    if (res.ok) {
      const rawData = await res.json();
      shipmentsData = rawData.data || [];
    }
  } catch (err) {
    // console.error("[ShipmentsPage] Error:", err);
  }

  return <ShipmentsClient params={{ companyId, shipmentsData }} />;
}