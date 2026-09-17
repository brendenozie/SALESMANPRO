// app/admin/[slug]/inventory/page.tsx
import React from "react";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import AdminInventoryClient, { InventoryItem } from "./AdminInventoryClient";
import { IStoreCategory } from "@/types/typings";
import {
  getStoreCategoriesByCompanyId,
  getStoreInventoryProducts,
} from "@/lib/store-category-service";

import prisma from "@/server/db/prismadb";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminInventoryPage({ params }: Props) {
  const { slug } = await params;
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

  // 3. Direct parallel database loads: categories, inventory products, and agents
  const [categoriesData, productsData, agentsData] = await Promise.all([
    getStoreCategoriesByCompanyId(companyId).catch(() => [] as IStoreCategory[]),
    getStoreInventoryProducts(companyId, 1, 100).catch(() => [] as InventoryItem[]),
    prisma.salesAgent.findMany({
      where: { companyId },
      select: { id: true, name: true },
    }).catch(() => []),
  ]);

  return (
    <AdminInventoryClient
      companyId={companyId}
      productsData={productsData}
      categoriesData={categoriesData}
      agentsData={agentsData}
    />
  );
}