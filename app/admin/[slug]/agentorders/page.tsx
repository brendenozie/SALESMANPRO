// app/admin/[slug]/product-requests/page.tsx

import React from "react";
import ProductRequestsClient from "./ProductRequestsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  params: {
    slug: string; // companyId, if you ever need it
  };
}

/**
 * This is a Server Component. It runs on each request (next: { revalidate: 60 }),
 * fetches all product requests, then renders the Client component below.
 */
export default async function ProductRequestsPage({ params }: PageProps) {
  // You can extract companyId from params.slug if the endpoint needs it:
  // const companyId = params.slug;

  let requestsData: ProductRequest[] = [];

  try {
    const res = await fetch(`${apiUrl}/admin/agentproductrequests`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = (await res.json()) as { requests: ProductRequest[] };
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
