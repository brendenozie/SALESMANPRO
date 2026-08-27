// app/admin/[slug]/pos/page.tsx
import React from "react";
import PosClient from "./PosClient";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Re-using Product and ProductCategory types from Menu module for consistency
export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  sortOrder: number;
  visible: boolean;
  companyId: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  images: { url: string }[];
  video: string | null;
  tags: string[];
  productCategoryId: string | null;
  category: { name: string } | null;
  costPrice: number;
  salesPrice: number;
  finalPrice: number;
  discount: number | null;
  isAvailable: boolean;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;
  ingredients: string | null;
  createdAt: string;
  updatedAt: string;
};

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: Fetches initial data for the POS.
 */
export default async function PosPage({ params }: PageProps) {
  
  const session = await getAuthSession();
    
    const { slug }  = await params;
    const cookieHeaders = (await cookies()).toString();
    const userName = session?.user?.name || "Guest";
  let categoriesData: any[] = [];
  let productsData: any[] = [];
    
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
    // Fetch Product Categories for the company
    const categoriesRes = await fetch(`${apiBaseUrl}/admin/pos-categories?companyId=${companyId}`, { 
      next: { revalidate: 60 }, 
      headers: { cookie: cookieHeaders }, });
    if (categoriesRes.ok) {
      categoriesData = (await categoriesRes.json()).data.categories;
      // console.log("[PosPage] Fetched categories data →", categoriesData);
    } else {
      // console.error("[PosPage] Failed to fetch categories →", categoriesRes.status, categoriesRes.statusText);
    }

    // Fetch Products (dishes) for the company
    const productsRes = await fetch(`${apiBaseUrl}/admin/pos-marketplace-listings?companyId=${companyId}`, { next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }, });
    if (productsRes.ok) {
      productsData = (await productsRes.json()).data.results;
      // console.log("[PosPage] Fetched products data →", productsData);
    } else {
      // console.error("[PosPage] Failed to fetch products →", productsRes.status, productsRes.statusText);
    }

  } catch (err: any) {
    // console.error("[PosPage] Error fetching POS data →", err.message);
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
