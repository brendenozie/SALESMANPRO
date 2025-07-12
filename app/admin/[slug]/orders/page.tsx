// app/admin/[slug]/orders/page.tsx
import React from "react";
import OrdersClient from "./OrdersClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  shippingAddress: any | null; // JSON type in Prisma
  createdAt: string;
  updatedAt: string;
  // Add delivery-specific fields if needed for comprehensive order view
  deliveryStatus?: string | null;
  estimatedArrival?: string | null;
  deliveryPersonName?: string | null;
};

interface PageProps {
  params: {
    slug: string; // This will be the companyId
  };
}

/**
 * Server Component: Fetches customer orders for a specific restaurant.
 */
export default async function OrdersPage({ params }: PageProps) {
  const companyId = params.slug;
  let ordersData: CustomerOrder[] = [];

  try {
    // Fetch Customer Orders for the company
    // Ensure your /api/customer-orders endpoint supports companyId filtering and includes order items.
    const ordersRes = await fetch(`${apiUrl}/customer-orders?companyId=${companyId}`, { cache: "no-store" });
    if (ordersRes.ok) {
      ordersData = (await ordersRes.json()) as CustomerOrder[];
    } else {
      console.error("[OrdersPage] Failed to fetch orders →", ordersRes.status, ordersRes.statusText);
    }

  } catch (err: any) {
    console.error("[OrdersPage] Error fetching orders data →", err.message);
  }

  return <OrdersClient ordersData={ordersData} companyId={companyId} />;
}
