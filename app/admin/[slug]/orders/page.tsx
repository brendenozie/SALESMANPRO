// app/admin/[slug]/orders/page.tsx
import React from "react";
import OrdersClient from "./OrdersClient";
import { cookies } from "next/headers";


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define types based on your Prisma schema
export type OrderItem = {
  id: string;
  marketplaceListingId: string; // This refers to Product in restaurant context
  marketplaceListing: {
    name: string;
    images: { url: string }[];
    finalPrice: number;
  };
  quantity: number;
  price: number;
};

export type CustomerOrder = {
  id: string;
  consumerId: string;
  name: string | null; // Customer name
  email: string | null;
  phone: string | null;
  items: OrderItem[];
  totalPrice: number;
  orderSource: 'WEBSITE' | 'IN_PERSON' | 'MOBILE';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'RECURRING';
  delivery: boolean | null;
  shippingAddress: {
    street: string;
    city: string;
    zip: string;
    country: string; // Assuming you might have this field
  } | null; // JSON type in Prisma
  createdAt: string;
  updatedAt: string;
  // Add delivery-specific fields if needed for comprehensive order view
  deliveryStatus?: string | null;
  estimatedArrival?: string | null;
  deliveryPersonName?: string | null;
  deliveryPersonContact?: string | null; // Added for completeness
};

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: Fetches customer orders for a specific restaurant.
 */
export default async function OrdersPage({ params }: PageProps) {
  const { slug : companyId } = await params;
  const cookieHeader = (await cookies()).toString();
  let ordersData: CustomerOrder[] = [];
  let error: string | null = null;

  try {
    const ordersRes = await fetch(`${apiBaseUrl}/admin/customer-orders?companyId=${companyId}`, { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } });
    if (ordersRes.ok) {
      let data = await ordersRes.json();
      console.log("[OrdersPage] Fetched orders data →", data);
      ordersData = data.data.orders || [];
      
    } else {
      error = `Failed to fetch orders: ${ordersRes.status} ${ordersRes.statusText}`;
      console.error("[OrdersPage] Failed to fetch orders →", ordersRes.status, ordersRes.statusText);
    }
  } catch (err: any) {
    error = `Error fetching orders data: ${err.message}`;
    console.error("[OrdersPage] Error fetching orders data →", err.message);
  }

  return <OrdersClient ordersData={ordersData} companyId={companyId} initialError={error} />;
}