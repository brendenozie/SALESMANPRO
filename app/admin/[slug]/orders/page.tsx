// app/admin/[slug]/orders/page.tsx
import React from "react";
import OrdersClient from "./OrdersClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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
  const { slug }  = await params;
  const cookieHeader = (await cookies()).toString();
  let ordersData: CustomerOrder[] = [];
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
    const ordersRes = await fetch(`${apiBaseUrl}/admin/customer-orders?companyId=${companyId}`, 
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } });
    if (ordersRes.ok) {
      let data = await ordersRes.json();
      ordersData = data?.data?.data || data?.data?.orders || data?.data || [];
      if (!Array.isArray(ordersData)) {
        ordersData = [];
      }
      
    } else {
      error = `Failed to fetch orders: ${ordersRes.status} ${ordersRes.statusText}`;
      // console.error("[OrdersPage] Failed to fetch orders →", ordersRes.status, ordersRes.statusText);
    }
  } catch (err: any) {
    error = `Error fetching orders data: ${err.message}`;
    // console.error("[OrdersPage] Error fetching orders data →", err.message);
  }

  return <OrdersClient ordersData={ordersData} companyId={companyId} initialError={error} />;
}