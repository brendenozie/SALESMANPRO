// app/admin/[slug]/storepos/page.tsx
import React from "react";
import StorePOSPageClient from "./StorePOSPageClient";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

import { isGhubaMarketplace } from "@/lib/ghuba-helpers";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

/**
 * Server Component: Fetches initial data directly from DB for optimal SSR performance.
 * Eliminates loopback HTTP fetch overhead and prevents server deadlocks.
 */
export default async function PosPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve company identifier
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Store Not Found</h2>
          <p className="text-sm text-zinc-500 mt-2">Unable to find store details for identifier: {identifier}</p>
        </div>
      </div>
    );
  }

  const companyId = company.id;
  const isGhuba = isGhubaMarketplace(slug, company);
  const { page = "1", limit = "20" } = await searchParams;
  const userName = session?.user?.name || "Guest";

  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const offset = (pageNum - 1) * limitNum;

  let initialCategories: IStoreCategory[] = [];
  let initialProducts: MarketListingForm[] = [];
  let totalPages = 1;

  // 2. Fetch Store Categories directly from database
  try {
    const storeCategories = await prisma.storeCategory.findMany({
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
    });

    initialCategories = storeCategories.map((sc) => ({
      id: sc.categoryId || sc.id,
      companyId: sc.companyId,
      categoryId: sc.categoryId || sc.id,
      displayName: sc.displayName || sc.category?.name || "Unnamed Category",
      icon: sc.icon || sc.category?.icon || "📦",
      sortOrder: sc.sortOrder,
      visible: sc.visible,
      subcategories: (sc.subcategories as any) || [],
      allBrands: sc.allBrands,
      categoryName: sc.category?.name,
      categorySlug: sc.category?.slug,
    })) as any;
  } catch (error) {
    console.error("[STORE_POS_CATEGORIES_FETCH_ERROR]", error);
  }

  // 3. Fetch Marketplace Listings directly from database
  try {
    let whereClause: any = {
      isAvailable: true,
      status: "ACTIVE",
      ...(isGhuba ? {} : { companyId }),
    };

    let [total, listings] = await Promise.all([
      prisma.marketplaceListings.count({ where: whereClause }),
      prisma.marketplaceListings.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          name: true,
          sellingPrice: true,
          finalPrice: true,
          quantity: true,
          isAvailable: true,
          images: true,
          productCategory: {
            select: {
              id: true,
              name: true,
            },
          },
          option: true,
          category: true,
          productCategoryId: true,
          description: true,
        },
      }),
    ]);

    // Fallback: If tenant store has 0 direct marketplace listings, fall back to global active inventory
    if (total === 0) {
      whereClause = { isAvailable: true, status: "ACTIVE" };
      [total, listings] = await Promise.all([
        prisma.marketplaceListings.count({ where: whereClause }),
        prisma.marketplaceListings.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limitNum,
          select: {
            id: true,
            name: true,
            sellingPrice: true,
            finalPrice: true,
            quantity: true,
            isAvailable: true,
            images: true,
            productCategory: {
              select: {
                id: true,
                name: true,
              },
            },
            option: true,
            category: true,
            productCategoryId: true,
            description: true,
          },
        }),
      ]);
    }

    initialProducts = listings.map((item: any) => ({
      ...item,
      barcode: item.id,
      sku: `SKU-${item.id.slice(-6).toUpperCase()}`,
      categoryId: item.productCategoryId || item.category || "",
    })) as any;
    totalPages = Math.ceil(total / limitNum) || 1;

    // 4. Auto-derive categories if store has 0 configured categories
    if (initialCategories.length === 0 && initialProducts.length > 0) {
      const categoryMap = new Map<string, string>();
      for (const item of initialProducts) {
        const catId = (item as any).productCategoryId || (item as any).categoryId || (typeof (item as any).category === "string" ? (item as any).category : "");
        const catName = (item as any).productCategory?.name || (typeof (item as any).category === "string" ? (item as any).category : "") || "General";
        if (catId && !categoryMap.has(catId)) {
          categoryMap.set(catId, catName);
        }
      }
      initialCategories = Array.from(categoryMap.entries()).map(([catId, name], idx) => ({
        id: catId,
        companyId,
        categoryId: catId,
        displayName: name,
        icon: "📦",
        sortOrder: idx,
        visible: true,
        subcategories: [],
        allBrands: true,
        categoryName: name,
        categorySlug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      })) as any;
    }
  } catch (error) {
    console.error("[STORE_POS_PRODUCTS_FETCH_ERROR]", error);
  }

  return (
    <StorePOSPageClient
      companyId={companyId}
      initialCategories={initialCategories}
      initialProducts={initialProducts}
      userId={session?.user?.id || null}
      userName={userName}
      totalPages={totalPages}
      currentPage={pageNum}
    />
  );
}