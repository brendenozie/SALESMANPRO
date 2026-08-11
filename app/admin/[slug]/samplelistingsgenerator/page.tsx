import React from "react";
import SampleListingsGeneratorClient from "./SampleListingsGeneratorClient";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Category = {
  id: string;
  name: string;
  image: string;
  tags: string[];
  status: string;
};

interface PageProps {
  params:Promise<{ slug: string }>
}

export default async function ClientInventoryPage({ params }: PageProps) {

  const { slug }  = await params;
  
  const cookieHeader = (await cookies()).toString();

  let categoriesData: IStoreCategory[] = [];
  
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
 
    // --- Fetch store categories ---
    const categoriesRes = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
    );

    if (categoriesRes.ok) {
      const json = await categoriesRes.json();
      categoriesData = Array.isArray(json.data.results) ? json.data.results : [];
    } else {
      console.error(
        "[ClientInventoryPage] Failed to fetch store categories:",
        categoriesRes.status,
        categoriesRes.statusText
      );
    }

  } catch (err: any) {
    console.error("[ClientInventoryPage] Error during fetch:", err?.message || err);
  }

  return (
    <SampleListingsGeneratorClient
      companyId={companyId}
      categories={categoriesData}
    />
  );
}
