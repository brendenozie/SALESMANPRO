"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  BuildingStorefrontIcon,
  PlusIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ArrowLeftOnRectangleIcon,
  ExclamationCircleIcon,
  ServerStackIcon
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

import fit1 from "@/assets/fit1.png";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import PortfolioKPISection from "@/components/dashboard/PortfolioKPISection";
import PortfolioTrendsChart from "@/components/dashboard/PortfolioTrendsChart";
import TopPerformingStores from "@/components/dashboard/TopPerformingStores";
import OperationalAlertsSection from "@/components/dashboard/OperationalAlertsSection";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import { ReportingPeriod } from "@/lib/dashboard/dateRangeHelper";
import { PortfolioDashboardData } from "@/lib/dashboard/portfolioService";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to load portfolio overview");
  }
  const json = await res.json();
  return json.data;
};

// ------------------------------------------------------------------
// --- 1. SKELETON SCREEN LOADER ---
// ------------------------------------------------------------------
function DashboardSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 space-y-8"
    >
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* Top Navbar Skeleton */}
        <div className="flex justify-between items-center h-16 bg-white/40 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
          <div className="space-y-3">
            <div className="h-10 w-72 bg-slate-300 dark:bg-slate-800 rounded-xl" />
            <div className="h-5 w-96 bg-slate-200 dark:bg-slate-800/60 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>

        {/* 8 KPI Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 space-y-4"
            >
              <div className="flex justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="w-20 h-6 rounded-full bg-slate-100 dark:bg-slate-800/80" />
              </div>
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ------------------------------------------------------------------
// --- 2. MAIN ADMIN DASHBOARD ---
// ------------------------------------------------------------------
export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const [greeting, setGreeting] = useState("Good Day");
  const [period, setPeriod] = useState<ReportingPeriod>("last7days");
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});
  const [rankingMetric, setRankingMetric] = useState("revenue");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Authentication Redirect
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") {
      const callbackUrl = `${window.location.origin}${pathname}`;
      const authUrl = new URL("https://auth.salesmanpro.site/signin");
      authUrl.searchParams.set("callbackUrl", callbackUrl);
      window.location.href = authUrl.toString();
    }
    return null;
  }

  // Greeting by local time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const userName = session?.user?.name?.split(" ")[0] || "Administrator";

  // Build SWR Query URL
  const queryParams = new URLSearchParams();
  queryParams.set("period", period);
  if (period === "custom" && customRange.start && customRange.end) {
    queryParams.set("startDate", customRange.start);
    queryParams.set("endDate", customRange.end);
  }
  queryParams.set("rankingMetric", rankingMetric);

  const endpointUrl = session?.user?.id
    ? `/api/admin/dashboard/overview?${queryParams.toString()}`
    : null;

  const {
    data: dashboardData,
    error,
    isLoading,
    mutate,
  } = useSWR<PortfolioDashboardData>(endpointUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 30000,
  });

  const handlePeriodChange = (newPeriod: ReportingPeriod, start?: string, end?: string) => {
    setPeriod(newPeriod);
    if (newPeriod === "custom" && start && end) {
      setCustomRange({ start, end });
    } else {
      setCustomRange({});
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshParams = new URLSearchParams(queryParams);
      refreshParams.set("refresh", "true");
      await mutate(await fetcher(`/api/admin/dashboard/overview?${refreshParams.toString()}`), false);
    } catch (e) {
      console.error("Refresh error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (status === "loading" || (isLoading && !dashboardData)) {
    return <DashboardSkeleton />;
  }

  const kpis = dashboardData?.kpis;
  const totalStores = kpis?.totalStores.total || 0;
  const currency = dashboardData?.primaryCurrency || "KES";
  const periodLabel = dashboardData?.metadata.periodLabel || "Last 7 Days";

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans selection:bg-orange-500/30 relative overflow-hidden transition-colors duration-500">
      {/* Structural Ambient Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-tr from-orange-500/20 via-amber-400/10 to-transparent rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-[100px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12 pt-6 space-y-8 relative z-10">
        
        {/* --- FLOATING TOP NAVBAR --- */}
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-6 z-50 flex justify-between items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/40 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <img src={fit1.src} alt="SalesmanPro Logo" className="w-6 h-6 object-contain drop-shadow-sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Salesman<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Pro</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                Portfolio BI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/stores"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
            >
              <BuildingStorefrontIcon className="w-4 h-4 text-blue-500" />
              <span>Store Manager</span>
            </Link>

            <button
              onClick={() => {
                const returnTo = window.location.origin;
                signOut({ redirect: true, callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}` });
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all active:scale-95 group"
            >
              <span className="hidden md:inline">Sign Out</span>
              <ArrowLeftOnRectangleIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.nav>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          {/* --- WELCOME HEADER & ACTIONS --- */}
          <motion.section variants={itemVariants} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/50 dark:border-slate-800/80 rounded-[2rem] p-8 sm:p-10 shadow-lg shadow-slate-200/30 dark:shadow-none">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Operations Live
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  {greeting},{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400">
                    {userName}
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Aggregated business intelligence and operational oversight across{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    {totalStores} {totalStores === 1 ? "store" : "stores"}
                  </span>{" "}
                  for the selected reporting window.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <PeriodSelector
                  currentPeriod={period}
                  onPeriodChange={handlePeriodChange}
                  lastUpdated={dashboardData?.metadata.lastUpdated}
                  isRefreshing={isRefreshing}
                  onRefresh={handleManualRefresh}
                />
                
                <Link
                  href="/stores/create"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-95 transition-all"
                >
                  <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                  <span>New Store</span>
                </Link>

                <div className="flex items-center gap-2 border-l pl-3 ml-1 border-slate-200 dark:border-slate-700">
                  <a
                    href="/download-desktop/SalesmanProDesktop.application"
                    className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 group tooltip-trigger"
                    title="Download Windows App"
                  >
                    <ComputerDesktopIcon className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
                  </a>
                  <a
                    href="/download-mobile/app-release.apk"
                    className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 group tooltip-trigger"
                    title="Download Android APK"
                  >
                    <DevicePhoneMobileIcon className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
                  </a>
                </div>
              </div>
            </div>

            {dashboardData?.currencyBreakdown && dashboardData.currencyBreakdown.length > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                  <ServerStackIcon className="w-4 h-4" /> Currency Volume:
                </span>
                {dashboardData.currencyBreakdown.map((cb) => (
                  <div key={cb.currency} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 font-semibold text-slate-700 dark:text-slate-300 text-xs shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                    <span>{cb.currency}:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {cb.sales.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">({cb.storeCount})</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.section>

          {/* Error Notification */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-center gap-4 text-sm font-semibold backdrop-blur-sm shadow-sm"
              >
                <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0 animate-pulse" />
                <span>Failed to sync recent data: {error.message}. Showing cached state.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- EMPTY PORTFOLIO STATE --- */}
          {totalStores === 0 && (
            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800/80 rounded-[2rem] p-16 text-center max-w-2xl mx-auto shadow-2xl shadow-slate-200/40 dark:shadow-none space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-500/20 dark:to-amber-500/5 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-inner">
                  <SparklesIcon className="w-12 h-12" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  No Stores In Your Portfolio Yet
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                  Launch your first e-commerce store, service business, or digital storefront to start monitoring performance and fulfillment operations.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/stores/create"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-base shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                  <span>Launch Your First Store</span>
                </Link>
              </div>
            </motion.div>
          )}

          {/* --- CORE SECTIONS --- */}
          {kpis && totalStores > 0 && (
            <div className="space-y-8">
              <motion.section variants={itemVariants} aria-label="Portfolio Key Performance Indicators">
                <PortfolioKPISection kpis={kpis} periodLabel={periodLabel} />
              </motion.section>

              <motion.section variants={itemVariants} aria-label="Portfolio Trends & Fulfillment">
                <PortfolioTrendsChart
                  timeline={dashboardData.performanceTrends.timeline}
                  orderStatusBreakdown={dashboardData.performanceTrends.orderStatusBreakdown}
                  currency={currency}
                  periodLabel={periodLabel}
                />
              </motion.section>

              <motion.section variants={itemVariants} aria-label="Store Rankings and Live Activity" className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-7">
                  <TopPerformingStores
                    stores={dashboardData.topPerformingStores}
                    totalStoresCount={totalStores}
                    selectedMetric={rankingMetric}
                    onMetricChange={setRankingMetric}
                  />
                </div>
                <div className="xl:col-span-5">
                  <RecentActivityFeed activities={dashboardData.recentActivity} totalStoresCount={totalStores} />
                </div>
              </motion.section>

              <motion.section variants={itemVariants} aria-label="Store Health and Operational Alerts">
                <OperationalAlertsSection alerts={dashboardData.operationalAlerts} />
              </motion.section>
            </div>
          )}

          {/* --- SYSTEM FOOTER --- */}
          <motion.footer variants={itemVariants} className="pt-8 pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-slate-500 dark:text-slate-400 tracking-wide">
                SalesmanPro Operations Hub
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="tracking-wide">Multi-Tenant Node</span>
            </div>
            <div className="flex items-center gap-6 font-medium">
              <span className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                Redis Cache Active
              </span>
              <Link href="/stores" className="hover:text-orange-500 transition-colors">Store Manager</Link>
              <Link href="/stores/create" className="hover:text-orange-500 transition-colors">New Store</Link>
            </div>
          </motion.footer>

        </motion.div>
      </div>
    </div>
  );
}