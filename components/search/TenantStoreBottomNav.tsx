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
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { useStateContext } from "@/contexts/ContextProvider";
import UniversalSearchBar from "./UniversalSearchBar";
import { AnimatePresence, motion } from "framer-motion";

// Consolidated categories and templates where the nav should be hidden (only un-configured default placeholder)
const HIDDEN_NAV_CATEGORIES = new Set([
  "DefaultSite",
]);


export interface StoreNavConfig {
  basePath: string;
  shopLabel: string;
  ShopIcon: React.ComponentType<{ className?: string }>;
  hasCart: boolean;
  shopPath?: string;
}

// Helper to determine module configurations based on the store's template, variant, category or route path
export const getStoreNavConfig = (identifier = ""): StoreNavConfig => {
  const lowerId = (identifier || "").toLowerCase().replace(/[\s_-]+/g, "");

  // 1. Ghuba Native Flagship Marketplace (Directory in app/site/[slug] is "ghuba")
  if (lowerId.includes("ghuba")) {
    return { basePath: "ghuba", shopLabel: "Market", ShopIcon: SparklesIcon, hasCart: true, shopPath: "productlist" };
  }

  // 2. Multi-Vendor Marketplace (Directory in app/site/[slug] is "marketplace")
  if (lowerId.includes("marketplace")) {
    return { basePath: "marketplace", shopLabel: "Market", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }

  // 3. Restaurant & Food Delivery (Directory in app/site/[slug] is "restaurent")
  if (
    lowerId.includes("restaurent") ||
    lowerId.includes("restaurant") ||
    lowerId.includes("food") ||
    lowerId.includes("dining") ||
    lowerId.includes("menu") ||
    lowerId.includes("bistro") ||
    lowerId.includes("cafe") ||
    lowerId.includes("eatery")
  ) {
    return { basePath: "restaurent", shopLabel: "Menu", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }

  // 4. Bookings & Appointments: Salons, Spas, Barbershops & Dry Cleaning (Directory is "bookings")
  if (
    lowerId.includes("booking") ||
    lowerId.includes("appointment") ||
    lowerId.includes("barber") ||
    lowerId.includes("salon") ||
    lowerId.includes("drycleaning") ||
    lowerId.includes("spa") ||
    lowerId.includes("scheduler")
  ) {
    return { basePath: "bookings", shopLabel: "Services", ShopIcon: CalendarIcon, hasCart: true, shopPath: "products" };
  }

  // 5. Courses & Educational Learning (Directory is "courses")
  if (
    lowerId.includes("course") ||
    lowerId.includes("education") ||
    lowerId.includes("learning") ||
    lowerId.includes("academy") ||
    lowerId.includes("training") ||
    lowerId.includes("curriculum")
  ) {
    return { basePath: "courses", shopLabel: "Courses", ShopIcon: BookOpenIcon, hasCart: true, shopPath: "products" };
  }

  // 6. Fitness, Gym & Wellness Memberships (Directory is "fitness")
  if (
    lowerId.includes("fitness") ||
    lowerId.includes("gym") ||
    lowerId.includes("workout") ||
    lowerId.includes("crossfit") ||
    lowerId.includes("bodybuilding")
  ) {
    return { basePath: "fitness", shopLabel: "Programs", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }

  // 7. Specialized E-commerce Stores (explicitly mapped to actual app/site/[slug] directory names)
  if (
    lowerId.includes("shoe") ||
    lowerId.includes("footwear") ||
    lowerId.includes("sneaker") ||
    lowerId.includes("ecommerceshoes")
  ) {
    return { basePath: "ecommerceshoes", shopLabel: "Shoes", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("cake") ||
    lowerId.includes("bakery") ||
    lowerId.includes("pastry") ||
    lowerId.includes("cupcake") ||
    lowerId.includes("patisserie")
  ) {
    return { basePath: "cakeecommerce", shopLabel: "Bakery", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (lowerId.includes("baby") || lowerId.includes("toddler") || lowerId.includes("infant")) {
    return { basePath: "babyecommerce", shopLabel: "Baby", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("bookecommerce") ||
    (lowerId.includes("book") && !lowerId.includes("booking")) ||
    lowerId.includes("novel") ||
    lowerId.includes("library")
  ) {
    return { basePath: "bookecommerce", shopLabel: "Books", ShopIcon: BookOpenIcon, hasCart: true, shopPath: "products" };
  }
  if (lowerId.includes("bike") || lowerId.includes("bicycle") || lowerId.includes("cycling")) {
    return { basePath: "bikeecommerce", shopLabel: "Bikes", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("motorcycle") ||
    lowerId.includes("motorbike") ||
    lowerId.includes("biker") ||
    lowerId.includes("powersport") ||
    lowerId.includes("boda")
  ) {
    return { basePath: "motorcycleecommerce", shopLabel: "Motors", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("agrovet") ||
    lowerId.includes("agriculture") ||
    lowerId.includes("farming") ||
    lowerId.includes("crop")
  ) {
    return { basePath: "agrovetecommerce", shopLabel: "Agrovet", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("earphone") ||
    lowerId.includes("headphone") ||
    lowerId.includes("electronic") ||
    lowerId.includes("gadget") ||
    lowerId.includes("accessories")
  ) {
    return { basePath: "earphonesecommerce", shopLabel: "Electronics", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("meat") ||
    lowerId.includes("butcher") ||
    lowerId.includes("butchery") ||
    lowerId.includes("steak") ||
    lowerId.includes("poultry")
  ) {
    return { basePath: "meatecommerce", shopLabel: "Butchery", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("hardware") ||
    lowerId.includes("construction") ||
    lowerId.includes("powertool") ||
    lowerId.includes("buildingmaterial")
  ) {
    return { basePath: "hardwareecommerce", shopLabel: "Hardware", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("gaming") ||
    lowerId.includes("game") ||
    lowerId.includes("console") ||
    lowerId.includes("playstation") ||
    lowerId.includes("xbox") ||
    lowerId.includes("nintendo") ||
    lowerId.includes("esports")
  ) {
    return { basePath: "gamingecommerce", shopLabel: "Gaming", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("glasses") ||
    lowerId.includes("optical") ||
    lowerId.includes("eyewear") ||
    lowerId.includes("sunglass") ||
    lowerId.includes("optometry")
  ) {
    return { basePath: "glassesecommerce", shopLabel: "Eyewear", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("flower") ||
    lowerId.includes("florist") ||
    lowerId.includes("bouquet") ||
    lowerId.includes("blossom")
  ) {
    return { basePath: "flowersecommerce", shopLabel: "Flowers", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("furniture") ||
    lowerId.includes("decor") ||
    lowerId.includes("interior") ||
    lowerId.includes("furnishing")
  ) {
    return { basePath: "furnitureecommerce", shopLabel: "Furniture", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("fashion") ||
    lowerId.includes("clothing") ||
    lowerId.includes("apparel") ||
    lowerId.includes("boutique") ||
    lowerId.includes("wear")
  ) {
    return { basePath: "fashionecommerce", shopLabel: "Fashion", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("grocery") ||
    lowerId.includes("groceries") ||
    lowerId.includes("supermarket") ||
    lowerId.includes("produce")
  ) {
    return { basePath: "groceriesecommerce", shopLabel: "Groceries", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (lowerId.includes("honey") || lowerId.includes("apiary") || lowerId.includes("beekeeping")) {
    return { basePath: "honeyecommerce", shopLabel: "Honey", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (lowerId.includes("peanut") || lowerId.includes("groundnut") || lowerId.includes("nutbutter")) {
    return { basePath: "peanutecommerce", shopLabel: "Peanuts", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("pet") ||
    lowerId.includes("veterinary") ||
    lowerId.includes("animal") ||
    lowerId.includes("puppy")
  ) {
    return { basePath: "petsecommerce", shopLabel: "Pets", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("watch") ||
    lowerId.includes("timepiece") ||
    lowerId.includes("luxurywatch") ||
    lowerId.includes("horology")
  ) {
    return { basePath: "watchecommerce", shopLabel: "Watches", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }

  // 8. Automotive (Niche ecommerce vs Showroom/Dealership)
  if (
    lowerId.includes("automotiveecommerce") ||
    lowerId.includes("carecommerce") ||
    lowerId.includes("vehicleecommerce") ||
    (lowerId.includes("automotive") && (lowerId.includes("ecommerce") || lowerId.includes("store") || lowerId.includes("shop")))
  ) {
    return { basePath: "automotiveecommerce", shopLabel: "Vehicles", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("automotive") ||
    lowerId.includes("cardealership") ||
    lowerId.includes("vehicle") ||
    lowerId.includes("cars")
  ) {
    return { basePath: "automotive", shopLabel: "Vehicles", ShopIcon: BuildingOfficeIcon, hasCart: true, shopPath: "products" };
  }

  // 9. Service Providers, Handymen & Contractors (Directory has hyphen: "service-provider")
  if (
    lowerId.includes("serviceprovider") ||
    lowerId.includes("servicesite") ||
    lowerId.includes("handyman") ||
    lowerId.includes("contractor") ||
    lowerId.includes("plumber") ||
    lowerId.includes("electrician") ||
    lowerId.includes("service-provider") ||
    lowerId === "services"
  ) {
    return { basePath: "service-provider", shopLabel: "Services", ShopIcon: BriefcaseIcon, hasCart: true, shopPath: "products" };
  }

  // 10. Security Systems & Monitoring Services (Directories: "security" & "security2")
  if (lowerId.includes("security2") || lowerId.includes("securityconsulting")) {
    return { basePath: "security2", shopLabel: "Security", ShopIcon: BuildingOfficeIcon, hasCart: true, shopPath: "products" };
  }
  if (
    lowerId.includes("security") ||
    lowerId.includes("surveillance") ||
    lowerId.includes("cybersecurity") ||
    lowerId.includes("guard")
  ) {
    return { basePath: "security", shopLabel: "Security", ShopIcon: BuildingOfficeIcon, hasCart: true, shopPath: "products" };
  }

  // 11. Real Estate & Property Management (Directories: "propertymanagement" and "realestate")
  if (
    lowerId.includes("propertymanagement") ||
    lowerId.includes("propertymanager") ||
    lowerId.includes("propertymgmt") ||
    lowerId.includes("rentalmanagement")
  ) {
    return { basePath: "propertymanagement", shopLabel: "Properties", ShopIcon: BuildingOfficeIcon, hasCart: false, shopPath: "products" };
  }
  if (
    lowerId.includes("realestate") ||
    lowerId.includes("property") ||
    lowerId.includes("realtor") ||
    lowerId.includes("homes")
  ) {
    return { basePath: "realestate", shopLabel: "Properties", ShopIcon: BuildingOfficeIcon, hasCart: false, shopPath: "products" };
  }

  // 12. Directory & Claim Listings (Directories: "directorylistings" and "directory")
  if (lowerId.includes("directorylisting") || lowerId.includes("businessdirectory")) {
    return { basePath: "directorylistings", shopLabel: "Listings", ShopIcon: BuildingOfficeIcon, hasCart: false, shopPath: "products" };
  }
  if (lowerId.includes("directory") || lowerId.includes("listings") || lowerId.includes("localguide")) {
    return { basePath: "directory", shopLabel: "Directory", ShopIcon: BuildingOfficeIcon, hasCart: false, shopPath: "products" };
  }

  // 13. Corporate Profile, Portfolios & Personal Branding
  if (lowerId.includes("companyprofilelight") || lowerId.includes("companyportfoliolight")) {
    return { basePath: "companyprofilelight", shopLabel: "Services", ShopIcon: BriefcaseIcon, hasCart: true, shopPath: "services" };
  }
  if (
    lowerId.includes("companyprofile") ||
    lowerId.includes("companyportfolio") ||
    lowerId.includes("agencyportfolio")
  ) {
    return { basePath: "companyprofile", shopLabel: "Services", ShopIcon: BriefcaseIcon, hasCart: true, shopPath: "services" };
  }
  if (
    lowerId.includes("portfolio") ||
    lowerId.includes("personalbranding") ||
    lowerId.includes("branding") ||
    lowerId.includes("creativecv") ||
    lowerId.includes("freelance")
  ) {
    return { basePath: "portfolio", shopLabel: "Projects", ShopIcon: BriefcaseIcon, hasCart: false, shopPath: "products" };
  }
  if (
    lowerId.includes("consultan") ||
    lowerId.includes("coach") ||
    lowerId.includes("advisory") ||
    lowerId.includes("executivecoach") ||
    lowerId.includes("wellnessretreat")
  ) {
    return { basePath: "consultant", shopLabel: "Consulting", ShopIcon: BriefcaseIcon, hasCart: true, shopPath: "products" };
  }

  // 14. Healthcare, Clinics & Medical Centers (Directory is "healthcare")
  if (
    lowerId.includes("health") ||
    lowerId.includes("clinic") ||
    lowerId.includes("medical") ||
    lowerId.includes("hospital") ||
    lowerId.includes("doctor")
  ) {
    return { basePath: "healthcare", shopLabel: "Services", ShopIcon: BuildingOfficeIcon, hasCart: true, shopPath: "products" };
  }

  // 15. Logistics, Courier & Delivery (Directory is "logistics")
  if (
    lowerId.includes("logistics") ||
    lowerId.includes("delivery") ||
    lowerId.includes("courier") ||
    lowerId.includes("freight") ||
    lowerId.includes("shipping") ||
    lowerId.includes("deliveryservice")
  ) {
    return { basePath: "logistics", shopLabel: "Services", ShopIcon: BuildingOfficeIcon, hasCart: true, shopPath: "products" };
  }

  // 16. Events, Ticketing & Festivals (Directory is "events")
  if (
    lowerId.includes("event") ||
    lowerId.includes("ticket") ||
    lowerId.includes("conference") ||
    lowerId.includes("festival")
  ) {
    return { basePath: "events", shopLabel: "Events", ShopIcon: CalendarIcon, hasCart: true, shopPath: "products" };
  }

  // 17. Travel, Tours & Safari (Directory is "travel")
  if (
    lowerId.includes("travel") ||
    lowerId.includes("tourism") ||
    lowerId.includes("tour") ||
    lowerId.includes("safari") ||
    lowerId.includes("vacation") ||
    lowerId.includes("trips") ||
    lowerId.includes("destination")
  ) {
    return { basePath: "travel", shopLabel: "Trips", ShopIcon: GlobeAltIcon, hasCart: true, shopPath: "products" };
  }

  // 18. Finance, Banking & Fintech (Directory is "finance")
  if (
    lowerId.includes("finance") ||
    lowerId.includes("bank") ||
    lowerId.includes("investment") ||
    lowerId.includes("insurance") ||
    lowerId.includes("fintech") ||
    lowerId.includes("financialadvisor")
  ) {
    return { basePath: "finance", shopLabel: "Services", ShopIcon: BuildingOfficeIcon, hasCart: false, shopPath: "products" };
  }

  // 19. Media, News & Broadcasting (Directory is "media")
  if (
    lowerId.includes("media") ||
    lowerId.includes("entertainment") ||
    lowerId.includes("broadcast") ||
    lowerId.includes("production") ||
    lowerId.includes("filmstudio")
  ) {
    return { basePath: "media", shopLabel: "Media", ShopIcon: DocumentTextIcon, hasCart: false, shopPath: "products" };
  }

  // 20. Nonprofit & Community Causes (Directory is "nonprofit")
  if (
    lowerId.includes("nonprofit") ||
    lowerId.includes("charity") ||
    lowerId.includes("ngo") ||
    lowerId.includes("foundation") ||
    lowerId.includes("community") ||
    lowerId.includes("cause")
  ) {
    return { basePath: "nonprofit", shopLabel: "Causes", ShopIcon: BuildingOfficeIcon, hasCart: false, shopPath: "products" };
  }

  // 21. Public Speaking (Directory is "publicspeaking")
  if (
    lowerId.includes("publicspeaking") ||
    lowerId.includes("speaker") ||
    lowerId.includes("keynote") ||
    lowerId.includes("standardspeakersite")
  ) {
    return { basePath: "publicspeaking", shopLabel: "Topics", ShopIcon: BriefcaseIcon, hasCart: false, shopPath: "products" };
  }

  // 22. SaaS & Software Solutions (Directory is "saas")
  if (
    lowerId.includes("saas") ||
    lowerId.includes("software") ||
    lowerId.includes("applandingpage")
  ) {
    return { basePath: "saas", shopLabel: "Features", ShopIcon: BuildingOfficeIcon, hasCart: false, shopPath: "products" };
  }

  // 23. Blog, Articles & Editorial (Directory is "blog")
  if (
    lowerId.includes("blog") ||
    lowerId.includes("content") ||
    lowerId.includes("article") ||
    lowerId.includes("modernmagazine")
  ) {
    return { basePath: "blog", shopLabel: "Articles", ShopIcon: DocumentTextIcon, hasCart: false, shopPath: "products" };
  }

  // 24. Other / General Purpose Site (Directory is "other")
  if (
    lowerId.includes("other") ||
    lowerId.includes("generalpurpose") ||
    lowerId.includes("generalsite")
  ) {
    return { basePath: "other", shopLabel: "Explore", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "categories" };
  }

  // 25. Dynamic catch-all for any other *ecommerce themes
  const ecomMatch = lowerId.match(/([a-z]+)ecommerce/);
  if (ecomMatch) {
    return { basePath: ecomMatch[0], shopLabel: "Shop", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
  }

  // Default fallback to standard general ecommerce
  return { basePath: "ecommerce", shopLabel: "Shop", ShopIcon: ShoppingBagIcon, hasCart: true, shopPath: "products" };
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
  const category = storeFormData?.category || "";
  const variant = storeFormData?.variant || "";
  const templateName = storeFormData?.template || storeFormData?.componentName || "";
  const websiteTemplate = (storeFormData as any)?.website?.templateKey || "";

  // 1. Explicit merchant opt-out check
  const isExplicitlyDisabled = 
    storeFormData?.hideBottomNav || 
    storeFormData?.themeSettings?.hideBottomNav;

  // Only hide if explicitly disabled by merchant or purely un-configured DefaultSite
  if (isExplicitlyDisabled || category === "DefaultSite" || templateName === "DefaultSite") {
    return null;
  }

  // 2. Extract active route directory from pathname if user is currently browsing a sub-route:
  // e.g. /site/my-slug/restaurent/products -> "restaurent"
  let routePathSegment = "";
  if (pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const siteIdx = segments.indexOf("site");
    if (siteIdx !== -1 && segments.length > siteIdx + 2) {
      routePathSegment = segments[siteIdx + 2];
    }
  }

  // Combine identifiers from most specific (active route segment, variant, template, category)
  const navConfigIdentifier = [routePathSegment, variant, templateName, websiteTemplate, category]
    .filter(Boolean)
    .join(" ");

  const { basePath, shopLabel, ShopIcon, hasCart, shopPath = "products" } = getStoreNavConfig(navConfigIdentifier);

  // Build root and dynamic module links
  const isPathScoped = Boolean(slug && (pathname?.startsWith(`/site/${slug}`) || (typeof window !== "undefined" && window.location.pathname.startsWith(`/site/${slug}`))));
  const baseRoute = isPathScoped ? `/site/${slug}` : "";
  
  const navItems = useMemo(() => [
    { name: "Home", icon: HomeIcon, href: baseRoute || "/" },
    { name: shopLabel, icon: ShopIcon, href: `${baseRoute}/${basePath}/${shopPath}` },
    { name: "Search", icon: MagnifyingGlassIcon, isAction: true },
    ...(hasCart ? [{ name: "Cart", icon: ShoppingCartIcon, href: `${baseRoute}/${basePath}/checkout`, badge: cart?.length || 0 }] : []),
    { name: "Account", icon: UserIcon, href: `${baseRoute}/${basePath}/profile` },
  ], [baseRoute, basePath, shopPath, shopLabel, ShopIcon, hasCart, cart?.length]);

  return (
    <>
      {/* Floating Pill Navigation Container */}
      <div className="fixed bottom-4 left-0 w-full z-50 md:hidden px-4 pointer-events-none">
        <nav className="pointer-events-auto max-w-md mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/40 dark:border-zinc-700/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between px-2 py-2 relative">
          
          {navItems.map((item, index) => {
            const { name, icon: Icon, href, isAction, badge } = item;
            const isHome = href === "/" || href === baseRoute;
            const isActive = href
              ? isHome
                ? pathname === href
                : pathname === href || (pathname ? pathname.startsWith(href) : false)
              : false;

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
                productsBasePath={`${baseRoute}/${basePath}/${shopPath}`}
                placeholder={`Search in ${storeName}...`}
                autoFocus={true}
                onSearchSubmit={(q) => {
                  setIsSearchOpen(false);
                  const searchUrl = `${baseRoute}/${basePath}/${shopPath}?search=${encodeURIComponent(q)}`;
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