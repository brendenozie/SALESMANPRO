import React from "react";
import ShipmentsClient from "./ShipmentsClient";
import { cookies } from "next/headers";

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
  const { slug: companyId } = await params;
  let shipmentsData: Shipment[] = [];
  const cookieHeader = (await cookies()).toString();
  
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