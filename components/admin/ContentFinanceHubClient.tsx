"use client";

import React, { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  UsersIcon,
  ChartPieIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface ContentFinanceSummary {
  totalRevenue: number;
  blogRevenue: number;
  podcastRevenue: number;
  totalUnlocks: number;
  blogUnlocks: number;
  podcastUnlocks: number;
  payingConsumersCount: number;
  arpu: number;
  currency: string;
}

interface TopContentItem {
  contentId: string;
  contentType: string;
  title: string;
  unlocks: number;
  revenue: number;
  price: number;
}

interface ContentPurchaseItem {
  id: string;
  contentType: string;
  contentId: string;
  title: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

interface ContentFinanceHubProps {
  companySlug: string;
  companyName: string;
  currency: string;
}

export default function ContentFinanceHubClient({
  companySlug,
  companyName,
  currency: initialCurrency,
}: ContentFinanceHubProps) {
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ContentFinanceSummary | null>(null);
  const [topContent, setTopContent] = useState<TopContentItem[]>([]);
  const [purchases, setPurchases] = useState<ContentPurchaseItem[]>([]);

  const fetchFinance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/${companySlug}/content-finance?days=${days}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setSummary(json.data.summary);
        setTopContent(json.data.topContent || []);
        setPurchases(json.data.recentPurchases || []);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load content finance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companySlug) {
      fetchFinance();
    }
  }, [companySlug, days]);

  const currency = summary?.currency || initialCurrency || "KES";
  const blogPercent =
    summary && summary.totalRevenue > 0
      ? Math.round((summary.blogRevenue / summary.totalRevenue) * 100)
      : 0;
  const podcastPercent =
    summary && summary.totalRevenue > 0
      ? Math.round((summary.podcastRevenue / summary.totalRevenue) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Content Store Monetization
              </span>
              <span className="text-xs text-slate-400 font-mono">• {companyName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Digital Publishing & Royalties Finance
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Timeframe Filter */}
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              {[7, 30, 90, 365].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    days === d
                      ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {d === 365 ? "1 Year" : `${d}D`}
                </button>
              ))}
            </div>

            <button
              onClick={fetchFinance}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              title="Refresh"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Primary KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Content Revenue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Content Revenue
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <CurrencyDollarIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {currency} {(summary?.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              From {summary?.totalUnlocks || 0} total paid unlocks
            </p>
          </div>

          {/* Article Paywall Revenue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Article Paywalls
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {currency} {(summary?.blogRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {summary?.blogUnlocks || 0} readers unlocked ({blogPercent}% of total)
            </p>
          </div>

          {/* Podcast Paywall Revenue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Podcast Passes
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <MusicalNoteIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {currency} {(summary?.podcastRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {summary?.podcastUnlocks || 0} audio passes ({podcastPercent}% of total)
            </p>
          </div>

          {/* ARPU & Paying Audience */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                ARPU (Avg / Consumer)
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {currency} {(summary?.arpu || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Across {summary?.payingConsumersCount || 0} active paid users
            </p>
          </div>
        </div>

        {/* Revenue Distribution Visualizer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <ChartPieIcon className="w-4 h-4 text-amber-500" /> Revenue Split: Articles vs Podcasts
          </h2>

          <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${blogPercent}%` }}
              className="bg-indigo-500 h-full transition-all duration-500"
              title={`Articles: ${blogPercent}%`}
            />
            <div
              style={{ width: `${podcastPercent}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Podcasts: ${podcastPercent}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono mt-3 text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Articles: {currency} {(summary?.blogRevenue || 0).toLocaleString()} ({blogPercent}%)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Podcasts: {currency} {(summary?.podcastRevenue || 0).toLocaleString()} ({podcastPercent}%)
            </span>
          </div>
        </div>

        {/* Top Performing Monetized Content Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Top Monetized Content Leaderboard
            </h2>
            <span className="text-xs text-slate-400">Ranked by paywall yield</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="p-4">Rank</th>
                  <th className="p-4">Content Item</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Unlocks</th>
                  <th className="p-4 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {topContent.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No content paywall unlocks recorded yet for this period.
                    </td>
                  </tr>
                ) : (
                  topContent.map((c, i) => (
                    <tr key={`${c.contentType}_${c.contentId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono font-bold text-slate-400">#{i + 1}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white line-clamp-1">
                        {c.title}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            c.contentType === "BLOG"
                              ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}
                        >
                          {c.contentType}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                        {currency} {c.price.toFixed(2)}
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {c.unlocks}
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        {currency} {c.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Content Transactions Ledger */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Live Content Purchases Ledger
            </h2>
            <span className="text-xs text-slate-400">Recent customer transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Content</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No purchases logged for this duration.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-[10px] text-slate-400">
                        {p.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white line-clamp-1">
                        {p.title}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {p.contentType}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                        {p.paymentMethod}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          <CheckCircleIcon className="w-3.5 h-3.5" /> COMPLETED
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white font-mono">
                        {p.currency} {p.amount.toLocaleString()}
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
