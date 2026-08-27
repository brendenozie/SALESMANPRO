// app/admin/[slug]/product-requests/page.tsx

import React from "react";
import ProductRequestsClient from "./ProductRequestsClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ProductRequest {
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
  params:Promise<{ slug: string }>
}

/**
 * This is a Server Component. It runs on each request (next: { revalidate: 60 }),
 * fetches all product requests, then renders the Client component below.
 */
export default async function ProductRequestsPage({ params }: PageProps) {
  // You can extract companyId from params.slug if the endpoint needs it:
  
  const cookieHeaders = (await cookies()).toString();

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

  let requestsData: ProductRequest[] = [];

  try {
    const res = await fetch(`${apiBaseUrl}/admin/agent-product-request`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeaders, // Forward cookies for authentication
      },
      // Revalidate this page every 60 seconds
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = (await res.json()).data  as { requests: ProductRequest[] };
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

  // Pass the fetched data down to the Client Component
  return <ProductRequestsClient initialRequests={requestsData} />;
}
