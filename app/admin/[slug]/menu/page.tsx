// app/admin/[slug]/menu/page.tsx
import React from "react";
import MenuClient from "./MenuClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define types based on your Prisma schema
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
  images: { url: string }[]; // Assuming images are stored as JSON array of objects with a 'url' key
  video: string | null;
  tags: string[];
  productCategoryId: string | null;
  category: { name: string } | null; // Include category name for display
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
  params: {
    slug: string; // This will be the companyId
  };
}

/**
 * Server Component: Fetches menu categories and products for a specific restaurant.
 */
export default async function MenuPage({ params }: PageProps) {
  const companyId = params.slug;
  let categoriesData: ProductCategory[] = [];
  let productsData: Product[] = [];

  try {
    // Fetch Product Categories for the company
    // You might need a specific API endpoint like /api/product-categories?companyId=...
    // For now, assuming /api/product-categories returns all, and we'll filter by companyId if needed in the API.
    const categoriesRes = await fetch(`${apiUrl}/product-categories?companyId=${companyId}`, { cache: "no-store" });
    if (categoriesRes.ok) {
      categoriesData = (await categoriesRes.json()) as ProductCategory[];
    } else {
      console.error("[MenuPage] Failed to fetch categories →", categoriesRes.status, categoriesRes.statusText);
    }

    // Fetch Products (dishes) for the company
    // You might need a specific API endpoint like /api/products?companyId=...
    const productsRes = await fetch(`${apiUrl}/products?companyId=${companyId}`, { cache: "no-store" });
    if (productsRes.ok) {
      productsData = (await productsRes.json()) as Product[];
    } else {
      console.error("[MenuPage] Failed to fetch products →", productsRes.status, productsRes.statusText);
    }

  } catch (err: any) {
    console.error("[MenuPage] Error fetching menu data →", err.message);
  }

  return <MenuClient categoriesData={categoriesData} productsData={productsData} companyId={companyId} />;
}
