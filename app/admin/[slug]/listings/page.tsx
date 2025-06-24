// app/admin/[slug]/client-inventory/page.tsx

import React from "react";
import ListingsClient from "./ListingsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  results: MarketplaceProduct[];
}

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */

interface PageProps {
  params: {
    slug: string; // this is companyId
  };
}

/**
 * Server Component: runs on each request (no-store), fetches marketplace products,
 * then renders the ClientInventoryClient with those props.
 */
export default async function ClientInventoryPage({ params }: PageProps) {
  const companyId = params.slug;

  let productsData: MarketplaceProduct[] = [];
  let categoriesData: Category[] = [];

  try {
    const res = await fetch(
      `${apiUrl}/admin/my-market-place?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      
      const data = (await res.json()) as PaginatedListings;
      productsData = data.results;    
      
    } else {
      console.error(
        "[ClientInventoryPage] Failed to fetch marketplace products:",
        res.status,
        res.statusText
      );
    }

    
    // Fetch all categories for this company
    const categoriesRes = await fetch(
      `${apiUrl}/admin/get-store-categories?companyId=${encodeURIComponent(
        companyId
      )}`,
      { cache: "no-store" }
    );
    if (categoriesRes.ok) {
      const categoriesJson = (await categoriesRes.json()) as {
        results: Category[];
      };
      categoriesData = categoriesJson.results;
    }

  } catch (err: any) {
    console.error("[ClientInventoryPage] Error fetching marketplace products:", err.message);
  }

  

  return <ListingsClient companyId={companyId} productsData={productsData} categoriesData={categoriesData} />;
}
