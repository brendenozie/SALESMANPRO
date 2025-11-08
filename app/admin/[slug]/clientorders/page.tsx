// app/admin/product-requests/page.tsx

import React from "react";
import ProductRequestsClient from "./ProductRequestsClient";
import { cookies }  from "next/headers";

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  // No dynamic params here; adjust if needed
}

/**
 * This is a Server Component. It fetches client product requests on every request
 * (SSR) and passes them down as props to the client component.
 */
export default async function ProductRequestsPage(_: PageProps) {
  let requestsData: ProductRequest[] = [];
  const cookieStore = (await cookies()).toString();

  try {
    const res = await fetch(
      `${apiUrl}/admin/client-product-request`,
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
