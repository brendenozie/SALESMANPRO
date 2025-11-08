// app/admin/[slug]/pos/page.tsx
import React from "react";
import AdminPOSClient from "./AdminPOSClient";

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  const { slug : companyId } = await params;
  let categoriesData: ProductCategory[] = [];
  let productsData: Product[] = [];

  try {
    // Fetch Product Categories for the company
    const categoriesRes = await fetch(`${apiUrl}/admin/menu-categories?companyId=${companyId}`, { next: { revalidate: 60 } });
    if (categoriesRes.ok) {
      categoriesData = (await categoriesRes.json()) as ProductCategory[];
    } else {
      console.error("[PosPage] Failed to fetch categories →", categoriesRes.status, categoriesRes.statusText);
    }

    // Fetch Products (dishes) for the company
    const productsRes = await fetch(`${apiUrl}/admin/products?companyId=${companyId}`, { next: { revalidate: 60 } });
    if (productsRes.ok) {
      productsData = (await productsRes.json()) as Product[];
    } else {
      console.error("[PosPage] Failed to fetch products →", productsRes.status, productsRes.statusText);
    }

  } catch (err: any) {
    console.error("[PosPage] Error fetching POS data →", err.message);
  }

  return (
    <AdminPOSClient
      // initialCategories={categoriesData}
      // initialProducts={productsData}
      // companyId={companyId}
    />
  );
}
