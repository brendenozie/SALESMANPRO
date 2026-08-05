"use client";

import React, { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { mutate } from "swr";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ArrowLeftOnRectangleIcon,
  BuildingStorefrontIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { getCategoryMenus } from "@/constant/CATEGORY_MENUS";
import { useStoreContext } from "@/contexts/StoreContext";
import PricingSection from "@/app/stores/PricingSection";

// --- Helper types and functions ---
export interface SubMenuItem {
  label: string;
  href?: string;
  minTier?: string;
  accessLevel?: string[];
  isLocked?: boolean;
}

export interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  minTier?: string;
  accessLevel?: string[];
  subItems?: SubMenuItem[];
  isLocked?: boolean;
}

type Role = "STUDENT" | "EDUCATOR" | "PARENT" | "SCHOOL_DRIVER" | string;
type CategoryType = string;
type MenuMap = Record<string, MenuItem[]>;

// ------------------------------------------------------------------
// --- PRICING MODAL CONTAINER ---
// ------------------------------------------------------------------

const PricingModal = ({
  isOpen,
  onClose,
  companyId,
  email,
  category,
  onSubscriptionSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string | null;
  email: string;
  category: string;
  onSubscriptionSuccess: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && companyId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md overflow-y-auto h-full w-full flex justify-center z-40 p-3 sm:p-6"
        >
          <motion.div
            initial={{ y: "30px", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "30px", opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-slate-50 dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-7xl my-auto border border-slate-200 dark:border-slate-800"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-50 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
            >
              <XMarkIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
            <div className="overflow-y-auto h-full max-h-[calc(100vh-6rem)] rounded-2xl">
              <PricingSection
                companyId={companyId}
                email={email}
                category={category}
                onSubscriptionSuccess={onSubscriptionSuccess}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const principalCategories = [
  "Educational & Online Courses",
  "Head Teacher",
  "School Head",
];
const isPrincipalCategory = (cat?: CategoryType) =>
  cat ? principalCategories.includes(cat) : false;

function getMenuItemsFor(
  userRole: Role,
  categoryType: CategoryType,
  allCategoryMenus: MenuMap
): MenuItem[] {
  const defaultFallbackMenu = allCategoryMenus.Other || [];
  switch (userRole) {
    case "JUNIOR":
    case "SENIOR":
    case "STUDENT":
      return allCategoryMenus.Student ?? defaultFallbackMenu;
    case "PARENT":
      return allCategoryMenus.Parent ?? defaultFallbackMenu;
    case "SCHOOL_DRIVER":
      return allCategoryMenus.SCHOOL_DRIVER ?? defaultFallbackMenu;
    case "STORE_DRIVER":
      return allCategoryMenus.STORE_DRIVER ?? defaultFallbackMenu;
    case "EDUCATOR":
      if (isPrincipalCategory(categoryType)) {
        return (
          allCategoryMenus.Principal ??
          allCategoryMenus.Educator ??
          defaultFallbackMenu
        );
      }
      return (
        allCategoryMenus.Educator ??
        allCategoryMenus.Tutor ??
        defaultFallbackMenu
      );
    case "TUTOR":
      return allCategoryMenus.Tutor ?? defaultFallbackMenu;
    default:
      return allCategoryMenus[categoryType] ?? defaultFallbackMenu;
  }
}

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { data: session } = useSession();
  const { storeFormData, userRole, userId } = useStoreContext();
  const pathname = usePathname();

  // Layout State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  
  // Pricing & Modal State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCurrentRouteLocked, setIsCurrentRouteLocked] = useState(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 1. Dark Mode Sync Effect
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // 2. POS Navigation Check
  const shouldHideNav = useMemo(() => {
    const posRoutes = [
      "/pos",
      "/storepos",
      "/service-pos",
      "/fitness-pos",
      "/health-pos",
      "/company-pos",
    ];
    return posRoutes.some((route) => pathname.endsWith(route));
  }, [pathname]);

  const handleManageSubscription = (companyId: string, category: string) => {
    setSelectedCompanyId(companyId);
    setSelectedCategory(category);
    setIsPricingModalOpen(true);    
    setIsCollapsed(true); // Collapse the sidebar when opening the modal
  };

  const handleSubscriptionSuccess = () => {
    setIsPricingModalOpen(false);
    setIsCollapsed(false);
    mutate(``); // Refresh the current route to reflect subscription changes
  };

  // 3. Category & Menus Memoization
  const companyId: string = storeFormData?.id || "6964daeff4ad17d959b72413";

  // Extract the specific store's active subscription tier
  const currentTier = storeFormData?.subscription?.plan?.name || "INACTIVE";
  const currentTierStatus = storeFormData?.subscription?.status || "INACTIVE";

  const categoryType = useMemo(() => {
    const category = storeFormData?.category;
    if (!category) return "Other";
    if (category.toLowerCase() === "automotive") {
      return capitalize(storeFormData?.variant || "Other");
    }
    return capitalize(category);
  }, [storeFormData?.category, storeFormData?.variant]);

  // Pass the tier downward (Fixed syntax error here)
  const menus = useMemo(
    () => getCategoryMenus(companyId, userRole, currentTier, currentTierStatus === "ACTIVE"),
    [companyId, userRole, currentTier, currentTierStatus]
  );

  const menuItems = useMemo(
    () => getMenuItemsFor(userRole, categoryType, menus),
    [userRole, categoryType, menus]
  );

  // 4. Client-side Route Protection Effect
  useEffect(() => {
    let locked = false;

    // Check if the current pathname matches a locked menu item
    for (const item of menuItems) {
      if (item.href && pathname.startsWith(item.href) && item.isLocked) {
        locked = true;
        break;
      }
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.href && pathname.startsWith(sub.href) && sub.isLocked) {
            locked = true;
            break;
          }
        }
      }
    }

    setIsCurrentRouteLocked(locked);

    if (locked) {
      setIsPricingModalOpen(true);
      setIsCollapsed(true);
    }
  }, [pathname, menuItems]);

  // 5. Auto-expand Active Category
  useEffect(() => {
    for (const item of menuItems) {
      if (item.subItems?.some((sub) => sub.href && pathname.startsWith(sub.href))) {
        setOpenLabel(item.label);
        break;
      }
    }
  }, [pathname, menuItems]);

  // 6. Close Mobile Drawer on Route Transition
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // 7. Label Formatting
  const formattedRole = useMemo(() => {
    const roleLower = (userRole || "").toLowerCase();
    if (roleLower === "consumer") return "Admin";
    if (roleLower === "senior" || roleLower === "junior") return "Student";
    return userRole;
  }, [userRole]);

  const companyDisplayName = useMemo(() => {
    if (storeFormData?.name === "Teacher" || storeFormData?.name === "Students") {
      return "";
    }
    return storeFormData?.name || "Company Portal";
  }, [storeFormData?.name]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleSignOut = () => {
    const returnTo = window.location.origin;
    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

  const handleNavigation = (e: React.MouseEvent, item: MenuItem | SubMenuItem) => {
    if (item.isLocked) {
      e.preventDefault(); // Stop Next.js router from navigating
      setIsCollapsed(true); // Expand sidebar if collapsed
      setIsPricingModalOpen(true); // Trigger your modal state
    }
  };

  // =========================================================================
  // EARLY RETURNS (MUST BE AFTER ALL HOOKS)
  // =========================================================================

  // Full-Screen POS Layout Bypass
  if (shouldHideNav) {
    return (
      <main className="w-screen h-screen overflow-auto bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </main>
    );
  }

  // Operational Roles Bypass
  if (
    userRole === "JUNIOR" ||
    userRole === "SCHOOL_DRIVER" ||
    userRole === "STORE_DRIVER"
  ) {
    return (
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </main>
    );
  }

  // =========================================================================
  // MAIN RENDER
  // =========================================================================
  return (
    <>
      <div className="flex h-screen bg-gray-100 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-200">
        {/* MOBILE OVERLAY BACKDROP */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 dark:bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out shadow-2xl ${
            mobileOpen ? "translate-x-0 w-72" : "-translate-x-full"
          } lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
        >
          {/* BRANDING / USER PROFILE HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="h-10 w-10 min-w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                {(formattedRole || "A").charAt(0).toUpperCase()}
              </div>
              {(!isCollapsed || mobileOpen) && (
                <div className="flex flex-col min-w-0 transition-opacity duration-300">
                  <span className="font-semibold text-sm text-white truncate capitalize">
                    {formattedRole}
                  </span>
                  {companyDisplayName && (
                    <span className="text-xs text-slate-400 truncate">
                      {companyDisplayName}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            {menuItems.map((item) => {
              const isActiveParent = item.subItems
                ? item.subItems.some(
                    (sub) => sub.href && pathname.startsWith(sub.href)
                  )
                : item.href && pathname.startsWith(item.href);
              const isOpen = openLabel === item.label;

              if (!item.subItems?.length) {
                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href || "#"}
                      onClick={(e) => handleNavigation(e, item)}
                      className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        item.isLocked
                          ? "text-slate-500 hover:bg-slate-800/50"
                          : isActiveParent
                          ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      } ${isCollapsed && !mobileOpen ? "justify-center" : "space-x-3"}`}
                    >
                      {item.icon ? (
                        <item.icon className="h-5 w-5 shrink-0" />
                      ) : (
                        <BuildingStorefrontIcon className="h-5 w-5 shrink-0" />
                      )}
                      {(!isCollapsed || mobileOpen) && (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.isLocked && (
                            <LockClosedIcon className="h-4 w-4 shrink-0 opacity-70" />
                          )}
                        </>
                      )}
                    </Link>

                    {isCollapsed && !mobileOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                        {item.label}
                        {item.isLocked && " (Locked)"}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.label} className="relative group">
                  <button
                    onClick={(e) => {
                      if (item.isLocked) {
                        handleNavigation(e, item);
                        return;
                      }
                      if (isCollapsed && !mobileOpen) {
                        setIsCollapsed(false);
                        setOpenLabel(item.label);
                      } else {
                        setOpenLabel((prev) =>
                          prev === item.label ? null : item.label
                        );
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      item.isLocked
                        ? "text-slate-500 hover:bg-slate-800/50"
                        : isActiveParent || isOpen
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    } ${isCollapsed && !mobileOpen ? "justify-center" : ""}`}
                  >
                    <div
                      className={`flex items-center ${
                        isCollapsed && !mobileOpen ? "" : "space-x-3 truncate"
                      }`}
                    >
                      {item.icon ? (
                        <item.icon className="h-5 w-5 shrink-0" />
                      ) : (
                        <BuildingStorefrontIcon className="h-5 w-5 shrink-0" />
                      )}
                      {(!isCollapsed || mobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>
                    {(!isCollapsed || mobileOpen) && (
                      item.isLocked ? (
                        <LockClosedIcon className="h-4 w-4 shrink-0 opacity-70" />
                      ) : (
                        <ChevronDownIcon
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-sky-400" : "text-slate-400"
                          }`}
                        />
                      )
                    )}
                  </button>

                  {isOpen && (!isCollapsed || mobileOpen) && !item.isLocked && (
                    <div className="mt-1 ml-4 pl-3 border-l border-slate-700/60 space-y-1">
                      {item.subItems.map((sub) => {
                        const isActiveSub = sub.href
                          ? pathname.startsWith(sub.href)
                          : false;
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href || "#"}
                            onClick={(e) => handleNavigation(e, sub)}
                            className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 ${
                              sub.isLocked
                                ? "text-slate-500 hover:bg-slate-800/50"
                                : isActiveSub
                                ? "bg-sky-600/20 text-sky-400 font-semibold"
                                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            }`}
                          >
                            <span className="truncate">{sub.label}</span>
                            {sub.isLocked && (
                              <LockClosedIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {isCollapsed && !mobileOpen && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      {item.label}
                      {item.isLocked && " (Locked)"}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* SIDEBAR FOOTER */}
          <div className="p-3 border-t border-slate-800 space-y-1">
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronDoubleRightIcon className="h-5 w-5" />
              ) : (
                <div className="flex items-center space-x-2 w-full px-2">
                  <ChevronDoubleLeftIcon className="h-5 w-5 shrink-0" />
                  <span className="text-xs font-medium text-slate-400">
                    Collapse Navigation
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className={`w-full flex items-center p-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
                isCollapsed && !mobileOpen
                  ? "justify-center"
                  : "space-x-3 px-3"
              }`}
              title="Logout"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
              {(!isCollapsed || mobileOpen) && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
        >
          <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                aria-label="Open navigation menu"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                  {companyDisplayName || "Dashboard"}
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 capitalize">
                  {formattedRole}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle light and dark mode"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5 text-amber-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-slate-600" />
                )}
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <UserCircleIcon className="h-7 w-7 text-slate-400 dark:text-slate-500" />
                <span className="hidden md:inline-block text-sm font-medium text-slate-700 dark:text-slate-200">
                  User #{userId ? userId.slice(-4) : "Admin"}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200 relative">
            {isCurrentRouteLocked ? (
              <div className="flex items-center justify-center h-full min-h-[50vh] p-6">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 max-w-md w-full mx-auto">
                  <LockClosedIcon className="h-14 w-14 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Content Locked</h2>
                  <p className="text-slate-500 mt-2 mb-6 text-sm">
                    You need an active subscription to view this page. Upgrade your plan to unlock full access to this feature.
                  </p>
                  <button
                    onClick={() => setIsPricingModalOpen(true)}
                    className="w-full px-6 py-2.5 bg-sky-600 text-white font-medium rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/30"
                  >
                    View Plans
                  </button>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 9999px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </div>

      {/* Subscription Checkout Gateway Modal Overlay */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => {
          setIsPricingModalOpen(false);
          setIsCollapsed(false);
        }}
        companyId={selectedCompanyId || storeFormData?.id || null}
        email={session?.user?.email || ""}
        category={selectedCategory || storeFormData?.category || "Other"}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
    </>
  );
}