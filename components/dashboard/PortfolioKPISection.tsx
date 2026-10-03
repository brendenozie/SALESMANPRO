"use client";

import React, { useState } from "react";
import {
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  UserGroupIcon,
  ClockIcon,
  SignalIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { PortfolioKPIs } from "@/lib/dashboard/portfolioService";

interface PortfolioKPISectionProps {
  kpis: PortfolioKPIs;
  periodLabel: string;
}

interface KPICardProps {
  label: string;
  value: string | number;
  subtext?: string;
  changePercent?: number;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  iconBg: string;
  tooltip: string;
  extraBadge?: string;
}

function KPICard({
  label,
  value,
  subtext,
  changePercent,
  trend,
  icon,
  iconBg,
  tooltip,
  extraBadge,
}: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isPositive = changePercent !== undefined && changePercent > 0;
  const isNegative = changePercent !== undefined && changePercent < 0;

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {label}
              </span>
              <div
                className="relative inline-block cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-950 text-white text-[11px] rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed border border-slate-800">
                    {tooltip}
                  </div>
                )}
              </div>
            </div>
            {extraBadge && (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                {extraBadge}
              </span>
            )}
          </div>
        </div>

        {/* Change Indicator */}
        {changePercent !== undefined && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isPositive
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40"
                : isNegative
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
            title="Compared to previous equivalent period"
          >
            {isPositive && <ArrowTrendingUpIcon className="w-3 h-3 stroke-[2.5]" />}
            {isNegative && <ArrowTrendingDownIcon className="w-3 h-3 stroke-[2.5]" />}
            {!isPositive && !isNegative && <MinusIcon className="w-3 h-3 stroke-[2.5]" />}
            <span>
              {isPositive ? "+" : ""}
              {changePercent}%
            </span>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mt-1">
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

function formatCurrency(amount: number, currency: string = "KES"): string {
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `${currency} ${(amount / 1_000).toFixed(1)}k`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export default function PortfolioKPISection({
  kpis,
  periodLabel,
}: PortfolioKPISectionProps) {
  const currency = kpis.totalSales.currency || "KES";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Stores */}
      <KPICard
        label="Total Stores"
        value={kpis.totalStores.total}
        subtext={`${kpis.totalStores.active} active • ${kpis.totalStores.inactive} inactive • ${kpis.totalStores.pendingSetup} setup pending`}
        icon={<BuildingStorefrontIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 stroke-[2]" />}
        iconBg="bg-blue-50 dark:bg-blue-950/40"
        tooltip="Total stores you are authorized to administer, segmented by active subscription and profile completion status."
      />

      {/* 2. Total Sales */}
      <KPICard
        label="Total Sales"
        value={formatCurrency(kpis.totalSales.value, currency)}
        subtext={`Prev ${periodLabel.toLowerCase()}: ${formatCurrency(kpis.totalSales.previousValue, currency)}`}
        changePercent={kpis.totalSales.changePercent}
        trend={kpis.totalSales.trend}
        icon={<CurrencyDollarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2]" />}
        iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        tooltip="Gross merchandise order value recorded across all authorized stores for non-cancelled orders in this period."
      />

      {/* 3. Total Orders */}
      <KPICard
        label="Total Orders"
        value={kpis.totalOrders.value.toLocaleString()}
        subtext={`Prev: ${kpis.totalOrders.previousValue.toLocaleString()} orders`}
        changePercent={kpis.totalOrders.changePercent}
        trend={kpis.totalOrders.trend}
        icon={<ShoppingBagIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 stroke-[2]" />}
        iconBg="bg-indigo-50 dark:bg-indigo-950/40"
        tooltip="Total consumer orders placed across all store storefronts during this period."
      />

      {/* 4. Completed Orders */}
      <KPICard
        label="Completed Orders"
        value={kpis.completedOrders.value.toLocaleString()}
        subtext={`${kpis.completedOrders.completionRate}% fulfillment rate (${kpis.completedOrders.value}/${kpis.totalOrders.value})`}
        changePercent={kpis.completedOrders.changePercent}
        trend={kpis.completedOrders.trend}
        icon={<CheckBadgeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 stroke-[2]" />}
        iconBg="bg-teal-50 dark:bg-teal-950/40"
        tooltip="Orders successfully fulfilled and marked as COMPLETED or PAID during the selected period."
      />

      {/* 5. Total Revenue */}
      <KPICard
        label="Total Revenue"
        value={formatCurrency(kpis.totalRevenue.value, currency)}
        subtext={`Net: ${formatCurrency(kpis.totalRevenue.netCollected, currency)} (Fees: ${formatCurrency(kpis.totalRevenue.feeAmount, currency)})`}
        changePercent={kpis.totalRevenue.changePercent}
        trend={kpis.totalRevenue.trend}
        icon={<BanknotesIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 stroke-[2]" />}
        iconBg="bg-amber-50 dark:bg-amber-950/40"
        tooltip="Verified collected cash from completed payment transactions (M-Pesa, Card, Stripe, Paystack) without double-counting."
      />

      {/* 6. Total Customers */}
      <KPICard
        label="Total Customers"
        value={kpis.totalCustomers.periodUnique.toLocaleString()}
        subtext={`Lifetime unique profiles: ${kpis.totalCustomers.lifetimeTotal.toLocaleString()}`}
        changePercent={kpis.totalCustomers.changePercent}
        trend={kpis.totalCustomers.trend}
        icon={<UserGroupIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 stroke-[2]" />}
        iconBg="bg-purple-50 dark:bg-purple-950/40"
        tooltip="Distinct customer accounts registered or transacting across your store portfolio during this period."
      />

      {/* 7. Outstanding Payments */}
      <KPICard
        label="Outstanding Unpaid"
        value={formatCurrency(kpis.outstandingPayments.value, currency)}
        subtext={`${kpis.outstandingPayments.count} order(s) awaiting payment completion`}
        icon={<ClockIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 stroke-[2]" />}
        iconBg="bg-rose-50 dark:bg-rose-950/40"
        tooltip="Verified unpaid orders in PENDING or INITIATED payment status awaiting settlement."
      />

      {/* 8. Active Stores */}
      <KPICard
        label="Active Stores"
        value={`${kpis.activeStores.count} / ${kpis.activeStores.totalStores}`}
        subtext={`${kpis.activeStores.percentage}% recording business activity`}
        icon={<SignalIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 stroke-[2]" />}
        iconBg="bg-orange-50 dark:bg-orange-950/40"
        tooltip="Percentage and count of your authorized stores that recorded at least one customer order or payment in this period."
      />
    </div>
  );
}
