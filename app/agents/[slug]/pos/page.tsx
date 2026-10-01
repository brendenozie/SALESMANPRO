import React from "react";
import Link from "next/link";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import {
  CreditCardIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentPOSPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "pos");

  const posNameMap: Record<string, string> = {
    ecommerce: "StorePOS (Retail Checkout Engine)",
    automotive: "StorePOS (Auto Parts & Dealership Register)",
    services: "ServicePOS (Appointments & Service Delivery)",
    healthcare: "HealthPOS (Clinical & Pharmacy Register)",
    fitness: "FitnessPOS (Gym Check-in & Member Billing)",
    restaurant: "RestaurantPOS (Table & Dining Register)",
    education: "CompanyPOS (School Cash Office)",
  };

  const posEngineName = posNameMap[context.category] || "StorePOS Checkout Engine";
  const posTargetUrl = context.posRoute;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              {context.category.toUpperCase()} POS
            </span>
            <span className="text-xs text-slate-500">Terminal Ready</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Point of Sale Station
          </h1>
          <p className="text-sm text-slate-500">
            Authenticated physical checkout register for <strong>{context.company.name}</strong>.
          </p>
        </div>

        <Link
          href={posTargetUrl}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all transform active:scale-95"
        >
          <CreditCardIcon className="w-5 h-5" />
          <span>Launch Fullscreen POS</span>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* POS Session Attribution & Operator Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/25">
              <UserCircleIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Operator: {context.user.name}
              </h2>
              <p className="text-xs text-slate-500">
                Role: <span className="font-semibold text-slate-700 dark:text-slate-300">{context.role}</span> • {context.jobTitle}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
            <CheckBadgeIcon className="w-4 h-4" />
            Active Session
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-xs text-slate-400 font-medium block">Category Engine</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
              {posEngineName}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-xs text-slate-400 font-medium block">Assigned Currency</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
              {context.company.currency}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-xs text-slate-400 font-medium block">POS Destination</span>
            <span className="font-mono text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1 block truncate">
              {posTargetUrl}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold">Authoritative Shift Tracking Enabled</p>
            <p>
              All orders created in this register are immutably attributed to <strong>{context.user.name}</strong> under company <strong>{context.company.name}</strong>. Offline transaction queues will synchronize automatically once reconnected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
