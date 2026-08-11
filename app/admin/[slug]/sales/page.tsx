// app/admin/sales-summary/page.tsx

import React from "react";
import { cookies } from "next/headers";
import SalesSummaryClient from "./SalesSummaryClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  params: Promise<{ slug: string }>; // companyId
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    plan?: string;
  }>;
}

/**
 * Server Component: fetches all sales records once per request (SSR),
 * then passes the array of Sale objects down to the client component.
 */
export default async function SalesSummaryPage({ params, searchParams }: PageProps) {

  const { slug }  = await params;
  
  let salesData: Sale[] = [];

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
    // Note: In production, ensure this internal fetch passes necessary cookies for verifyAuth
    const res = await fetch(`${apiBaseUrl}/admin/sales?companyId=${companyId}`, 
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
    );
    
    const json = await res.json();
    if (json.success) {
      console.log("Fetched Sales Data:", json.data);
      salesData = json.data;
      
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }

  return <SalesSummaryClient initialSales={salesData} />;
}