// app/admin/[slug]/menu/page.tsx
import React from "react";
import MenuClient from "./MenuClient";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define types based on your Prisma schema
// export type ProductCategory = {
//   id: string;
//   name: string;
//   slug: string;
//   description: string;
//   image: string | null;
//   sortOrder: number;
//   visible: boolean;
//   companyId: string | null;
// };

// export type Product = {
//   id: string;
//   name: string;
//   description: string | null;
//   images: { url: string }[]; // Assuming images are stored as JSON array of objects with a 'url' key
//   video: string | null;
//   tags: string[];
//   productCategoryId: string | null;
//   category: { name: string } | null; // Include category name for display
//   costPrice: number;
//   salesPrice: number;
//   finalPrice: number;
//   discount: number | null;
//   isAvailable: boolean;
//   isOnOffer: boolean;
//   isFlashDeal: boolean;
//   isNewArrival: boolean;
//   isDiscounted: boolean;
//   isFeatured: boolean;
//   ingredients: string | null;
//   createdAt: string;
//   updatedAt: string;
// };

interface PageProps {
  params: {
    slug: string; // This will be the companyId
  };
}

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

/**
 * Server Component: Fetches menu categories and products for a specific restaurant.
 */
export default async function MenuPage({ params }: PageProps) {
    const companyId = params.slug;
    const cookieHeader = await cookies().toString();
  
    let productsData: MarketListingForm[] = [];
    let categoriesData: IStoreCategory[] = [];
  
    try {
      const res = await fetch(
        `${apiUrl}/admin/my-market-place?companyId=${encodeURIComponent(companyId)}`,
        { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
      );
  
      if (res.ok) {
        
        let menuRes = await res.json();   
        console.log("Fetched marketplace products data:", menuRes);
        productsData = menuRes.data.results.map((product: any) => ({
          ...product,
          createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
          updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : null,
        })) as MarketListingForm[];
        
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
        { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
      );
      if (categoriesRes.ok) {
          let catRes = await categoriesRes.json();
          console.log("Fetched categories data:", catRes);
          const categoriesJson: { InfoResponse: any; results: IStoreCategory[] } = catRes.data;
          categoriesData = categoriesJson.results;
        };
        
    } catch (err: any) {
      console.error("[ClientInventoryPage] Error fetching marketplace products:", err.message);
    }
  
  return <MenuClient categoriesData={categoriesData} productsData={productsData} companyId={companyId} />;
}
