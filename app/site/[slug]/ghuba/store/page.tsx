import React from "react";
import { Metadata } from "next";
import prisma from "@/server/db/prismadb";
import GhubaStoreReturnBar from "@/components/ghuba/store/GhubaStoreReturnBar";
import GhubaStoreDirectoryClient, { DirectoryStoreItem } from "@/components/ghuba/store/GhubaStoreDirectoryClient";
import Footer from "@/components/site/layouts/GhubaLayout/footer/Footer";
import { CheckBadgeIcon, ShieldCheckIcon, MapPinIcon, BuildingStorefrontIcon, SparklesIcon } from "@heroicons/react/24/solid";

export const revalidate = 180;

export const metadata: Metadata = {
  title: "All Verified Merchant Stores | Ghuba Marketplace Kenya",
  description: "Browse verified physical merchant stores across Nairobi and Kenya. Walk into CBD storefronts or shop with 100% M-Pesa Escrow protection.",
};

export default async function GhubaStoreDirectoryUnderSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
    <main className="text-zinc-900 dark:text-zinc-100 min-h-screen w-full bg-white dark:bg-[#050505] selection:bg-amber-500 selection:text-white">
      <GhubaStoreReturnBar storeName="All Verified Stores" storeSlug="all" />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-b from-zinc-100/80 via-zinc-50/50 to-white dark:from-zinc-950 dark:via-[#09090b] dark:to-[#050505] border-b border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* Background Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 dark:bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Left Content Area */}
            <div className="max-w-3xl">
              <div className="flex items-center gap-2.5 mb-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                  Verified Physical Stores
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
                  <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                  M-Pesa Escrow Active
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1]">
                Explore Verified <span className="text-amber-500 dark:text-amber-400 font-black italic">Merchant Stores</span>
              </h1>
              
              <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl">
                Connect directly with trusted local businesses across Nairobi CBD and Kenya. Walk into physical storefronts or order securely with Ghuba escrow protection.
              </p>
            </div>

            {/* Right Feature Card */}
            <div className="w-full lg:w-auto">
              <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-900/5 dark:shadow-black/40 flex flex-col gap-3 max-w-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <BuildingStorefrontIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                      CBD Walk-ins & Instant Dispatch
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Live physical stock verification
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-amber-500" /> Nairobi, Kenya
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <SparklesIcon className="w-3.5 h-3.5" /> {stores.length} Active Stores Listed
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Directory Grid / Client Component */}
      <GhubaStoreDirectoryClient initialStores={stores} />
      
      <Footer />
    </main>
  );
}