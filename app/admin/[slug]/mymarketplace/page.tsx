// app/admin/[slug]/client-inventory/page.tsx

import React from "react";
import ClientInventoryClient from "./ClientInventoryClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type MarketplaceProduct = {
  _id: string;
  sellerId: string;
  sellerType: string;
  productId: string;
  title: string;
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

  try {
    const res = await fetch(
      `${apiUrl}/admin/my-market-place?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = (await res.json()) as { products: MarketplaceProduct[] };
      productsData = data.products;
    } else {
      console.error(
        "[ClientInventoryPage] Failed to fetch marketplace products:",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[ClientInventoryPage] Error fetching marketplace products:", err.message);
  }

  return <ClientInventoryClient companyId={companyId} productsData={productsData} />;
}
