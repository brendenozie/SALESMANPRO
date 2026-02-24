import React from "react";
import DriversClient from "./DriversClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type Driver = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  loginCode?: string;
  vehicleType: 'Motorcycle' | 'Van' | 'Truck' | 'Heavy-Duty';
  status: 'active' | 'on-trip' | 'offline';
  totalDeliveries: number;
  onTimeRate: number; // Percentage
  recentDelivery: {
    destination: string | null;
    date: string | null;
  };
};

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function DriversPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  let driversData: Driver[] = [];
  const cookieHeader = (await cookies()).toString();
  
  try {
    const res = await fetch(`${apiBaseUrl}/admin/drivers?companyId=${companyId}`, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
    if (res.ok) {
      const rawData = await res.json();
      driversData = Array.isArray(rawData.data) ? rawData.data.map((driver: any) => ({
        ...driver,
        loginCode: driver.loginCode || 'N/A'
      })) : [];
    }
  } catch (err: any) {
    console.error("[DriversPage] Error fetching drivers →", err.message);
  }

  return <DriversClient params={{
    companyId: companyId,
    driversData
  }} />;
}