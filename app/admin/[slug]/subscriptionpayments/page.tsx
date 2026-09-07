// app/admin/[adminSlug]/subscriptions/page.tsx
import React from "react";
import SubscriptionPaymentsClient from "./SubscriptionPaymentsClient";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubscriptionPaymentsPage({ params }: PageProps) {
  let paymentsData = [];
  const cookieHeader = (await cookies()).toString();

    const { slug } = await params;
  
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
    // Fetch all subscriptions globally for the admin
    const res = await fetch(`${apiBaseUrl}/admin/subscriptions-payments`, {
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      cache: 'no-store'
    });

    if (res.ok) {
      const json = await res.json();
      // console.log("[SubscriptionPaymentsPage] Fetched data:", json);
      paymentsData = json.data || [];
    }
  } catch (err: any) {
    console.error("[SubscriptionPaymentsPage] Error:", err.message);
  }

  return <SubscriptionPaymentsClient paymentsData={paymentsData} />;
}