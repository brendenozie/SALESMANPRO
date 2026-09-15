// app/admin/[slug]/inventory/page.tsx
import React from "react";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import AdminInventoryClient, { InventoryItem } from "./AdminInventoryClient";
import { IStoreCategory } from "@/types/typings";
import {
  getStoreCategoriesByCompanyId,
  getStoreInventoryProducts,
} from "@/lib/store-category-service";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminInventoryPage({ params }: Props) {
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

  // 1. Always load categories directly from the database first
  let categoriesData: IStoreCategory[] = await getStoreCategoriesByCompanyId(companyId);
  let productsData: InventoryItem[] = [];
  let agentsData: any[] = [];

  try {
    const cookieHeader = (await cookies()).toString();
    const fetchOptions = { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } };

    // Fetch in parallel
    const [productsRes, agentsRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/get-all-inventory?companyId=${encodeURIComponent(companyId)}`, fetchOptions).catch(() => null),
      fetch(`${apiBaseUrl}/admin/get-all-inventory-agents?companyId=${encodeURIComponent(companyId)}`, fetchOptions).catch(() => null),
    ]);

    if (productsRes && productsRes.ok) {
      const prodData = await productsRes.json();
      productsData = Array.isArray(prodData?.data?.results) ? prodData.data.results : [];
    }

    if (agentsRes && agentsRes.ok) {
      const agentData = await agentsRes.json();
      agentsData = Array.isArray(agentData?.data) ? agentData.data : [];
    }
  } catch (err: any) {
    console.error("Inventory fetch error:", err.message);
  }

  // Fallback directly to DB if fetch failed or returned 0 products
  if (productsData.length === 0) {
    productsData = await getStoreInventoryProducts(companyId, 1, 50);
  }

  return (
    <AdminInventoryClient
      companyId={companyId} // Passes the true DB ID
      productsData={productsData}
      categoriesData={categoriesData}
      agentsData={agentsData}
    />
  );
}