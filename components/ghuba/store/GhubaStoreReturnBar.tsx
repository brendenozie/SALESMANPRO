"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon, 
  ShoppingCartIcon, 
  MagnifyingGlassIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/solid";
import { useStateContext } from "@/contexts/ContextProvider";

interface GhubaStoreReturnBarProps {
  storeName?: string;
  storeSlug?: string;
}

export default function GhubaStoreReturnBar({ storeName, storeSlug }: GhubaStoreReturnBarProps) {
  const [cartCount, setCartCount] = useState<number>(0);
  const context = useStateContext?.() || {};

  // Sync cart count reactively
  useEffect(() => {
    const updateCount = () => {
      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("ghuba_cart");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const total = parsed.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartCount(total);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Could not read ghuba_cart count:", err);
      }

      if (context?.cart && Array.isArray(context.cart)) {
        setCartCount(context.cart.length);
      }
    };

    updateCount();

    const handleCartEvent = () => updateCount();
    window.addEventListener("ghuba:cart:add", handleCartEvent);
    window.addEventListener("storage", handleCartEvent);

    return () => {
      window.removeEventListener("ghuba:cart:add", handleCartEvent);
      window.removeEventListener("storage", handleCartEvent);
    };
  }, [context?.cart]);

  return (
    <aside 
      aria-label="Ghuba Marketplace Navigation"
      className="sticky top-0 z-50 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-white text-xs py-2 px-3 sm:px-6 shadow-md transition-all select-none"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Back to Marketplace */}
        <div className="flex items-center gap-3">
          <Link
            href="/site/ghuba"
            className="group inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            title="Return to Ghuba Marketplace"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Return to</span>
            <span>Ghuba Marketplace</span>
          </Link>

          {storeName && (
            <div className="hidden md:flex items-center gap-1.5 text-zinc-400 font-medium pl-2 border-l border-zinc-800">
              <span className="text-zinc-500">Browsing:</span>
              <span className="text-zinc-200 font-bold truncate max-w-[200px]">{storeName}</span>
              <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
          )}
        </div>

        {/* Center: Escrow Assurance Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px]">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>M-Pesa Escrow Protection Active</span>
          <span className="text-emerald-500/60">•</span>
          <span className="text-zinc-400 font-normal">Pay on Inspection</span>
        </div>

        {/* Right: Search & Cart Access */}
        <div className="flex items-center gap-2">
          <Link
            href="/ghuba/productlist"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors font-medium"
            title="Search Ghuba Marketplace"
          >
            <MagnifyingGlassIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search Hub</span>
          </Link>

          <Link
            href="/ghuba/checkout"
            className="relative flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
            title="View Active Ghuba Cart"
          >
            <ShoppingCartIcon className="w-3.5 h-3.5" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full bg-zinc-950 text-amber-400 ml-0.5">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
