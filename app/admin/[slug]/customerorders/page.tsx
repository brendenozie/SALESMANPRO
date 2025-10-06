// app/admin/products/page.tsx

import React from "react";
import ProductsClient from "./ProductsClient";
import { MarketListingForm } from "@/types/typings";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  status?:string;
  marketplaceListing?: MarketListingForm | null;
  order?: {
    id: string;
    totalAmount?: number;
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
  const cookieStore = (await cookies()).toString();
  let orderItems: OrderItem[] = [];

  try {
    const res = await fetch(
      `${apiUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}`,
        { method: "GET",
          headers: {
            'Cookie': cookieStore || '',
          },
        next: { revalidate: 60 }
      } // SSR on every request
    );
    if (res.ok) {
      const jsonRes = (await res.json()).data;
      console.log("Fetched order items:", jsonRes);
      const json:{ orderItems: OrderItem[] } = jsonRes;
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
