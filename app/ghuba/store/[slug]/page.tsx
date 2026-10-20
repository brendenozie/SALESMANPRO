import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStore } from "@/lib/loadStore";
import { StoreDataSync } from "@/contexts/StoreContext";
import GhubaStoreReturnBar from "@/components/ghuba/store/GhubaStoreReturnBar";
import GhubaMerchantHeader from "@/components/ghuba/store/GhubaMerchantHeader";
import GhubaMerchantCatalogTabs from "@/components/ghuba/store/GhubaMerchantCatalogTabs";
import Footer from "@/components/site/layouts/GhubaLayout/footer/Footer";

export const revalidate = 300;

interface GhubaStorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: GhubaStorePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const loaded = await loadStore(slug);
    const storeName = loaded.pageData?.name || "Verified Merchant";
    const address = loaded.pageData?.address || "Nairobi, Kenya";
    return {
      title: `${storeName} — Verified Merchant Storefront | Ghuba Marketplace`,
      description: `Shop authentic in-stock products from ${storeName} on Ghuba. Physical storefront at ${address} with 100% M-Pesa Escrow protection.`,
    };
  } catch {
    return {
      title: "Merchant Storefront | Ghuba Marketplace",
      description: "Verified Merchant Storefront with Ghuba Escrow Protection.",
    };
  }
}

export default async function GhubaStorePage({ params }: GhubaStorePageProps) {
  const { slug } = await params;
  const loaded = await loadStore(slug);

  if (!loaded?.pageData) {
    notFound();
  }

  const { pageData } = loaded;

  return (
    <main className="text-gray-900 dark:text-gray-100 min-h-screen w-full bg-white dark:bg-[#080808]">
      <StoreDataSync data={pageData} />

      {/* Top sticky return bar with marketplace navigation & active cart continuity */}
      <GhubaStoreReturnBar storeName={pageData.name} storeSlug={slug} />

      {/* Verified Merchant Trust Header: physical address, Google Maps directions, real-time hours, and Escrow guarantee */}
      <GhubaMerchantHeader pageData={pageData} />

      {/* Merchant Catalog: Filter tabs (All, Deals, New Arrivals, In Stock), dynamic category chips, instant live search, KES prices */}
      <GhubaMerchantCatalogTabs pageData={pageData} />

      {/* Unified Ghuba Marketplace Footer */}
      <Footer />
    </main>
  );
}
