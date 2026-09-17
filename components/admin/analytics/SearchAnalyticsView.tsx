"use client";

import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  FunnelIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { SearchAnalyticsSummary } from "@/lib/search/searchAnalyticsService";

interface SearchAnalyticsViewProps {
  slug?: string;
  isGhubaPlatform?: boolean;
}

export default function SearchAnalyticsView({
  slug,
  isGhubaPlatform = false,
}: SearchAnalyticsViewProps) {
  const [data, setData] = useState<SearchAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const endpoint = isGhubaPlatform
          ? `/api/admin/ghuba/search-analytics?days=${days}`
          : `/api/admin/${slug}/search-analytics?days=${days}`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load search analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [slug, isGhubaPlatform, days]);

  return (
    <div className="space-y-8 p-6">
      {/* Header & Range Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            {isGhubaPlatform ? "Ghuba Search Demand Intelligence" : "Store Search Analytics"}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Monitor customer search trends, unmet inventory demand, and zero-result queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>Total Searches</span>
            <MagnifyingGlassIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? "..." : (data?.totalSearches ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400">Total customer queries submitted</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>Zero-Result Searches</span>
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
            {loading ? "..." : (data?.zeroResultSearches ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400">Searches that returned no inventory</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>Zero-Result Rate</span>
            <ArrowTrendingUpIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? "..." : `${data?.zeroResultRatePercent ?? 0}%`}
          </div>
          <p className="text-[11px] text-zinc-400">Ratio of queries without catalog matches</p>
        </div>
      </div>

      {/* Main Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Searches */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" />
              Most Popular Search Terms
            </h3>
            <span className="text-xs text-zinc-400">Top 15</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase">
                  <th className="pb-2.5">Term</th>
                  <th className="pb-2.5 text-center">Searches</th>
                  <th className="pb-2.5 text-right">Avg Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                {data?.topSearches && data.topSearches.length > 0 ? (
                  data.topSearches.map((s, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 font-bold text-zinc-800 dark:text-zinc-200">
                        "{s.query}"
                      </td>
                      <td className="py-2.5 text-center text-zinc-600 dark:text-zinc-400">
                        {s.count.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-bold text-amber-600 dark:text-amber-400">
                        {s.resultCountAvg}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-zinc-400">
                      No search queries recorded for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zero-Result Searches (Catalog Gaps) */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              Unmet Demand (Zero Results)
            </h3>
            <span className="text-xs text-zinc-400">Catalog Opportunity</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase">
                  <th className="pb-2.5">Missing Query</th>
                  <th className="pb-2.5 text-center">Attempts</th>
                  <th className="pb-2.5 text-right">Last Searched</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                {data?.zeroResultQueries && data.zeroResultQueries.length > 0 ? (
                  data.zeroResultQueries.map((z, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 font-bold text-red-600 dark:text-red-400">
                        "{z.query}"
                      </td>
                      <td className="py-2.5 text-center text-zinc-600 dark:text-zinc-400">
                        {z.count}
                      </td>
                      <td className="py-2.5 text-right text-zinc-400 text-[11px]">
                        {new Date(z.lastSearched).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-zinc-400">
                      No zero-result searches in this period. Great catalog coverage!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
