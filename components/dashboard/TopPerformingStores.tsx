"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrophyIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { TopStorePerformance } from "@/lib/dashboard/portfolioService";

interface TopPerformingStoresProps {
  stores: TopStorePerformance[];
  totalStoresCount: number;
  onMetricChange?: (metric: string) => void;
  selectedMetric?: string;
}

type RankingMetric = "revenue" | "orders" | "completedOrders" | "salesGrowth" | "aov";

const METRIC_OPTIONS: Array<{ key: RankingMetric; label: string }> = [
  { key: "revenue", label: "Revenue" },
  { key: "orders", label: "Order Volume" },
  { key: "completedOrders", label: "Completed Orders" },
  { key: "salesGrowth", label: "Sales Growth" },
  { key: "aov", label: "Average Order Value" },
];

export default function TopPerformingStores({
  stores,
  totalStoresCount,
  onMetricChange,
  selectedMetric = "revenue",
}: TopPerformingStoresProps) {
  const [activeMetric, setActiveMetric] = useState<RankingMetric>(
    (selectedMetric as RankingMetric) || "revenue",
  );

  const handleMetricSelect = (metric: RankingMetric) => {
    setActiveMetric(metric);
    if (onMetricChange) {
      onMetricChange(metric);
    }
  };

  // Sort locally if not handled by server
  const sortedStores = [...stores].sort((a, b) => {
    if (activeMetric === "orders") return b.orderCount - a.orderCount;
    if (activeMetric === "completedOrders") return b.completedOrders - a.completedOrders;
    if (activeMetric === "salesGrowth") return (b.growthRate || 0) - (a.growthRate || 0);
    if (activeMetric === "aov") return b.averageOrderValue - a.averageOrderValue;
    return b.revenue - a.revenue;
  });

  const getMetricDisplay = (store: TopStorePerformance) => {
    switch (activeMetric) {
      case "orders":
        return `${store.orderCount.toLocaleString()} orders`;
      case "completedOrders":
        return `${store.completedOrders.toLocaleString()} completed`;
      case "salesGrowth":
        return store.growthRate !== null
          ? `${store.growthRate > 0 ? "+" : ""}${store.growthRate}%`
          : "N/A";
      case "aov":
        return `${store.currency} ${store.averageOrderValue.toLocaleString()}`;
      case "revenue":
      default:
        return `${store.currency} ${store.revenue.toLocaleString()}`;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
              <TrophyIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Top Performing Stores
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ranked by verified transactional activity
              </p>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            {METRIC_OPTIONS.map((m) => (
              <button
                key={m.key}
                onClick={() => handleMetricSelect(m.key)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeMetric === m.key
                    ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stores List */}
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
          {sortedStores.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No store performance records found for this period.
            </div>
          ) : (
            sortedStores.map((store, index) => {
              const rank = index + 1;
              return (
                <div
                  key={store.id}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center ${
                        rank === 1
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                          : rank === 2
                          ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          : rank === 3
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {rank}
                    </span>

                    {/* Store Logo / Icon */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BuildingStorefrontIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    {/* Name & Category */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {store.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate">
                          {store.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        /{store.slug}
                      </p>
                    </div>
                  </div>

                  {/* Metric Value & Action */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {getMetricDisplay(store)}
                      </div>
                      {store.growthRate !== null && activeMetric !== "salesGrowth" && (
                        <div
                          className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                            store.growthRate > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : store.growthRate < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-slate-400"
                          }`}
                        >
                          <ArrowTrendingUpIcon className="w-2.5 h-2.5" />
                          <span>
                            {store.growthRate > 0 ? "+" : ""}
                            {store.growthRate}%
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/admin/${store.slug}`}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/30 transition-all"
                      title={`Open ${store.name} Dashboard`}
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
        <span className="text-slate-400">
          Showing top {sortedStores.length} of {totalStoresCount} stores
        </span>
        <Link
          href="/stores"
          className="font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
        >
          <span>View All Stores</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
