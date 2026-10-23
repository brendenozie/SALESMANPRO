// app/admin/[slug]/pos/page.tsx
import React from "react";
import PosClient from "./PosClient";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Server Component: Fetches initial data directly from DB for optimal SSR performance.
 * Eliminates loopback HTTP fetch overhead and aligns with storepos standard.
 */
export default async function PosPage({ params }: PageProps) {
  const session = await getAuthSession();
  const { slug } = await params;
  const userName = session?.user?.name || "Guest";

  // 1. Safely resolve company identifier
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-sans p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Store / Restaurant Not Found</h2>
          <p className="text-sm text-slate-400 mt-2">Unable to find restaurant details for identifier: {identifier}</p>
        </div>
      </div>
    );
  }

  const companyId = company.id;

  let categoriesData: IStoreCategory[] = [];
  let productsData: MarketListingForm[] = [];

  try {
    const [storeCategories, listings] = await Promise.all([
      prisma.storeCategory.findMany({
        where: { companyId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              image: true,
              description: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.marketplaceListings.findMany({
        where: {
          companyId,
          isAvailable: true,
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          name: true,
          sellingPrice: true,
          finalPrice: true,
          quantity: true,
          isAvailable: true,
          images: true,
          description: true,
          productCategory: {
            select: {
              id: true,
              name: true,
            },
          },
          option: true,
          category: true,
          productCategoryId: true,
        },
      }),
    ]);

    categoriesData = storeCategories.map((sc) => ({
      id: sc.id,
      companyId: sc.companyId,
      categoryId: sc.categoryId,
      displayName: sc.displayName || sc.category?.name || "Unnamed Category",
      icon: sc.icon || sc.category?.icon || "🍽️",
      sortOrder: sc.sortOrder,
      visible: sc.visible,
      subcategories: (sc.subcategories as any) || [],
      allBrands: sc.allBrands,
      categoryName: sc.category?.name,
      categorySlug: sc.category?.slug,
    })) as any;

    productsData = listings.map((item: any) => ({
      ...item,
      barcode: item.id,
      sku: `SKU-${item.id.slice(-6).toUpperCase()}`,
      categoryId: item.productCategoryId || item.category || "",
    })) as any;
  } catch (err: any) {
    console.error("[PosPage] Error fetching restaurant POS data directly:", err.message);
  }

  return (
    <PosClient
      initialCategories={categoriesData}
      initialProducts={productsData}
      companyId={companyId}
      userName={userName}
      userId={session?.user?.id || ""}
    />
  );
}

