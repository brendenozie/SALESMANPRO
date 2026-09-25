// app/admin/[slug]/orders/page.tsx
import React from "react";
import OrdersClient from "./OrdersClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';


import prisma from "@/server/db/prismadb";

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
    const rawOrders = await prisma.customerOrder.findMany({
      where: {
        OR: [
          { companyId },
          { items: { some: { marketplaceListing: { companyId } } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        items: {
          include: {
            marketplaceListing: {
              select: {
                id: true,
                name: true,
                images: true,
                finalPrice: true,
                sellingPrice: true,
              },
            },
          },
        },
      },
    });

    ordersData = rawOrders.map((order: any) => ({
      id: order.id,
      consumerId: order.consumerId || "",
      name: order.name || "Customer",
      email: order.email || "",
      phone: order.phone || "",
      totalPrice: order.totalFinalPrice ?? order.totalPrice ?? 0,
      orderSource: order.orderSource || "WEBSITE",
      status: order.status || "PENDING",
      delivery: order.delivery || false,
      shippingAddress: order.shippingAddress || null,
      deliveryStatus: order.deliveryStatus || null,
      estimatedArrival: order.estimatedArrival ? new Date(order.estimatedArrival).toISOString() : null,
      deliveryPersonName: order.deliveryPersonName || null,
      deliveryPersonContact: order.deliveryPersonContact || null,
      trackingNumber: order.trackingNumber || `TRK-${order.id.slice(-6).toUpperCase()}`,
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        marketplaceListingId: item.marketplaceListingId || item.id,
        quantity: item.quantity || 1,
        price: item.price || 0,
        marketplaceListing: {
          name: item.marketplaceListing?.name || item.name || "Item",
          images: Array.isArray(item.marketplaceListing?.images) ? item.marketplaceListing.images : [],
          finalPrice: item.marketplaceListing?.finalPrice ?? item.price ?? 0,
        },
      })),
    }));
  } catch (err: any) {
    error = `Error fetching orders data: ${err.message}`;
    console.error("[OrdersPage] Error fetching orders data →", err.message);
  }

  return <OrdersClient ordersData={ordersData} companyId={companyId} initialError={error} />;
}