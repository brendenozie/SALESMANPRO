import React from "react";
import CommissionsManagementPage from "./CommissionsManagementPage";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function AdminCommissionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: companyId } = await params;
  const cookieHeaders = (await cookies()).toString();

  let commissionData = [];
  let agentsData = [];
  let productsData = [];

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