// app/admin/[slug]/delivery/page.tsx
import React from "react";
import DeliveryClient from "./DeliveryClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();
  let deliveryOrdersData: CustomerOrder[] = [];
  let error: string | null = null;
  
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

  try {
    const ordersRes = await fetch(`${apiBaseUrl}/admin/customer-orders?companyId=${companyId}&delivery=true`, { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } });
    if (ordersRes.ok) {
      let data = await ordersRes.json();
      deliveryOrdersData = data.data.orders || [];
    } else {
      error = `Failed to fetch delivery orders: ${ordersRes.status} ${ordersRes.statusText}`;
      // console.error("[DeliveryPage] Failed to fetch delivery orders →", ordersRes.status, ordersRes.statusText);
    }
  } catch (err: any) {
    error = `Error fetching delivery data: ${err.message}`;
    // console.error("[DeliveryPage] Error fetching delivery data →", err.message);
  }

  return <DeliveryClient deliveryOrdersData={deliveryOrdersData} companyId={companyId} initialError={error} />;
}