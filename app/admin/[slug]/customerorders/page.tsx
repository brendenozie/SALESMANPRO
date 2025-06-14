// app/admin/products/page.tsx

import React from "react";
import ProductsClient from "./ProductsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  status?:string;
  marketplaceListing?: {
    title?: string;
  };
  order?: {
    status?: string;
    rider?: string;
    createdAt?: string;
    name?: string;
    email?:string;
    phone?:string;
    consumer?: {
      name?: string;
    };
  };
}


interface Props {
  params: {
    slug: string; // companyId
  };
}

/**
 * Server Component: fetches all order items (for a hardcoded sellerId)
 * and passes them into the client side as initial props.
 */
export default async function ProductsPage({ params }: Props) {

  const companyId = params.slug;
  let orderItems: OrderItem[] = [];

  try {
    const res = await fetch(
      `${apiUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" } // SSR on every request
    );
    if (res.ok) {
      const json = (await res.json()) as { orderItems: OrderItem[] };
      orderItems = json.orderItems || [];
    } else {
      console.error(
        "[ProductsPage] Failed to fetch order items →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[ProductsPage] Error fetching order items →", err.message);
  }

  return <ProductsClient initialOrderItems={orderItems} />;
}
