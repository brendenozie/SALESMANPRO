// app/admin/products/page.tsx
import { cookies } from "next/headers";
import ProductsClient from "./ProductsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

import prisma from "@/server/db/prismadb";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page = "1", search = "", status = "" } = await searchParams;

  let orders: any[] = [];
  let riders: any[] = [];
  let pagination = { totalPages: 1, currentPage: 1, totalItems: 0 };
  let revenue = { total: 0, pending: 0, monthly: [] };
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  // Use the actual database ID for consistency
  const companyId = company.id;

  try {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = 10;
    const skip = (pageNum - 1) * limitNum;

    const companyScope = {
      OR: [
        { companyId },
        { items: { some: { marketplaceListing: { companyId } } } },
      ],
    };

    const statusFilter = status && status.toUpperCase() !== "ALL" ? status.toUpperCase() : null;

    const orderWhere: any = {
      ...companyScope,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { trackingNumber: { contains: search, mode: "insensitive" } },
              {
                items: {
                  some: {
                    marketplaceListing: {
                      name: { contains: search, mode: "insensitive" },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [rawOrders, totalOrders, drivers, compRev, pendRev, itemRev] = await Promise.all([
      prisma.customerOrder.findMany({
        where: orderWhere,
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
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customerOrder.count({ where: orderWhere }),
      prisma.transportDriver.findMany({
        where: { companyId },
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.customerOrder.aggregate({
        _sum: { totalFinalPrice: true },
        where: {
          ...companyScope,
          status: { in: ["COMPLETED", "PAID", "SHIPPED", "OUT_FOR_DELIVERY"] as any },
        },
      }),
      prisma.customerOrder.aggregate({
        _sum: { totalFinalPrice: true },
        where: {
          ...companyScope,
          status: "PENDING" as any,
        },
      }),
      prisma.orderItem.aggregate({
        _sum: { price: true },
        where: { marketplaceListing: { companyId } },
      }),
    ]);

    orders = rawOrders.map((o: any) => ({
      ...o,
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
      items: (o.items || []).map((it: any) => ({
        ...it,
        marketplaceListing: it.marketplaceListing || {
          id: it.id,
          name: it.name || "Item",
          images: [],
          finalPrice: it.price || 0,
        },
      })),
    }));

    riders = drivers.map((d: any) => ({
      id: d.id,
      name: d.user?.name || "Driver",
      phoneNumber: d.user?.phone || "",
      licenseNumber: d.licenseNo,
    }));

    pagination = {
      totalItems: totalOrders,
      totalPages: Math.ceil(totalOrders / limitNum) || 1,
      currentPage: pageNum,
    };

    revenue = {
      total: compRev._sum.totalFinalPrice || itemRev._sum.price || 0,
      pending: pendRev._sum.totalFinalPrice || 0,
      monthly: [],
    };
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
  }

  return (
    <ProductsClient 
      initialOrders={orders} 
      initialRiders={riders} 
      pagination={pagination}
      revenue={revenue}
      companyId={companyId}
    />
  );
}