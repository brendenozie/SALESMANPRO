// app/admin/[slug]/inventory/page.tsx
import React from "react";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import AdminInventoryClient, { InventoryItem } from "./AdminInventoryClient";
import { IStoreCategory } from "@/types/typings";

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

  let productsData: InventoryItem[] = [];
  let categoriesData: IStoreCategory[] = [];
  let agentsData: any[] = [];

  try {
    const cookieHeader = (await cookies()).toString();
    const fetchOptions = { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } };

    // Fetch in parallel to speed up the page load
    const [productsRes, categoriesRes, agentsRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/get-all-inventory?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
      fetch(`${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
      fetch(`${apiBaseUrl}/admin/get-all-inventory-agents?companyId=${encodeURIComponent(companyId)}`, fetchOptions)
    ]);

    if (productsRes.ok) {
      const prodData = await productsRes.json();
      productsData = Array.isArray(prodData.data?.results) ? prodData.data.results : [];
    }

    if (categoriesRes.ok) {
      const catData = await categoriesRes.json();
      categoriesData = Array.isArray(catData.data?.results) ? catData.data.results : [];
    }

    if (agentsRes.ok) {
      const agentData = await agentsRes.json();
      agentsData = Array.isArray(agentData.data) ? agentData.data : [];
    }

  } catch (err: any) {
    console.error("Inventory fetch error:", err.message);
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