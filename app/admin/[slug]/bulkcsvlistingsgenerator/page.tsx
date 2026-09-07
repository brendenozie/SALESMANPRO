import React from "react";
import { cookies } from "next/headers";
import BulkImportClient from "./BulkImportClient";
import { IStoreCategory } from "@/types/typings";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function ClientImportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();

  let categories: IStoreCategory[] = [];
  
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
    const res = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`,
      { headers: { Cookie: cookieHeader } }
    );
    if (res.ok) {
      const json = await res.json();
      categories = Array.isArray(json.data.results) ? json.data.results : [];
    }
  } catch (err) {
    console.error("Failed to fetch categories for import mapping", err);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <BulkImportClient companyId={companyId} categories={categories} />
    </div>
  );
}