// app/admin/product-requests/page.tsx

import React from "react";
import ProductRequestsClient from "./ProductRequestsClient";
import { cookies }  from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface ProductRequest {
  requestId: string;
  productId: string;
  productName: string;
  quantityRequested: number;
  salesAgentId: string | null;
  salesAgentName: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  requestedAt: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * This is a Server Component. It fetches client product requests on every request
 * (SSR) and passes them down as props to the client component.
 */
export default async function ProductRequestsPage({ params }: PageProps) {
  let requestsData: ProductRequest[] = [];
  const cookieStore = (await cookies()).toString();
  
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
    const res = await fetch(
      `${apiBaseUrl}/admin/client-product-request`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore, // Forward cookies for authentication
        },
        next: { revalidate: 60 }, // SSR on every request
      }
    );

    if (res.ok) {
      const json = (await res.json()).data as { requests: ProductRequest[] };
      requestsData = json.requests;
    } else {
      console.error(
        "[ProductRequestsPage] Failed to fetch product requests →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[ProductRequestsPage] Error fetching product requests →", err.message);
  }

  return <ProductRequestsClient initialRequests={requestsData} />;
}
