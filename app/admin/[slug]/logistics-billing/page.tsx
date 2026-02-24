import React from "react";
import BillingClient from "./BillingClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Disputed';
  serviceType: 'Long Haul' | 'Last Mile' | 'Warehousing';
  tax: number;
};

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BillingPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  let billingData: Invoice[] = [];
  const cookieHeader = (await cookies()).toString();
  
  try {
    const res = await fetch(`${apiBaseUrl}/admin/billing?companyId=${companyId}`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    if (res.ok) {
      const rawData = await res.json();
      billingData = rawData.data || [];
    }
  } catch (err) {
    console.error("[BillingPage] Error:", err);
  }

  return <BillingClient params={{ companyId, billingData }} />;
}