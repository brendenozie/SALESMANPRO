// app/admin/[slug]/delivery/page.tsx
import React from "react";
import DeliveryClient from "./DeliveryClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  deliveryStatus: string | null; // e.g., "Order Placed", "Processing", "Shipped", etc.
  deliveryPersonName: string | null;
  deliveryPersonContact: string | null;
  shippingAddress: any | null; // JSON type in Prisma
  shippingMethod: string | null;
  createdAt: string;
  updatedAt: string;
};

interface PageProps {
  params: {
    slug: string; // This will be the companyId
  };
}

/**
 * Server Component: Fetches delivery orders for a specific restaurant.
 */
export default async function DeliveryPage({ params }: PageProps) {
  const companyId = params.slug;
  let deliveryOrdersData: CustomerOrder[] = [];

  try {
    // Fetch Customer Orders that are marked for delivery
    // Ensure your /api/customer-orders endpoint supports filtering by 'delivery: true'
    const ordersRes = await fetch(`${apiUrl}/customer-orders?companyId=${companyId}&delivery=true`, { cache: "no-store" });
    if (ordersRes.ok) {
      deliveryOrdersData = (await ordersRes.json()) as CustomerOrder[];
    } else {
      console.error("[DeliveryPage] Failed to fetch delivery orders →", ordersRes.status, ordersRes.statusText);
    }

  } catch (err: any) {
    console.error("[DeliveryPage] Error fetching delivery data →", err.message);
  }

  return <DeliveryClient deliveryOrdersData={deliveryOrdersData} companyId={companyId} />;
}
