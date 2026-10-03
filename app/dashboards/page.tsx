"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import {
  BuildingStorefrontIcon,
  PlusIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 space-y-8 animate-pulse">
      {/* Top Navbar Skeleton */}
      <div className="flex justify-between items-center h-14 bg-white/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-300 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800/60 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* 8 KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-32 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="w-16 h-5 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
          </div>
        ))}
      </div>

      {/* Trends & Distribution Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-80 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6" />
        <div className="lg:col-span-4 h-80 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6" />
      </div>
    </div>
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
    dedupingInterval: 30000, // 30s deduping
  });

  const handlePeriodChange = (
    newPeriod: ReportingPeriod,
    start?: string,
    end?: string,
  ) => {
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
      const refreshUrl = `/api/admin/dashboard/overview?${refreshParams.toString()}`;
      const refreshedData = await fetcher(refreshUrl);
      await mutate(refreshedData, false);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans selection:bg-orange-500/20 relative overflow-hidden transition-colors duration-300">
      {/* Structural Ambient Background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full blur-3xl opacity-40 dark:opacity-20" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl opacity-40 dark:opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 relative z-10">
        {/* --- TOP NAVBAR --- */}
        <nav className="flex justify-between items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={fit1.src}
              alt="SalesmanPro Logo"
              className="w-8 h-8 object-contain"
            />
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Salesman<span className="text-orange-600">Pro</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400">
                Portfolio BI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct view of My Stores */}
            <Link
              href="/stores"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              <BuildingStorefrontIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Store Manager</span>
            </Link>

            <button
              onClick={() => {
                const returnTo = window.location.origin;
                signOut({
                  redirect: true,
                  callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <span className="hidden md:inline">Sign Out</span>
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* --- WELCOME HEADER & PRIMARY ACTIONS --- */}
        <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Title & Overview Greeting */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Portfolio Operations Live
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                {greeting},{" "}
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {userName}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Aggregated business intelligence and operational oversight across{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {totalStores} {totalStores === 1 ? "store" : "stores"}
                </span>{" "}
                for the selected reporting window.
              </p>
            </div>

            {/* Quick Actions & Reporting Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Period Selector with Refresh */}
              <PeriodSelector
                currentPeriod={period}
                onPeriodChange={handlePeriodChange}
                lastUpdated={dashboardData?.metadata.lastUpdated}
                isRefreshing={isRefreshing}
                onRefresh={handleManualRefresh}
              />

              {/* View My Stores (Preserves Existing Stores Page) */}
              <Link
                href="/stores"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <BuildingStorefrontIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 stroke-[2]" />
                <span>View My Stores</span>
              </Link>

              {/* Launch New Store (Preserves Existing Store Creation) */}
              <Link
                href="/stores/create"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-md shadow-orange-600/15 active:scale-[0.99] transition-all"
              >
                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Launch New Store</span>
              </Link>
            </div>
          </div>

          {/* Currency Distribution Pill (if multiple currencies exist) */}
          {dashboardData?.currencyBreakdown && dashboardData.currencyBreakdown.length > 1 && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Currency Volume:
              </span>
              {dashboardData.currencyBreakdown.map((cb) => (
                <div
                  key={cb.currency}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>{cb.currency}:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {cb.sales.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({cb.storeCount} stores)
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Error Notification (if any) */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-center gap-3 text-sm font-semibold">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>Failed to sync recent data: {error.message}. Showing cached state.</span>
          </div>
        )}

        {/* --- EMPTY PORTFOLIO ONBOARDING STATE --- */}
        {totalStores === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
              <BuildingStorefrontIcon className="w-8 h-8 stroke-[2]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No Stores In Your Portfolio Yet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Launch your first e-commerce store, service business, or digital storefront to start monitoring portfolio performance, sales trajectories, and fulfillment operations.
            </p>
            <div className="pt-2">
              <Link
                href="/stores/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-600/20 hover:from-orange-500 hover:to-amber-400 transition-all"
              >
                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Launch Your First Store</span>
              </Link>
            </div>
          </div>
        )}

        {/* --- CORE SECTIONS (Rendered when stores exist) --- */}
        {kpis && totalStores > 0 && (
          <>
            {/* 1. Portfolio KPI Cards Row */}
            <section aria-label="Portfolio Key Performance Indicators">
              <PortfolioKPISection kpis={kpis} periodLabel={periodLabel} />
            </section>

            {/* 2. Interactive Trends & Fulfillment Flow */}
            <section aria-label="Portfolio Trends & Fulfillment">
              <PortfolioTrendsChart
                timeline={dashboardData.performanceTrends.timeline}
                orderStatusBreakdown={
                  dashboardData.performanceTrends.orderStatusBreakdown
                }
                currency={currency}
                periodLabel={periodLabel}
              />
            </section>

            {/* 3. Top Performing Stores & Live Activity Stream */}
            <section
              aria-label="Store Rankings and Live Activity"
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-7">
                <TopPerformingStores
                  stores={dashboardData.topPerformingStores}
                  totalStoresCount={totalStores}
                  selectedMetric={rankingMetric}
                  onMetricChange={setRankingMetric}
                />
              </div>

              <div className="lg:col-span-5">
                <RecentActivityFeed
                  activities={dashboardData.recentActivity}
                  totalStoresCount={totalStores}
                />
              </div>
            </section>

            {/* 4. Store Health & Operational Alerts */}
            <section aria-label="Store Health and Operational Alerts">
              <OperationalAlertsSection
                alerts={dashboardData.operationalAlerts}
              />
            </section>
          </>
        )}

        {/* --- SYSTEM FOOTER --- */}
        <footer className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              SalesmanPro Operations Hub
            </span>
            <span>•</span>
            <span>Multi-Tenant Node</span>
          </div>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Redis Cache: Singleflight Active
            </span>
            <Link
              href="/stores"
              className="hover:text-orange-500 transition-colors"
            >
              Store Manager
            </Link>
            <Link
              href="/stores/create"
              className="hover:text-orange-500 transition-colors"
            >
              New Store
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}