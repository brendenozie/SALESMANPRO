"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ClockIcon, XMarkIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "@/contexts/ContextProvider";
import { getListingPublicUrl } from "@/lib/ghuba-slug";

export default function RecentlyViewedRail() {
  const [items, setItems] = useState<any[]>([]);
  const { addToCart } = useStateContext();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ghuba:recently_viewed");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const clearHistory = () => {
    try {
      localStorage.removeItem("ghuba:recently_viewed");
      setItems([]);
    } catch {
      // Ignore
    }
  };

  if (!items.length) return null;

  return (
    <section className="py-8 md:py-12 bg-zinc-50/70 dark:bg-[#0a0a0a] border-b border-zinc-200/60 dark:border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ClockIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-zinc-900 dark:text-white tracking-tight">
                Recently <span className="text-amber-500 italic">Viewed</span>
              </h2>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                Pick up where you left off
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={clearHistory}
            className="text-xs font-bold text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-1"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Horizontal Mini Cards Rail */}
        <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
          {items.map((item) => {
            const publicUrl = getListingPublicUrl(item);
            const imageSrc = item.images?.[0] || "https://via.placeholder.com/200";

            return (
              <div
                key={item.id}
                className="group relative flex-shrink-0 w-[180px] sm:w-[220px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all p-3 snap-start flex flex-col justify-between"
              >
                <div>
                  <Link href={publicUrl} className="block relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2.5">
                    <Image
                      src={imageSrc}
                      alt={item.name || item.title || "Product"}
                      fill
                      sizes="220px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <Link href={publicUrl} className="block">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors">
                      {item.name || item.title}
                    </h3>
                  </Link>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-zinc-900 dark:text-white tabular-nums">
                    KES {(item.finalPrice || item.sellingPrice || 0).toLocaleString()}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors active:scale-95"
                    aria-label="Add to Cart"
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
