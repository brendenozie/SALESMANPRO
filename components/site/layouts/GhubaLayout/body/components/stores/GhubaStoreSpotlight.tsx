"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  BuildingStorefrontIcon, 
  MapPinIcon, 
  CheckBadgeIcon, 
  ArrowRightIcon 
} from "@heroicons/react/24/solid";
import { 
  GlobeAltIcon, 
  ArrowTopRightOnSquareIcon 
} from "@heroicons/react/24/outline";
import { FaWhatsapp } from "react-icons/fa";
import { tracker } from "@/lib/analytics/tracker";
import { InteractionEventType, InteractionChannel } from "@/lib/analytics/types";

const WhatsAppIcon = FaWhatsapp as any;

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
    <section className="py-12 md:py-20 bg-white dark:bg-[#080808] border-b border-zinc-100 dark:border-zinc-800/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-500" />
                Physical Storefronts Verified
              </span>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Walk-in CBD collection or instant delivery</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-tight">
              Verified <span className="text-amber-500 dark:text-amber-400 italic">Merchant Stores</span>
            </h2>
          </div>

          <Link
            href="/ghuba/store"
            className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors self-start sm:self-auto py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <span>Explore All Stores</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </Link>
        </div>

        {/* Store Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayStores.map((store) => {
            const rawPhone = store.phone || "254706448146";
            const cleanPhone = rawPhone.replace(/\D/g, "");
            const formattedPhone = cleanPhone.startsWith("0")
              ? `254${cleanPhone.slice(1)}`
              : cleanPhone.startsWith("254")
                ? cleanPhone
                : `254${cleanPhone}`;

            const directStoreUrl = store.domain
              ? (store.domain.startsWith("http") ? store.domain : `https://${store.domain}`)
              : (store.slug && store.slug !== "ghuba" ? `/site/${store.slug}` : null);

            return (
              <div
                key={store.id}
                className="group bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Store Banner */}
                  <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
                    <Image
                      src={store.bannerImage}
                      alt={store.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-85 contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Category Pill on banner */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-400 border border-white/10 shadow-sm">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-zinc-200 border border-white/10 hover:bg-black/90 transition-colors shadow-sm"
                        >
                          <GlobeAltIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span className="truncate max-w-[130px]">{store.domain}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Store Info Container */}
                  <div className="p-6 relative -mt-8">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Logo Avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-amber-500 text-zinc-950 font-black text-2xl flex items-center justify-center shadow-xl ring-4 ring-zinc-50 dark:ring-zinc-900 shrink-0 overflow-hidden relative">
                        {store.logoUrl ? (
                          <Image
                            src={store.logoUrl}
                            alt={store.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <span>{store.logoInitial || store.name.charAt(0)}</span>
                        )}
                      </div>

                      {/* Store Name & Details */}
                      <div className="min-w-0 pt-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="font-black text-base text-zinc-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                            {store.name}
                          </h3>
                          <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0" title="Verified Merchant" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                          Verified Partner • {store.activeItems} Active Items
                        </span>
                      </div>
                    </div>

                    <p className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      <MapPinIcon className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-6 pt-0 flex flex-col gap-2.5 border-t border-zinc-200/60 dark:border-zinc-800/80 mt-auto">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Primary Ghuba Store Page */}
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
                      className="py-3 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <span>Visit Store</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>

                    {/* WhatsApp Inquiry CTA */}
                    <a
                      href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Hello ${store.name}, I found your verified store on Ghuba Marketplace.`)}`}
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
                      className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Direct Website Link */}
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
                      className="w-full py-2.5 px-3 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border border-zinc-200/80 dark:border-zinc-700/60"
                      title={`Visit ${store.name}'s independent website`}
                    >
                      <GlobeAltIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>Direct Store Website</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 text-zinc-400" />
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