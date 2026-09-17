"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { useStateContext } from "@/contexts/ContextProvider";
import UniversalSearchBar from "./UniversalSearchBar";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function TenantStoreBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const { cart } = useStateContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const slug = storeFormData?.slug;
  const storeName = storeFormData?.name || "Store";
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f59e0b";

  // Build root and products links respecting /site/[slug] prefix if active
  const isPathScoped = typeof window !== "undefined" && slug && window.location.pathname.startsWith(`/site/${slug}`);
  const homeLink = isPathScoped ? `/site/${slug}` : "/";
  const productsLink = isPathScoped ? `/site/${slug}/ecommerce/products` : "/ecommerce/products";
  const cartLink = isPathScoped ? `/site/${slug}/ecommerce/cart` : "/ecommerce/cart";
  const profileLink = isPathScoped ? `/site/${slug}/ecommerce/profile` : "/ecommerce/profile";

  const navItems = [
    { name: "Home", icon: HomeIcon, href: homeLink },
    { name: "Shop", icon: ShoppingBagIcon, href: productsLink },
    { name: "Search", icon: MagnifyingGlassIcon, isAction: true },
    { name: "Cart", icon: ShoppingCartIcon, href: cartLink, badge: cart?.length || 0 },
    { name: "Account", icon: UserIcon, href: profileLink },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden px-4 pb-3 pt-1 pointer-events-none">
        <nav className="pointer-events-auto max-w-md mx-auto bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 py-1.5 relative">
          {navItems.map(({ name, icon: Icon, href, isAction, badge }) => {
            const isActive = href
              ? pathname === href || (href !== "/" && pathname?.startsWith(href))
              : false;

            if (isAction) {
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="relative -top-5 flex flex-col items-center justify-center active:scale-90 transition-transform group"
                  aria-label="Search catalog"
                >
                  <div
                    className="w-13 h-13 rounded-full text-zinc-950 shadow-lg flex items-center justify-center border-4 border-white dark:border-zinc-950 group-hover:rotate-6 transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, #f59e0b)`,
                      boxShadow: `0 8px 20px -4px ${primaryColor}66`,
                    }}
                  >
                    <Icon className="w-6 h-6 stroke-[2.5] text-white" />
                  </div>
                  <span className="text-[10px] font-black tracking-tight text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {name}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={name}
                href={href!}
                prefetch={true}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-90 ${
                  isActive
                    ? "text-amber-500 font-bold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "stroke-[2.2] scale-110" : "stroke-[1.7]"
                    } transition-transform`}
                  />
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-950">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-semibold ${
                    isActive ? "font-black" : ""
                  }`}
                >
                  {name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Search Bottom Sheet / Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[1000] flex flex-col justify-end md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl border-t border-zinc-200 dark:border-zinc-800 p-5 pb-8 max-h-[85vh] overflow-y-auto z-10"
            >
              {/* Grab handle */}
              <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Search {storeName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <UniversalSearchBar
                scope="STORE"
                companyId={storeFormData?.id}
                storeSlug={storeFormData?.slug}
                productsBasePath="/ecommerce/products"
                placeholder={`Search in ${storeName}...`}
                autoFocus={true}
                onSearchSubmit={(q) => {
                  setIsSearchOpen(false);
                  const searchUrl = isPathScoped
                    ? `/site/${slug}/ecommerce/products?search=${encodeURIComponent(q)}`
                    : `/ecommerce/products?search=${encodeURIComponent(q)}`;
                  router.push(searchUrl);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
