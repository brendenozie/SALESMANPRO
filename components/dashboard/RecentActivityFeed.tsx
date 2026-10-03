"use client";

import React from "react";
import Link from "next/link";
import {
  BoltIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { RecentPortfolioActivity } from "@/lib/dashboard/portfolioService";

interface RecentActivityFeedProps {
  activities: RecentPortfolioActivity[];
  totalStoresCount: number;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  } catch {
    return "Recently";
  }
}

export default function RecentActivityFeed({
  activities,
  totalStoresCount,
}: RecentActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Portfolio Activity Stream
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live transactional pulse across authorized stores
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {activities.length} recent events
          </span>
        </div>

        {/* Feed List */}
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
          {activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent commercial activity recorded.
            </div>
          ) : (
            activities.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
                    {item.type === "ORDER" ? (
                      <ShoppingBagIcon className="w-4 h-4" />
                    ) : item.type === "TRANSACTION" ? (
                      <CreditCardIcon className="w-4 h-4" />
                    ) : (
                      <BuildingStorefrontIcon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <Link
                        href={`/admin/${item.storeSlug}`}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 truncate transition-colors"
                      >
                        {item.storeName}
                      </Link>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  {item.amount !== undefined && (
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {item.currency} {item.amount.toLocaleString()}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
        <span className="text-slate-400">Auto-updating portfolio stream</span>
        <Link
          href="/orders"
          className="font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
        >
          <span>View All Orders</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
