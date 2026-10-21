import React from "react";
import { Metadata } from "next";
import prisma from "@/server/db/prismadb";
import GhubaStoreReturnBar from "@/components/ghuba/store/GhubaStoreReturnBar";
import GhubaStoreDirectoryClient, { DirectoryStoreItem } from "@/components/ghuba/store/GhubaStoreDirectoryClient";
import Footer from "@/components/site/layouts/GhubaLayout/footer/Footer";
import { BuildingStorefrontIcon, ShieldCheckIcon, CheckBadgeIcon, MapPinIcon } from "@heroicons/react/24/solid";

export const revalidate = 180; // Revalidate every 3 minutes

export const metadata: Metadata = {
  title: "All Verified Merchant Stores | Ghuba Marketplace Kenya",
  description: "Browse verified physical merchant stores across Nairobi and Kenya. Walk into CBD storefronts or shop with 100% M-Pesa Escrow protection.",
};

export default async function GhubaStoresDirectoryPage() {
  let stores: DirectoryStoreItem[] = [];

  try {
    const rawCompanies = await prisma.company.findMany({
      where: {
        showOnGhuba: true,
        slug: { notIn: ["ghuba", "admin", "www", "auth"] },
        category: { notIn: ["portal", "ghuba"] },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        category: true,
        variant: true,
        tagline: true,
        description: true,
        address: true,
        contactPhone: true,
        logoUrl: true,
        bannerUrl: true,
        _count: {
          select: {
            marketplaceListings: {
              where: {
                status: "ACTIVE",
                isAvailable: true,
              },
            },
            Product: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 120,
    });

    stores = rawCompanies.map((c) => ({
      id: c.id,
      name: c.name || "Verified Merchant",
      slug: c.slug,
      domain: c.domain,
      category: c.category || "General Retail",
      variant: c.variant,
      tagline: c.tagline,
      description: c.description,
      address: c.address || "Nairobi CBD, Kenya",
      contactPhone: c.contactPhone || "254706448146",
      logoUrl: c.logoUrl,
      bannerUrl: c.bannerUrl,
      activeItemsCount: c._count.marketplaceListings || c._count.Product || 0,
    }));
  } catch (err) {
    console.error("Failed to fetch Ghuba merchant stores:", err);
  }

  return (
    <main className="text-gray-900 dark:text-gray-100 min-h-screen w-full bg-white dark:bg-[#080808]">
      {/* Top sticky return bar with marketplace navigation & active cart continuity */}
      <GhubaStoreReturnBar storeName="All Verified Stores" storeSlug="all" />

      {/* Hero Header for Store Directory */}
      <div className="relative py-12 md:py-16 bg-gradient-to-b from-zinc-100 via-zinc-50 to-white dark:from-zinc-950 dark:via-[#0c0c0d] dark:to-[#080808] border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              {/* Badges strip */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                  Verified Physical Merchant Stores
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                  M-Pesa Escrow Protection Active
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                Explore <span className="text-amber-500 italic">Merchant Stores</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl font-medium">
                Connect directly with verified local businesses across Nairobi CBD and Kenya. Walk into their physical storefronts or order with Ghuba escrow protection.
              </p>
            </div>

            {/* Escrow highlight callout */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-sm">
              <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-white mb-1">
                <MapPinIcon className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Physical CBD Walk-ins & Courier Dispatch</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Every merchant listed is physically verified with live stock ready for immediate collection or same-day Nairobi delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Directory List with Filter & Search */}
      <GhubaStoreDirectoryClient initialStores={stores} />

      {/* Unified Ghuba Marketplace Footer */}
      <Footer />
    </main>
  );
}
