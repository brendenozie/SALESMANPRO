// app/admin/[slug]/delivery/page.tsx
import React from "react";
import DeliveryClient from "./DeliveryClient";
import { cookies } from "next/headers";

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Re-using CustomerOrder and OrderItem types from Orders module for consistency
export type OrderItem = {
  id: string;
  marketplaceListingId: string;
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
  trackingNumber: string | null;
  estimatedArrival: string | null;
  deliveryStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'ATTEMPTED_DELIVERY' | 'RETURNED'; // Added more statuses for delivery
  deliveryPersonName: string | null;
  deliveryPersonContact: string | null;
  shippingAddress: {
    street: string;
    city: string;
    zip: string;
    country?: string; // Optional, assuming it might not always be there
  } | null; // JSON type in Prisma
  shippingMethod: string | null;
  createdAt: string;
  updatedAt: string;
};

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: Fetches delivery orders for a specific restaurant.
 */
export default async function DeliveryPage({ params }: PageProps) {
  const { slug : companyId } = await params;
  const cookieHeader = (await cookies()).toString();
  let deliveryOrdersData: CustomerOrder[] = [];
  let error: string | null = null;

  try {
    const ordersRes = await fetch(`${apiBaserUrl}/admin/customer-orders?companyId=${companyId}&delivery=true`, { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } });
    if (ordersRes.ok) {
      let data = await ordersRes.json();
      deliveryOrdersData = data.data.orders || [];
    } else {
      error = `Failed to fetch delivery orders: ${ordersRes.status} ${ordersRes.statusText}`;
      console.error("[DeliveryPage] Failed to fetch delivery orders →", ordersRes.status, ordersRes.statusText);
    }
  } catch (err: any) {
    error = `Error fetching delivery data: ${err.message}`;
    console.error("[DeliveryPage] Error fetching delivery data →", err.message);
  }

  return <DeliveryClient deliveryOrdersData={deliveryOrdersData} companyId={companyId} initialError={error} />;
}