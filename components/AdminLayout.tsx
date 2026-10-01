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
  ArrowRightIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { getCategoryMenus } from "@/constant/CATEGORY_MENUS";
import { useStoreContext } from "@/contexts/StoreContext";
import PricingSection from "@/app/stores/PricingSection";

const SalesmanProMascot = dynamic(
  () => import("@/components/ai/mascot/SalesmanProMascot").then((mod) => mod.SalesmanProMascot),
  { ssr: false }
);

// --- Types ---
export interface SubMenuItem {
  label: string;
  href?: string;
  minTier?: string;
  accessLevel?: string[];
  isLocked?: boolean;
  requiredTier?: string;
}

export interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  minTier?: string;
  accessLevel?: string[];
  subItems?: SubMenuItem[];
  isLocked?: boolean;
  requiredTier?: string;
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
  currentTier,
  requiredTier,
  featureName,
  onSubscriptionSuccess,
  isSubscriptionActive,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string | null;
  email: string;
  category: string;
  currentTier?: string;
  requiredTier: string;
  featureName: string;
  onSubscriptionSuccess: () => void;
  isSubscriptionActive: boolean;
}) => {
  return (
    <AnimatePresence>
      {isOpen && companyId && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 flex justify-center z-[100] p-3 sm:p-6 items-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-7xl border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 z-50 p-2.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all hover:scale-105"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
            <div className="overflow-y-auto h-full max-h-[calc(100vh-6rem)] rounded-3xl p-4 sm:p-6 custom-scrollbar relative z-10">
              <PricingSection
                companyId={companyId}
                email={email}
                category={category}
                currentTier={currentTier}
                requiredTier={requiredTier}
                featureName={featureName}
                onSubscriptionSuccess={onSubscriptionSuccess} 
                isSubscriptionActive={isSubscriptionActive}             
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
    case "HEADTEACHER":
    case "HEAD_TEACHER":
    case "PRINCIPAL":
    case "HEAD_OF_SCHOOL":
    case "SCHOOL_HEAD":
    case "EDUCATIONAL_ADMIN":
    case "EDUCATIONAL_LEADER":
    case "EDUCATIONAL_MANAGER":
    case "EDUCATIONAL_COORDINATOR":
    case "EDUCATIONAL_DIRECTOR":
    case "EDUCATIONAL_SUPERVISOR":
    case "EDUCATIONAL_ADMINISTRATOR":
    case "EDUCATIONAL_OFFICER":
      return (
        allCategoryMenus["School Head"] ??
        allCategoryMenus["Head Teacher"] ??
        allCategoryMenus["Educational & Online Courses"] ??
        allCategoryMenus.Principal ??
        allCategoryMenus.Teacher ??
        allCategoryMenus.Educator ??
        defaultFallbackMenu
      );
    case "TEACHER":
    case "LECTURER":
    case "TUTOR":
    case "EDUCATOR":
      if (isPrincipalCategory(categoryType)) {
        return (
          allCategoryMenus["School Head"] ??
          allCategoryMenus["Head Teacher"] ??
          allCategoryMenus.Principal ??
          allCategoryMenus.Teacher ??
          allCategoryMenus.Educator ??
          defaultFallbackMenu
        );
      }
      return (
        allCategoryMenus.Teacher ??
        allCategoryMenus.Educator ??
        allCategoryMenus.Tutor ??
        defaultFallbackMenu
      );
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

  // Pricing & Lock State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCurrentRouteLocked, setIsCurrentRouteLocked] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState<string | null>(null);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const shouldHideNav = useMemo(() => {
    const posRoutes = [
      "/pos",
      "/storepos",
      "/service-pos",
      "/fitness-pos",
      "/health-pos",
      "/company-pos",
      "/website-builder"
    ];
    return posRoutes.some((route) => pathname.endsWith(route));
  }, [pathname]);

  const handleSubscriptionSuccess = () => {
    setIsPricingModalOpen(false);
    setIsCollapsed(true);
    mutate(``);
  };

  const companyId: string = storeFormData?.id || "";
  const slug: string = storeFormData?.slug || "";
  const currentTier = storeFormData?.subscription?.plan?.name || "INACTIVE";
  const currentTierStatus = storeFormData?.subscription?.status || "INACTIVE";
  const isSubscriptionActive = currentTierStatus === "ACTIVE";

  const hasUnlimitedPass =
    isSubscriptionActive &&
    (currentTier === "Ghuba Free" || currentTier === "Ghuba Trial");

  const categoryType = useMemo(() => {
    const category =
      storeFormData?.name === "Ghuba"
        ? storeFormData?.name
        : storeFormData?.category;
    if (!category) return "Other";

    if (category.toLowerCase() === "automotive") {
      return capitalize(storeFormData?.variant || "Other");
    }
    return capitalize(category);
  }, [storeFormData?.category, storeFormData?.variant, storeFormData?.name]);

  const menus = useMemo(
    () => getCategoryMenus(slug, userRole, currentTier, isSubscriptionActive),
    [slug, userRole, currentTier, isSubscriptionActive]
  );

  const menuItems = useMemo(
    () => getMenuItemsFor(userRole, categoryType, menus),
    [userRole, categoryType, menus]
  );

  useEffect(() => {
    let locked = false;
    let requiredTier: string | null = null;

    const isMatch = (targetHref?: string) => {
      if (!targetHref) return false;
      if (pathname === targetHref) return true;
      return targetHref !== `/admin/${slug}` && pathname.startsWith(`${targetHref}/`);
    };

    for (const item of menuItems) {
      if (item.subItems?.length) {
        for (const sub of item.subItems) {
          if (isMatch(sub.href) && sub.isLocked) {
            locked = true;
            requiredTier =
              sub.requiredTier ||
              sub.minTier ||
              item.requiredTier ||
              item.minTier ||
              "Ghuba Basic";
            break;
          }
        }
      }
      if (locked) break;

      if (isMatch(item.href) && item.isLocked) {
        locked = true;
        requiredTier = item.requiredTier || item.minTier || "Ghuba Basic";
        break;
      }
    }

    setIsCurrentRouteLocked(locked);

    if (locked) {
      setRequiredPlan(requiredTier);
      setIsPricingModalOpen(true);
      setIsCollapsed(true);
    }
  }, [pathname, menuItems, slug]);

  useEffect(() => {
    for (const item of menuItems) {
      if (item.subItems?.some((sub) => sub.href && pathname.startsWith(sub.href))) {
        setOpenLabel(item.label);
        break;
      }
    }
  }, [pathname, menuItems]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const handleSignOut = () => {
    const returnTo = window.location.origin;
    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

  const openSubscriptionModal = () => {
    setSelectedCompanyId(companyId);
    setSelectedCategory(storeFormData?.category || "Other");
    setRequiredPlan(null);
    setIsPricingModalOpen(true);
  };

  const handleNavigation = (
    e: React.MouseEvent,
    item: MenuItem | SubMenuItem,
    parentItem?: MenuItem
  ) => {
    if (item.isLocked) {
      e.preventDefault();
      setIsCollapsed(true);

      const resolvedTier =
        item.requiredTier ||
        item.minTier ||
        parentItem?.requiredTier ||
        parentItem?.minTier ||
        "Ghuba Basic";

      setRequiredPlan(resolvedTier);
      setSelectedCompanyId(companyId);
      setSelectedCategory(storeFormData?.category || "Other");
      setIsPricingModalOpen(true);
    }
  };

  const renderTierBadge = () => {
    if (hasUnlimitedPass) {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={openSubscriptionModal}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300/50 dark:border-amber-500/20 shadow-sm transition-colors cursor-pointer"
        >
          <SparklesIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTier} (All Access)</span>
        </motion.button>
      );
    }

    if (isSubscriptionActive) {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={openSubscriptionModal}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300/50 dark:border-emerald-500/20 shadow-sm transition-colors cursor-pointer"
        >
          <CheckCircleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTier}</span>
        </motion.button>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={openSubscriptionModal}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300/50 dark:border-rose-500/20 shadow-sm transition-colors cursor-pointer"
      >
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Inactive / Expired</span>
      </motion.button>
    );
  };

  if (shouldHideNav) {
    return (
      <main className="w-screen h-screen overflow-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {children}
      </main>
    );
  }

  if (
    userRole === "JUNIOR" ||
    userRole === "SCHOOL_DRIVER" ||
    userRole === "STORE_DRIVER"
  ) {
    return (
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {children}
      </main>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900/60 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800/60 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] ${
            mobileOpen ? "translate-x-0 w-72" : "-translate-x-full"
          } lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center space-x-4 overflow-hidden">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="h-11 w-11 min-w-[44px] rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-sky-500/30 ring-2 ring-white dark:ring-slate-900"
              >
                {(formattedRole || "A").charAt(0).toUpperCase()}
              </motion.div>
              {(!isCollapsed || mobileOpen) && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col min-w-0"
                >
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate capitalize tracking-tight">
                    {formattedRole}
                  </span>
                  {companyDisplayName && (
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                      {companyDisplayName}
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 lg:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
            {menuItems.map((item, index) => {
              const isActiveParent = item.subItems
                ? item.subItems.some((sub) => sub.href && pathname.startsWith(sub.href))
                : item.href && pathname.startsWith(item.href);
              const isOpen = openLabel === item.label;

              if (!item.subItems?.length) {
                return (
                  <div key={`${item.label}-${item.href || index}`} className="relative group">
                    <Link
                      href={item.href || "#"}
                      onClick={(e) => handleNavigation(e, item)}
                      className={`flex items-center px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                        item.isLocked
                          ? "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          : isActiveParent
                          ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                      } ${isCollapsed && !mobileOpen ? "justify-center" : "space-x-3.5"}`}
                    >
                      {item.icon ? (
                        <item.icon className={`h-[22px] w-[22px] shrink-0 ${isActiveParent ? "stroke-[2.5]" : ""}`} />
                      ) : (
                        <BuildingStorefrontIcon className={`h-[22px] w-[22px] shrink-0 ${isActiveParent ? "stroke-[2.5]" : ""}`} />
                      )}
                      {(!isCollapsed || mobileOpen) && (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.isLocked && <LockClosedIcon className="h-4 w-4 shrink-0 opacity-50" />}
                        </>
                      )}
                    </Link>
                  </div>
                );
              }

              return (
                <div key={`${item.label}-${item.href || index}`} className="relative group">
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
                        setOpenLabel((prev) => (prev === item.label ? null : item.label));
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      item.isLocked
                        ? "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        : isActiveParent || isOpen
                        ? "bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                    } ${isCollapsed && !mobileOpen ? "justify-center" : ""}`}
                  >
                    <div className={`flex items-center ${isCollapsed && !mobileOpen ? "" : "space-x-3.5 truncate"}`}>
                      {item.icon ? (
                        <item.icon className="h-[22px] w-[22px] shrink-0" />
                      ) : (
                        <BuildingStorefrontIcon className="h-[22px] w-[22px] shrink-0" />
                      )}
                      {(!isCollapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                    </div>
                    {(!isCollapsed || mobileOpen) &&
                      (item.isLocked ? (
                        <LockClosedIcon className="h-4 w-4 shrink-0 opacity-50" />
                      ) : (
                        <ChevronDownIcon
                          className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out ${
                            isOpen ? "rotate-180 text-sky-500" : "text-slate-400"
                          }`}
                        />
                      ))}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (!isCollapsed || mobileOpen) && !item.isLocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 ml-5 pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-1.5 py-1">
                          {item.subItems.map((sub, subIndex) => {
                            const isActiveSub = sub.href ? pathname.startsWith(sub.href) : false;
                            return (
                              <Link
                                key={`${sub.label}-${sub.href || subIndex}`}
                                href={sub.href || "#"}
                                onClick={(e) => handleNavigation(e, sub, item)}
                                className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                                  sub.isLocked
                                    ? "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                    : isActiveSub
                                    ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold"
                                    : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                }`}
                              >
                                <span className="truncate">{sub.label}</span>
                                {sub.isLocked && <LockClosedIcon className="h-3.5 w-3.5 shrink-0 opacity-50" />}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden lg:flex w-full items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            >
              {isCollapsed ? (
                <ChevronDoubleRightIcon className="h-5 w-5" />
              ) : (
                <div className="flex items-center space-x-2 w-full px-2">
                  <ChevronDoubleLeftIcon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Collapse Navigation</span>
                </div>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className={`w-full flex items-center p-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ${
                isCollapsed && !mobileOpen ? "justify-center" : "space-x-3.5 px-4"
              }`}
            >
              <ArrowLeftOnRectangleIcon className="h-[22px] w-[22px] shrink-0" />
              {(!isCollapsed || mobileOpen) && <span className="text-sm font-bold">Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
          <header className="sticky top-0 z-30 flex items-center justify-between h-[72px] px-5 sm:px-8 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-colors duration-300">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              <div className="flex items-center space-x-4">
                <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight truncate">
                  {companyDisplayName || "Dashboard"}
                </h1>
                <div className="hidden sm:block">{renderTierBadge()}</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {isDarkMode ? (
                    <motion.div key="dark" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <SunIcon className="h-5 w-5 text-amber-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="light" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <MoonIcon className="h-5 w-5 text-slate-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-sky-500 transition-colors">
                  <UserCircleIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">
                    User #{userId ? userId.slice(-4) : "Admin"}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                    {userRole || "Account"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 relative">
            <AnimatePresence mode="wait">
              {isCurrentRouteLocked ? (
                <motion.div 
                  key="locked"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full min-h-[70vh] p-4 sm:p-8"
                >
                  <div className="text-center p-8 sm:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200/60 dark:border-slate-800/60 max-w-lg w-full mx-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-sky-500 to-indigo-500" />
                    
                    <div className="mx-auto w-20 h-20 bg-sky-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-100 dark:ring-slate-700 rotate-3">
                      <LockClosedIcon className="h-10 w-10 text-sky-500 -rotate-3" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                      Upgrade Required
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">
                      To access this feature, you'll need to upgrade your current plan to{" "}
                      <span className="font-bold text-slate-900 dark:text-white">{requiredPlan || "a higher tier"}</span>.
                    </p>

                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                      <div className="flex flex-col text-left z-10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Access</span>
                        <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                          {currentTier === "INACTIVE" ? "None" : currentTier}
                        </span>
                      </div>

                      <div className="z-10 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                        <ArrowRightIcon className="h-5 w-5 text-slate-400" />
                      </div>

                      <div className="flex flex-col text-right z-10">
                        <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-1.5">Required Plan</span>
                        <span className="text-base sm:text-lg font-bold text-sky-600 dark:text-sky-400">
                          {requiredPlan || "Pro Plan"}
                        </span>
                      </div>
                    </div>

                    {hasUnlimitedPass && (
                      <div className="flex items-start text-left space-x-3 text-xs text-amber-700 dark:text-amber-400 mb-8 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-500/20">
                        <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
                        <p className="leading-relaxed">You are on an active <strong>{currentTier}</strong> pass. If you're seeing this screen in error, please sync your store permissions or contact support.</p>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openSubscriptionModal}
                      className="w-full px-6 py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/25"
                    >
                      View Upgrade Options
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        companyId={selectedCompanyId}
        email={session?.user?.email || ""}
        category={selectedCategory}
        currentTier={currentTier}
        requiredTier={requiredPlan || ""}
        featureName={pathname}
        onSubscriptionSuccess={handleSubscriptionSuccess}
        isSubscriptionActive={isSubscriptionActive}
      />

      <SalesmanProMascot />
    </>
  );
}