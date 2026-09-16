"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  HeartIcon,
  ArrowPathIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsSummary {
  totalImpressions: number;
  totalViews: number;
  totalClicks: number;
  totalLikes: number;
  totalWishlists: number;
  totalComments: number;
  totalShares: number;
  totalCartAdds: number;
  totalCheckoutStarts: number;
  totalOrders: number;
  totalPaidOrders: number;
  totalRevenue: number;
  ctr: number;
  orderConversionRate: number;
}

interface FunnelStep {
  stage: string;
  count: number;
  rate: number;
}

interface TimelinePoint {
  date: string;
  impressions: number;
  views: number;
  clicks: number;
  cartAdds: number;
  orders: number;
  revenue: number;
}

interface TopProduct {
  listingId: string;
  title: string;
  image: string;
  price: number;
  impressions: number;
  views: number;
  clicks: number;
  wishlists: number;
  cartAdds: number;
  orders: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
}

interface AnalyticsPayload {
  summary: AnalyticsSummary;
  funnel: FunnelStep[];
  timeline: TimelinePoint[];
  channels: Record<string, { impressions: number; views: number; clicks: number; orders: number; revenue: number }>;
  topProducts: TopProduct[];
}

interface AnalyticsClientProps {
  slug: string;
  storeName?: string;
}

export default function AnalyticsClient({ slug, storeName }: AnalyticsClientProps) {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number>(30);
  const [channel, setChannel] = useState<string>("ALL");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/${slug}/analytics?days=${days}&channel=${channel}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error("Invalid analytics response");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load store analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchAnalytics();
    }
  }, [slug, days, channel]);

  const summary = data?.summary;
  const funnel = data?.funnel || [];
  const timeline = data?.timeline || [];
  const channels = data?.channels || {};
  const topProducts = data?.topProducts || [];

  // Max views in timeline for chart scaling
  const maxViews = useMemo(() => {
    if (!timeline.length) return 1;
    return Math.max(...timeline.map((t) => t.views), 1);
  }, [timeline]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-16 transition-colors">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Product & Store Analytics
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {storeName ? `${storeName} · ` : ""}Audience telemetry, funnel dropoffs, and conversion performance
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Days Filter */}
            <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    days === d
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>

            {/* Channel Filter */}
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Channels</option>
              <option value="STORE">Direct Storefront</option>
              <option value="GHUBA">Ghuba Marketplace</option>
              <option value="REELS">Reels / Feed</option>
              <option value="WHATSAPP">WhatsApp Direct</option>
              <option value="POS">Point of Sale</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition disabled:opacity-50"
              title="Refresh Data"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchAnalytics}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Impressions
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <EyeIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : (summary?.totalImpressions ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Viewport exposure dwell &gt; 1s
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Clicks & Views
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <CursorArrowRaysIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : (summary?.totalViews ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {loading ? "..." : `${summary?.ctr || 0}% CTR`}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cart & Wishlist
              </span>
              <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 dark:text-pink-400">
                <HeartIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {loading
                ? "..."
                : `${(summary?.totalCartAdds ?? 0).toLocaleString()} / ${(summary?.totalWishlists ?? 0).toLocaleString()}`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cart adds vs Wishlists
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Revenue & Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CurrencyDollarIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : `$${(summary?.totalRevenue ?? 0).toLocaleString()}`}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {loading
                ? "..."
                : `${summary?.totalPaidOrders ?? 0} paid (${summary?.orderConversionRate || 0}% conv.)`}
            </p>
          </div>
        </div>

        {/* Funnel & Channels Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Conversion Funnel */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Conversion Funnel
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-400">Full Pipeline Dropoff</span>
            </div>

            <div className="space-y-4">
              {funnel.map((step, idx) => {
                const percentage =
                  funnel[0]?.count > 0 ? (step.count / funnel[0].count) * 100 : 0;
                return (
                  <div key={step.stage} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{step.stage}</span>
                      <span>
                        {step.count.toLocaleString()} ({step.rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? "bg-indigo-500"
                            : idx === 1
                            ? "bg-blue-500"
                            : idx === 2
                            ? "bg-amber-500"
                            : idx === 3
                            ? "bg-purple-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(percentage, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Attribution */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BuildingStorefrontIcon className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Channel Attribution
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-400">Traffic Sources</span>
            </div>

            <div className="space-y-3">
              {Object.entries(channels).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No channel traffic recorded for this period yet.
                </p>
              ) : (
                Object.entries(channels).map(([chName, stats]) => (
                  <div
                    key={chName}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        {chName === "GHUBA" ? (
                          <GlobeAltIcon className="w-4 h-4" />
                        ) : chName === "WHATSAPP" ? (
                          <DevicePhoneMobileIcon className="w-4 h-4" />
                        ) : (
                          <BuildingStorefrontIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {chName === "GHUBA"
                            ? "Ghuba Marketplace"
                            : chName === "STORE"
                            ? "Direct Storefront"
                            : chName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {stats.views.toLocaleString()} views · {stats.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        ${stats.revenue.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-500 font-semibold">
                        {stats.views > 0
                          ? `${((stats.orders / stats.views) * 100).toFixed(1)}% conv.`
                          : "0%"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Daily Product Views & Orders
            </h2>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Views
              </span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Paid Orders
              </span>
            </div>
          </div>

          {timeline.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No daily telemetry points recorded yet for this filter.
            </div>
          ) : (
            <div className="h-48 flex items-end gap-2 pt-6 overflow-x-auto">
              {timeline.map((point) => {
                const heightPercent = Math.max((point.views / maxViews) * 100, 4);
                return (
                  <div
                    key={point.date}
                    className="flex-1 min-w-[28px] flex flex-col items-center gap-2 group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-14 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        <span className="font-bold">{point.date}</span>
                        <br />
                        Views: {point.views} | Orders: {point.orders} | ${point.revenue}
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-36 rounded-lg flex items-end justify-center p-1">
                      <div
                        className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-md transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 truncate max-w-full">
                      {point.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performing Listings Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Top Products by Engagement
            </h2>
            <span className="text-xs text-slate-400">Sorted by audience interactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="p-4">Product</th>
                  <th className="p-4">Impressions</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Clicks (CTR)</th>
                  <th className="p-4">Wishlists</th>
                  <th className="p-4">Cart Adds</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No interaction metrics recorded for products yet.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p) => (
                    <tr
                      key={p.listingId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                            <Image
                              src={p.image}
                              alt={p.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {p.title}
                            </p>
                            <p className="text-[11px] text-slate-400">${p.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {p.impressions.toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {p.views.toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {p.clicks.toLocaleString()} ({p.ctr}%)
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {p.wishlists}
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {p.cartAdds}
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {p.orders} ({p.conversionRate}%)
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        ${p.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
