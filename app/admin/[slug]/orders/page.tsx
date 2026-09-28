// app/admin/[slug]/orders/page.tsx
import React from "react";
import OrdersClient from "./OrdersClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

// lib/services/orders.ts
import prisma from "@/server/db/prismadb";
import { buildTenantCacheKey, cacheGet, cacheSet } from "@/lib/cache";

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
  consumerId: string | null;
  name: string | null; // Customer name
  email: string | null;
  phone: string | null;
  items: OrderItem[];
  totalPrice: number;
  orderSource: 'WEBSITE' | 'IN_PERSON' | 'MOBILE' | 'WHATSAPP' | 'API' | (string & {});
  status: 'PENDING' | 'COMPLETED' | 'PAID' | 'CANCELLED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'RECURRING' | (string & {});
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


export default async function OrdersPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  let ordersData: CustomerOrder[] = [];
  let error: string | null = null;

  try {
    ordersData = await getCompanyOrders(company.id);
  } catch (err: any) {
    error = `Error fetching orders data: ${err.message}`;
  }

  return <OrdersClient ordersData={ordersData} companyId={company.id} initialError={error} />;
}


export async function getCompanyOrders(
  companyId: string,
  page = 1,
  limit = 100,
): Promise<CustomerOrder[]> {
  const cacheKey = buildTenantCacheKey(companyId, "customer-orders", {
    delivery: "all",
    page,
    limit,
  });

  // 1. Try cache first (Matches API behavior)
  try {
    const cached = await cacheGet(cacheKey);
    if (Array.isArray(cached)) return cached as CustomerOrder[];
    if (cached && typeof cached === "object") {
      const cachedData = cached as { data?: unknown; orders?: unknown };
      if (Array.isArray(cachedData.data)) return cachedData.data as CustomerOrder[];
      if (Array.isArray(cachedData.orders)) return cachedData.orders as CustomerOrder[];
    }
  } catch (e) {}

  // 2. Exact match on Prisma query from API endpoint
  const where = {
    OR: [
      { companyId },
      { items: { some: { marketplaceListing: { companyId } } } },
    ],
  };

  const rawOrders = await prisma.customerOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      companyId: true,
      consumerId: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      paymentStatus: true,
      orderSource: true,
      delivery: true,
      shippingAddress: true,
      totalPrice: true,
      totalFinalPrice: true,
      deliveryStatus: true,
      estimatedArrival: true,
      deliveryPersonName: true,
      deliveryPersonContact: true,
      trackingNumber: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          totalPrice: true,
          marketplaceListing: {
            select: {
              name: true,
              images: true,
              finalPrice: true,
            },
          },
        },
      },
    },
  });

  const formatted: CustomerOrder[] = rawOrders.map((order) => ({
    ...order,
    totalPrice: order.totalFinalPrice ?? order.totalPrice ?? 0,
    shippingAddress:
      typeof order.shippingAddress === "object" &&
      order.shippingAddress !== null &&
      !Array.isArray(order.shippingAddress) &&
      typeof order.shippingAddress.street === "string" &&
      typeof order.shippingAddress.city === "string" &&
      typeof order.shippingAddress.zip === "string" &&
      typeof order.shippingAddress.country === "string"
        ? {
            street: order.shippingAddress.street,
            city: order.shippingAddress.city,
            zip: order.shippingAddress.zip,
            country: order.shippingAddress.country,
          }
        : null,
      estimatedArrival: order.estimatedArrival?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      marketplaceListingId: item.id,
      quantity: item.quantity,
      price: item.price,
      marketplaceListing: {
        name: item.marketplaceListing?.name ?? "",
        images: Array.isArray(item.marketplaceListing?.images)
          ? item.marketplaceListing.images
              .filter(
                (image): image is { url: string } =>
                  typeof image === "object" &&
                  image !== null &&
                  "url" in image &&
                  typeof image.url === "string",
              )
              .map(({ url }) => ({ url }))
          : [],
        finalPrice: item.marketplaceListing?.finalPrice ?? item.price ?? 0,
      },
    })),
  }));

  // 3. Populate Cache
  try {
    await cacheSet(cacheKey, { data: formatted, orders: formatted }, 60);
  } catch (e) {}

  return formatted;
}