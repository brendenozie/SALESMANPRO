// app/admin/[slug]/pos/page.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import StorePOSPageClient from "./StorePOSPageClient"; // Import Product type
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>; // Add searchParams
}

/**
 * Server Component: Fetches initial data for the POS.
 */
export default async function PosPage({ params, searchParams }: PageProps) {
  const session = await getAuthSession();
  
  const { slug : companyId } = await params;
  const { page = "1", limit = "20" } = await searchParams; // Default values
  let totalPages = 1;
  
  const cookieHeaders = (await cookies()).toString();
  const userName = session?.user?.name || "Guest";
  // console.log("Current userName from cookies:", userName);

  //get user from session cookie
  // Fetch initial data: categories and products

  let initialCategories: IStoreCategory[] = [];
  let initialProducts: MarketListingForm[] = [];

  try {
    // Fetch Store Categories
    // Correcting the API path to match your provided route: /api/store-categories
    const categoriesRes = await fetch(`${apiBaseUrl}/admin/pos-categories?companyId=${companyId}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }, // Forward cookies for authentication
    });
    if (categoriesRes.ok) {
      const categoriesData = (await categoriesRes.json()).data;
      // console.log("Fetched categories data:", categoriesData);
      initialCategories = categoriesData.categories || []; // Ensure it's an array
    } else {
      console.error(`Failed to fetch categories: ${categoriesRes.status} ${categoriesRes.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  try {
    // Fetch Marketplace Listings (Products)
    // Correcting the API path to match your provided route: /api/marketplace-list
    const productsRes = await fetch(`${apiBaseUrl}/admin/pos-marketplace-listings?companyId=${companyId}&page=${page}&limit=${limit}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }, // Forward cookies for authentication
    });
    if (productsRes.ok) {
      const productsData = (await productsRes.json()).data;
      // console.log("Fetched products data:", productsData);
      // Map marketplace listings to the Product type expected by StorePOSPageClient
      initialProducts = productsData.results ;
      totalPages = productsData.meta?.totalPages || 1;
      // }));
    } else {
      console.error(`Failed to fetch products: ${productsRes.status} ${productsRes.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  return (
    <StorePOSPageClient
      companyId={companyId}
      initialCategories={initialCategories}
      initialProducts={initialProducts}
      userId={session?.user?.id || null}
      userName={userName}
      totalPages={totalPages} // Pass this down
      currentPage={parseInt(page)} // Pass this down
    />
  );
}