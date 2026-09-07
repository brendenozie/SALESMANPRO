import React from "react";
import CommissionsManagementPage from "./CommissionsManagementPage";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function AdminCommissionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieHeaders = (await cookies()).toString();

  let commissionData = [];
  let agentsData = [];
  let productsData = [];
  
  
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
    // Fetch Commission Logs
    const commRes = await fetch(
      `${apiBaseUrl}/admin/commissions?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeaders } }
    );
    if (commRes.ok) {
      commissionData = (await commRes.json()).data || [];
    }

    // Fetch Agents for filtering
    const agentsRes = await fetch(
      `${apiBaseUrl}/admin/agents?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeaders } }
    );
    if (agentsRes.ok) {
      agentsData = (await agentsRes.json()).data || [];
    }

    // Fetch Products for Rate Management
    const productsRes = await fetch(
      `${apiBaseUrl}/admin/get-all-inventory?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeaders } }
    );
    if (productsRes.ok) {
      productsData = (await productsRes.json()).data.results || [];
    }

  } catch (err: any) {
    console.error("AdminCommissionsPage-fetch error:", err.message);
  }

  // console.log("Fetched commissions:", commissionData);
  // console.log("Fetched agents:", agentsData);
  // console.log("Fetched products:", productsData);

  return (
    <CommissionsManagementPage 
      initialCommissions={commissionData.rates || []} 
      agents={agentsData} 
      products={productsData}
      companyId={companyId}
    />
  );
}