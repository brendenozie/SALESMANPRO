// app/admin/[slug]/client-inventory/page.tsx

import React from "react";
import ListingsClient from "./ListingsClient";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type MarketplaceProduct = {
  _id: string;
  sellerId: string;
  sellerType: string;
  productId: string;
  title: string;
  name: string;
  description: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  salesPrice: number;
  discount: number;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;
  buyingPrice: number;
  sellingPrice: number;
};

type Category = {
  id: string;
  name: string;
  image: string;
  tags: string[];
  status: string;
};

type Tag = {
  id: string;
  name: string;
  image: string;
  status: string;
};

type Agent = {
  id: string;
  name: string;
};

interface PaginatedListings {
  meta: {
    companyId:     string;
    totalItems:    number;
    totalPages:    number;
    currentPage:   number;
    perPage:       number;
  };
  results: MarketListingForm[];
}

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: runs on each request (no-store), fetches marketplace products,
 * then renders the ClientInventoryClient with those props.
 */
export default async function ClientInventoryPage({ params }: PageProps) {

  const { slug }  = await params;

    const cookieHeader = (await cookies()).toString();

  let productsData: MarketListingForm[] = [];
  let categoriesData: IStoreCategory[] = [];
  
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
    const res = await fetch(
      `${apiBaseUrl}/admin/my-market-place?companyId=${encodeURIComponent(companyId)}`,
      {
        next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },}
    );

    if (res.ok) {
      
      const data = (await res.json()) as PaginatedListings;
      productsData = data.results;    
      
    } else {
      // console.error(
      //   "[ClientInventoryPage] Failed to fetch marketplace products:",
      //   res.status,
      //   res.statusText
      // );
    }

    
    // Fetch all categories for this company
    const categoriesRes = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(
        companyId
      )}`,
      {
        next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },}
    );
    if (categoriesRes.ok) {
      const categoriesJson = (await categoriesRes.json()) as {
        results: IStoreCategory[];
      };
      categoriesData = categoriesJson.results;
    }

  } catch (err: any) {
    // console.error("[ClientInventoryPage] Error fetching marketplace products:", err.message);
  }

  

  return <ListingsClient companyId={companyId} productsData={productsData} categoriesData={categoriesData} />;
}
