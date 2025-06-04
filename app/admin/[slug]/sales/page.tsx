// app/admin/sales-summary/page.tsx

import React from "react";
import SalesSummaryClient from "./SalesSummaryClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type Sale = {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  totalAmount: number;
  region: string;
  date: string; // ISO string
};

interface PageProps {
  // No dynamic params for this page
}

/**
 * Server Component: fetches all sales records once per request (SSR),
 * then passes the array of Sale objects down to the client component.
 */
export default async function SalesSummaryPage(_: PageProps) {
  let salesData: Sale[] = [];

  try {
    const res = await fetch(`${apiUrl}/admin/sales`, { cache: "no-store" });
    if (res.ok) {
      salesData = (await res.json()) as Sale[];
    } else {
      console.error(
        "[SalesSummaryPage] Failed to fetch sales data →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[SalesSummaryPage] Error fetching sales data →", err.message);
  }

  return <SalesSummaryClient initialSales={salesData} />;
}
