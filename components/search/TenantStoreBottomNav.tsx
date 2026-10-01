"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
  CalendarIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { useStateContext } from "@/contexts/ContextProvider";
import UniversalSearchBar from "./UniversalSearchBar";
import { AnimatePresence, motion } from "framer-motion";

// Consolidated categories and templates where the nav should be hidden
const HIDDEN_NAV_CATEGORIES = new Set([
  // Layout Names
  "CompanyPortfolioSite",
  "CompanyPortfolioLightSite",
  "DefaultSite",
  "SaaSSite",
  "SaasSite",
  "PublicSpeakingSite",
  "NonProfitSite",
  "AutomotiveSite",
  "BlogSite",
  "BookingSite",
  "CourseSite",
  "FinanceSite",
  "EventsSite",
  "FitnessSite",
  "HealthSite",
  "LogisticsSite",
  "MediaSite",
  "PortfolioSite",
  "SecuritySite",
  "ServiceProviderSite",

  // Business Categories
  "Automotive",
  "Blog & Content",
  "Booking & Appointments",
  "Company Portfolio",
  "Consultant & Coach",
  "Delivery & Logistics",
  "Drycleaning",
  "Educational & Online Courses",
  "Fitness & Wellness",
  "Healthcare & Clinics",
  "Media & Entertainment",
  "Nonprofit & Community",
  "Portfolio & Personal Branding",
  "Property Management",
  "Public Speaking",
  "Real Estate",
  "Security",
  "Service Provider",
  
  // Conditionally hide these depending on your business rules
  // "Baby Store",
  // "Barbershop",
  // "Event & Ticketing",
  // "Fashion Shop",
  // "Restaurant & Food Delivery",
  // "Travel & Tourism",
]);

// Helper to determine module configurations based on the store's template/component name
const getStoreNavConfig = (identifier = "") => {
  const lowerId = identifier.toLowerCase();

  if (lowerId.includes("booking") || lowerId.includes("salon") || lowerId.includes("drycleaning") || lowerId.includes("barbershop")) {
    return { basePath: "bookings", shopLabel: "Services", ShopIcon: CalendarIcon, hasCart: true };
  }
  if (lowerId.includes("course") || lowerId.includes("education")) {
    return { basePath: "courses", shopLabel: "Courses", ShopIcon: BookOpenIcon, hasCart: true };
  }
  if (lowerId.includes("realestate") || lowerId.includes("property")) {
    return { basePath: "real-estate", shopLabel: "Properties", ShopIcon: BuildingOfficeIcon, hasCart: false };
  }
  if (lowerId.includes("blog") || lowerId.includes("media") || lowerId.includes("content")) {
    return { basePath: "blog", shopLabel: "Articles", ShopIcon: DocumentTextIcon, hasCart: false };
  }
  if (lowerId.includes("portfolio") || lowerId.includes("branding")) {
    return { basePath: "portfolio", shopLabel: "Projects", ShopIcon: BriefcaseIcon, hasCart: false };
  }
  if (lowerId.includes("restaurant") || lowerId.includes("food")) {
    return { basePath: "restaurant", shopLabel: "Menu", ShopIcon: ShoppingBagIcon, hasCart: true };
  }
  if (lowerId.includes("automotive") && !lowerId.includes("ecommerce")) {
    return { basePath: "automotive", shopLabel: "Vehicles", ShopIcon: BuildingOfficeIcon, hasCart: false };
  }

  // Dynamic e-commerce categories
  const ecomMatch = lowerId.match(/([a-z]+)ecommerce/);
  if (ecomMatch) {
    return { basePath: ecomMatch[0], shopLabel: "Shop", ShopIcon: BuildingOfficeIcon, hasCart: false };
  }

  // Default fallback
  return { basePath: "ecommerce", shopLabel: "Shop", ShopIcon: ShoppingBagIcon, hasCart: true };
};

export default function TenantStoreBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const { cart } = useStateContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const slug = storeFormData?.slug;
  const storeName = storeFormData?.name || "Store";
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f59e0b";
  const category = storeFormData?.category;
  const templateName = storeFormData?.template || storeFormData?.componentName;

  // 1. Core Logic Update: Explicitly check category AND template against our hidden set
  const isExcludedByCategoryOrTemplate = 
    HIDDEN_NAV_CATEGORIES.has(category) || 
    HIDDEN_NAV_CATEGORIES.has(templateName);

  const isExplicitlyDisabled = 
    storeFormData?.hideBottomNav || 
    storeFormData?.themeSettings?.hideBottomNav;

  if (isExcludedByCategoryOrTemplate || isExplicitlyDisabled) {
    return null;
  }

  const navConfigIdentifier = category || templateName || "EcommerceSite";
  const { basePath, shopLabel, ShopIcon, hasCart } = getStoreNavConfig(navConfigIdentifier);

  // Build root and dynamic module links
  const isPathScoped = typeof window !== "undefined" && slug && window.location.pathname.startsWith(`/site/${slug}`);
  const baseRoute = isPathScoped ? `/site/${slug}` : "";
  
  const navItems = useMemo(() => [
    { name: "Home", icon: HomeIcon, href: baseRoute || "/" },
    { name: shopLabel, icon: ShopIcon, href: `${baseRoute}/${basePath}/products` },
    { name: "Search", icon: MagnifyingGlassIcon, isAction: true },
    ...(hasCart ? [{ name: "Cart", icon: ShoppingCartIcon, href: `${baseRoute}/${basePath}/cart`, badge: cart?.length || 0 }] : []),
    { name: "Account", icon: UserIcon, href: `${baseRoute}/${basePath}/profile` },
  ], [baseRoute, basePath, shopLabel, ShopIcon, hasCart, cart?.length]);

  return (
    <>
      {/* Floating Pill Navigation Container */}
      <div className="fixed bottom-4 left-0 w-full z-50 md:hidden px-4 pointer-events-none">
        <nav className="pointer-events-auto max-w-md mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/40 dark:border-zinc-700/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between px-2 py-2 relative">
          
          {navItems.map((item, index) => {
            const { name, icon: Icon, href, isAction, badge } = item;
            const isActive = href ? pathname === href || (href !== "/" && pathname?.startsWith(href)) : false;

            if (isAction) {
              return (
                <div key={name} className="relative flex-1 flex justify-center -top-6">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="relative flex flex-col items-center justify-center group outline-none"
                    aria-label="Search catalog"
                  >
                    <div
                      className="w-14 h-14 rounded-full text-zinc-950 flex items-center justify-center border-[3px] border-white dark:border-zinc-900 transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, #f59e0b)`,
                        boxShadow: `0 8px 24px -6px ${primaryColor}80`,
                      }}
                    >
                      <Icon className="w-6 h-6 stroke-[2.5] text-white" />
                    </div>
                  </motion.button>
                </div>
              );
            }

            return (
              <Link
                key={name}
                href={href!}
                prefetch={true}
                className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 outline-none group"
              >
                {/* Active Sliding Pill Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-amber-50 dark:bg-zinc-800 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="relative"
                  >
                    <Icon
                      className={`w-[22px] h-[22px] mb-1 transition-all duration-300 ${
                        isActive 
                          ? "stroke-[2.5] text-amber-500" 
                          : "stroke-[1.8] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
                      }`}
                    />
                    
                    {/* Animated Badge */}
                    {badge !== undefined && badge > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-sm"
                      >
                        {badge > 99 ? "99+" : badge}
                      </motion.span>
                    )}
                  </motion.div>
                  
                  <span
                    className={`text-[9px] tracking-wide transition-all duration-300 ${
                      isActive 
                        ? "font-bold text-amber-600 dark:text-amber-500" 
                        : "font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
                    }`}
                  >
                    {name}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Search Bottom Sheet */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[1000] flex flex-col justify-end md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full bg-white dark:bg-zinc-950 rounded-t-[32px] shadow-2xl border-t border-zinc-200/50 dark:border-zinc-800/50 p-6 pb-10 max-h-[85vh] overflow-y-auto z-10"
            >
              <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Discover {storeName}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              </div>

              <UniversalSearchBar
                scope="STORE"
                companyId={storeFormData?.id}
                storeSlug={storeFormData?.slug}
                productsBasePath={`${baseRoute}/${basePath}/products`}
                placeholder={`Search in ${storeName}...`}
                autoFocus={true}
                onSearchSubmit={(q) => {
                  setIsSearchOpen(false);
                  const searchUrl = `${baseRoute}/${basePath}/products?search=${encodeURIComponent(q)}`;
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