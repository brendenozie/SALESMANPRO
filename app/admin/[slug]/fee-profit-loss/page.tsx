// app/admin/[slug]/inventory/page.tsx

import React from "react";
import ProfitLossReportClient from "./ProfitLossReportClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

type Product = {
  id: string;
  name: string;
  companyId: string;
  inventoryId: string;
  category: string;
  agentStock: number;
  companyStock: number;
  sales: number;
  costPrice: number;
  salesPrice: number;
  commissionRate: number;
  commissionType: number;
};

type Category = {
  id: string;
  name: string;
  image: string;
  tags: string[];
  status: string;
};

type Tag = {
  id: string;
  name: string;
  image: string;
  status: string;
};

type Agent = {
  id: string;
  name: string;
};

interface Props {
  params:Promise<{ slug: string }>
}

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function AdminInventoryPage({ params }: Props) {
  const { slug } = await params;
  const cookieHeaders = (await cookies()).toString();

  let initialData: Product[] = [];


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
    // Fetch all products for this company
    const productsRes = await fetch(
      `${apiBaseUrl}/admin/reports/profit-loss?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 },
        headers: { cookie: cookieHeaders }
     } // equivalent to SSR on every request
    );
    if (productsRes.ok) {
      initialData = (await productsRes.json()).data as Product[];
    }

  } catch (err: any) {
    // console.error("AdminInventoryPage-fetch error:", err.message);
    // We simply proceed with empty arrays if something fails.
  }

  return (
    <ProfitLossReportClient companyId={companyId} initialData={initialData}/>
  );
}
