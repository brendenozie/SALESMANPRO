import React from "react";
import BillingClient from "./BillingClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

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

  const { slug } = await params;

  let billingData: Invoice[] = [];
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
    const res = await fetch(`${apiBaseUrl}/admin/billing?companyId=${companyId}`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    if (res.ok) {
      const rawData = await res.json();
      billingData = rawData.data || [];
    }
  } catch (err) {
    // console.error("[BillingPage] Error:", err);
  }

  return <BillingClient params={{ companyId, billingData }} />;
}