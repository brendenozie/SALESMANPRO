// app/admin/[slug]/pos/page.tsx
import React from "react";
import PosClient from "./PosClient";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

import { isGhubaMarketplace } from "@/lib/ghuba-helpers";

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
  const isGhuba = isGhubaMarketplace(slug, company);

  let categoriesData: IStoreCategory[] = [];
  let productsData: MarketListingForm[] = [];

  try {
    let whereClause: any = {
      isAvailable: true,
      status: "ACTIVE",
      ...(isGhuba ? {} : { companyId }),
    };

    let [storeCategories, listings] = await Promise.all([
      prisma.storeCategory.findMany({
        where: isGhuba ? undefined : { companyId },
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
        take: 50,
      }),
      prisma.marketplaceListings.findMany({
        where: whereClause,
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

    // Fallback: If store has 0 direct marketplace listings, fall back to global active inventory
    if (listings.length === 0) {
      listings = await prisma.marketplaceListings.findMany({
        where: { isAvailable: true, status: "ACTIVE" },
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
      });
    }

    categoriesData = storeCategories.map((sc) => ({
      id: sc.categoryId || sc.id,
      companyId: sc.companyId,
      categoryId: sc.categoryId || sc.id,
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

    // Auto-derive categories if store has 0 configured categories
    if (categoriesData.length === 0 && productsData.length > 0) {
      const categoryMap = new Map<string, string>();
      for (const item of productsData) {
        const catId = (item as any).productCategoryId || (item as any).categoryId || (typeof (item as any).category === "string" ? (item as any).category : "");
        const catName = (item as any).productCategory?.name || (typeof (item as any).category === "string" ? (item as any).category : "") || "Menu Items";
        if (catId && !categoryMap.has(catId)) {
          categoryMap.set(catId, catName);
        }
      }
      categoriesData = Array.from(categoryMap.entries()).map(([catId, name], idx) => ({
        id: catId,
        companyId,
        categoryId: catId,
        displayName: name,
        icon: "🍽️",
        sortOrder: idx,
        visible: true,
        subcategories: [],
        allBrands: true,
        categoryName: name,
        categorySlug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      })) as any;
    }
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

