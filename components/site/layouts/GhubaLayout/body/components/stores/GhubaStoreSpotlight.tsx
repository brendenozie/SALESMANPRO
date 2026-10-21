"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BuildingStorefrontIcon, MapPinIcon, CheckBadgeIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { GlobeAltIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { tracker } from "@/lib/analytics/tracker";
import { InteractionEventType, InteractionChannel } from "@/lib/analytics/types";

export interface StoreSpotlightItem {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  category: string;
  address: string;
  phone: string;
  activeItems: number;
  bannerImage: string;
  logoInitial?: string;
  logoUrl?: string | null;
}

const SPOTLIGHT_STORES: StoreSpotlightItem[] = [
  {
    id: "store-1",
    name: "Nairobi Tech & Mobile Hub",
    slug: "theduka",
    domain: "theduka.salesmanpro.store",
    category: "Electronics & Accessories",
    address: "Kimathi Street, Nairobi CBD",
    phone: "254706448146",
    activeItems: 48,
    bannerImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80",
    logoInitial: "N",
  },
  {
    id: "store-2",
    name: "Prestige Autos Nairobi",
    slug: "thevehicleshop",
    domain: "thevehicleshop.salesmanpro.store",
    category: "Verified Vehicles & Imports",
    address: "Langata Road, Karen, Nairobi",
    phone: "254706448146",
    activeItems: 24,
    bannerImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80",
    logoInitial: "P",
  },
  {
    id: "store-3",
    name: "The Fashion Store Kenya",
    slug: "thefashionstore",
    domain: "thefashionstore.salesmanpro.store",
    category: "Fashion & Luxury Apparel",
    address: "Westgate Mall, Westlands, Nairobi",
    phone: "254706448146",
    activeItems: 36,
    bannerImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    logoInitial: "F",
  },
];

interface GhubaStoreSpotlightProps {
  stores?: StoreSpotlightItem[];
}

export default function GhubaStoreSpotlight({ stores }: GhubaStoreSpotlightProps) {
  const displayStores = stores && stores.length > 0 ? stores : SPOTLIGHT_STORES;

  return (
    <section className="py-10 md:py-16 bg-white dark:bg-[#080808] border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckBadgeIcon className="w-3.5 h-3.5" />
                Physical Storefronts
              </span>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Walk in or order online</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Verified <span className="text-amber-500 italic">Merchant Stores</span>
            </h2>
          </div>

          <Link
            href="/ghuba/store"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500 hover:text-amber-600 transition-colors self-start sm:self-auto"
          >
            <span>Explore All Stores</span>
            <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>

        {/* Store Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayStores.map((store) => {
            const directStoreUrl = store.domain
              ? (store.domain.startsWith("http") ? store.domain : `https://${store.domain}`)
              : (store.slug && store.slug !== "ghuba" ? `/site/${store.slug}` : null);

            return (
              <div
                key={store.id}
                className="group bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Store Banner */}
                  <div className="relative h-36 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    <Image
                      src={store.bannerImage}
                      alt={store.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Category Pill on banner */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                        {store.category}
                      </span>
                    </div>

                    {/* Direct Domain Badge on banner if available */}
                    {store.domain && (
                      <div className="absolute top-3 right-3 z-10">
                        <a
                          href={directStoreUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/30 hover:bg-black/80 transition-colors"
                        >
                          <GlobeAltIcon className="w-3 h-3 text-amber-400" />
                          <span className="truncate max-w-[120px]">{store.domain}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Store Info */}
                  <div className="p-5 relative -mt-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-zinc-900 shrink-0 overflow-hidden relative">
                        {store.logoUrl ? (
                          <Image
                            src={store.logoUrl}
                            alt={store.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <span>{store.logoInitial || store.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="font-black text-base text-zinc-900 dark:text-white truncate">
                            {store.name}
                          </h3>
                          <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                          Verified Partner • {store.activeItems} Active Items
                        </span>
                      </div>
                    </div>

                    <p className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-4">
                      <MapPinIcon className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-5 pt-0 flex flex-col gap-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={store.slug && store.slug !== "ghuba" ? `/ghuba/store/${store.slug}` : `/ghuba/productlist?search=${encodeURIComponent(store.name)}`}
                      onClick={() => {
                        tracker.track({
                          eventType: InteractionEventType.STORE_CLICK,
                          channel: InteractionChannel.GHUBA,
                          metadata: {
                            storeId: store.id,
                            storeName: store.name,
                            address: store.address,
                          },
                        });
                      }}
                      className="py-2.5 px-3 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Visit Store</span>
                    </Link>

                    <a
                      href={`https://wa.me/${store.phone}?text=${encodeURIComponent(`Hello ${store.name}, I found your store on Ghuba Marketplace.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        tracker.track({
                          eventType: InteractionEventType.WHATSAPP_CLICK,
                          channel: InteractionChannel.WHATSAPP,
                          metadata: {
                            storeId: store.id,
                            storeName: store.name,
                            target: "store_spotlight",
                          },
                        });
                      }}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Direct Store Website / Custom Domain Link */}
                  {directStoreUrl && (
                    <a
                      href={directStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        tracker.track({
                          eventType: InteractionEventType.STORE_CLICK,
                          channel: InteractionChannel.GHUBA,
                          metadata: {
                            storeId: store.id,
                            storeName: store.name,
                            target: "direct_store_link",
                            url: directStoreUrl,
                          },
                        });
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border border-zinc-200/80 dark:border-zinc-700/80"
                      title={`Visit ${store.name}'s independent website`}
                    >
                      <GlobeAltIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>Direct Store Website</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
