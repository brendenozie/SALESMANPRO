// app/admin/[slug]/storepos/page.tsx
import React from "react";
import StorePOSPageClient from "./StorePOSPageClient";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

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
    });

    initialCategories = storeCategories.map((sc) => ({
      id: sc.id,
      companyId: sc.companyId,
      categoryId: sc.categoryId,
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
    const whereClause: any = {
      companyId,
      isAvailable: true,
      status: "ACTIVE",
    };

    const [total, listings] = await Promise.all([
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
          barcode: true,
          sku: true,
          productCategory: {
            select: {
              id: true,
              name: true,
            },
          },
          option: true,
          category: true,
          categoryId: true,
          productCategoryId: true,
          description: true,
        },
      }),
    ]);

    initialProducts = listings as any;
    totalPages = Math.ceil(total / limitNum) || 1;
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