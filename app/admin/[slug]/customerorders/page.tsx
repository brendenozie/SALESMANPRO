// app/admin/products/page.tsx

import React from "react";
import ProductsClient from "./ProductsClient";
import { MarketListingForm } from "@/types/typings";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions ---

// Represents a user with the RIDER role
export interface RiderInfo {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  status?: string;
  marketplaceListing?: MarketListingForm | null;
  riderId?: string; // Rider ID
  order?: {
    id: string;
    totalAmount?: number;
    status?: string;
    rider?: string; // This will store the Rider's ID
    riderId?: string; // This will store the Rider's ID
    createdAt?: string;
    name?: string;
    email?: string;
    phone?: string;
    consumer?: {
      name?: string;
    };
  };
}

interface Props {
  params: {
    slug: string; // This is the companyId
  };
}

/**
 * Server Component: Fetches all order items AND available riders for the company
 * and passes them to the client component as initial props.
 */
export default async function ProductsPage({ params }: Props) {
  const { slug : companyId } = await params;
  const cookieStore = (await cookies()).toString();

  let orderItems: OrderItem[] = [];
  let riders: RiderInfo[] = [];

  try {
    // Fetch both orders and riders concurrently for better performance
    const [ordersResponse, ridersResponse] = await Promise.all([
      fetch(`${apiUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}`, {
        method: "GET",
        headers: { Cookie: cookieStore || "" },
        next: { revalidate: 60 },
      }),
      // Fetch from the riders API endpoint we created previously
      fetch(`${apiUrl}/admin/riders?companyId=${encodeURIComponent(companyId)}`, {
        method: "GET",
        headers: { Cookie: cookieStore || "" },
        next: { revalidate: 3600 }, // Riders list doesn't change as often
      }),
    ]);

    // Process orders response
    if (ordersResponse.ok) {
      const jsonRes = (await ordersResponse.json()).data;
      console.log("Fetched order items:", jsonRes);
      const json: { orderItems: OrderItem[] } = jsonRes;
      orderItems = json.orderItems || [];
    } else {
      console.error(
        "[ProductsPage] Failed to fetch order items →",
        ordersResponse.status,
        ordersResponse.statusText
      );
    }
    
    // Process riders response
    if (ridersResponse.ok) {
        const jsonRes = (await ridersResponse.json());
        riders = jsonRes.data || [];
    } else {
        console.error(
            "[ProductsPage] Failed to fetch riders →",
            ridersResponse.status,
            ridersResponse.statusText
        );
    }

  } catch (err: any) {
    console.error("[ProductsPage] Error during data fetching →", err.message);
  }

  return <ProductsClient initialOrderItems={orderItems} initialRiders={riders} />;
}