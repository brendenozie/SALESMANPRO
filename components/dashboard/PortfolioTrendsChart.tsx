"use client";

import React, { useState } from "react";
import {
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { TrendDataPoint } from "@/lib/dashboard/portfolioService";

interface PortfolioTrendsChartProps {
  timeline: TrendDataPoint[];
  orderStatusBreakdown: {
    completed: number;
    pendingProcessing: number;
    cancelled: number;
    total: number;
  };
  currency: string;
  periodLabel: string;
}

type ChartTab = "sales_revenue" | "orders" | "customers";

export default function PortfolioTrendsChart({
  timeline,
  orderStatusBreakdown,
  currency,
  periodLabel,
}: PortfolioTrendsChartProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("sales_revenue");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // If no timeline data is available
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No historical transaction activity recorded for this period.
        </p>
      </div>
    );
  }

  // Calculate SVG Dimensions and Scales
  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Determine Max Value for Scaling
  let maxValue = 1;
  if (activeTab === "sales_revenue") {
    maxValue = Math.max(
      ...timeline.map((d) => Math.max(d.sales, d.revenue)),
      100,
    );
  } else if (activeTab === "orders") {
    maxValue = Math.max(...timeline.map((d) => d.orders), 5);
  } else {
    maxValue = Math.max(...timeline.map((d) => d.newCustomers), 5);
  }

  // Helper to map values to coordinates
  const getX = (index: number) => {
    if (timeline.length === 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (timeline.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return padding.top + innerHeight - (val / maxValue) * innerHeight;
  };

  // Generate SVG path strings
  const generatePath = (valExtractor: (d: TrendDataPoint) => number) => {
    return timeline
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(valExtractor(d)).toFixed(1)}`)
      .join(" ");
  };

  const generateAreaPath = (valExtractor: (d: TrendDataPoint) => number) => {
    const linePath = timeline
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(valExtractor(d)).toFixed(1)}`)
      .join(" ");
    const lastX = getX(timeline.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + innerHeight;
    return `${linePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  };

  const salesPath = generatePath((d) => d.sales);
  const salesAreaPath = generateAreaPath((d) => d.sales);
  const revenuePath = generatePath((d) => d.revenue);
  const ordersPath = generatePath((d) => d.orders);
  const customersPath = generatePath((d) => d.newCustomers);

  const hoveredItem = hoveredIndex !== null ? timeline[hoveredIndex] : null;

  // Order fulfillment calculation
  const totalOrders = orderStatusBreakdown.total || 0;
  const completedPct = totalOrders > 0 ? Math.round((orderStatusBreakdown.completed / totalOrders) * 100) : 0;
  const pendingPct = totalOrders > 0 ? Math.round((orderStatusBreakdown.pendingProcessing / totalOrders) * 100) : 0;
  const cancelledPct = totalOrders > 0 ? Math.round((orderStatusBreakdown.cancelled / totalOrders) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Primary Trend Chart (8 cols) */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Portfolio Performance Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aggregated trend curve across all authorized stores for {periodLabel.toLowerCase()}
              </p>
            </div>

            {/* Metric Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab("sales_revenue")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "sales_revenue"
                    ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Sales & Revenue
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "orders"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab("customers")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "customers"
                    ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                New Customers
              </button>
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="flex items-center gap-5 mt-4 text-xs font-medium">
            {activeTab === "sales_revenue" && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-slate-700 dark:text-slate-300">Gross Sales ({currency})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Collected Revenue ({currency})</span>
                </div>
              </>
            )}
            {activeTab === "orders" && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-slate-700 dark:text-slate-300">Daily Order Count</span>
              </div>
            )}
            {activeTab === "customers" && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-slate-700 dark:text-slate-300">New Client Profiles</span>
              </div>
            )}
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="relative mt-4 w-full h-[220px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + innerHeight * (1 - ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {Math.round(maxValue * ratio).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Paths */}
            {activeTab === "sales_revenue" && (
              <>
                <path d={salesAreaPath} fill="url(#salesGrad)" />
                <path
                  d={salesPath}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={revenuePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {activeTab === "orders" && (
              <>
                <path d={generateAreaPath((d) => d.orders)} fill="url(#ordersGrad)" />
                <path
                  d={ordersPath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {activeTab === "customers" && (
              <path
                d={customersPath}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points & Hover Targets */}
            {timeline.map((point, index) => {
              const x = getX(index);
              return (
                <g
                  key={index}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <rect
                    x={x - 15}
                    y={padding.top}
                    width={30}
                    height={innerHeight}
                    fill="transparent"
                  />
                  {hoveredIndex === index && (
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + innerHeight}
                      stroke="#f97316"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}
                  {/* Bottom date label */}
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    className={`text-[10px] font-medium transition-colors ${
                      hoveredIndex === index
                        ? "fill-orange-600 font-bold"
                        : "fill-slate-400 dark:fill-slate-500"
                    }`}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Floating Tooltip */}
          {hoveredItem && hoveredIndex !== null && (
            <div
              className="absolute z-20 pointer-events-none bg-slate-950 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-slate-800 transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(getX(hoveredIndex) / width) * 100}%`,
                top: "20%",
              }}
            >
              <div className="font-bold text-slate-300 pb-1 border-b border-slate-800 mb-1">
                {hoveredItem.label}
              </div>
              {activeTab === "sales_revenue" && (
                <div className="space-y-0.5">
                  <div className="text-orange-400 font-semibold">
                    Sales: {currency} {hoveredItem.sales.toLocaleString()}
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    Revenue: {currency} {hoveredItem.revenue.toLocaleString()}
                  </div>
                </div>
              )}
              {activeTab === "orders" && (
                <div className="text-indigo-400 font-semibold">
                  Orders: {hoveredItem.orders} ({hoveredItem.completedOrders} completed)
                </div>
              )}
              {activeTab === "customers" && (
                <div className="text-purple-400 font-semibold">
                  New Customers: {hoveredItem.newCustomers}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Status & Fulfillment Distribution (4 cols) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Order Fulfillment Flow
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational distribution across total period volume
          </p>

          <div className="mt-6 space-y-4">
            {/* Completed */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 stroke-[2]" />
                  Completed / Paid
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {orderStatusBreakdown.completed} ({completedPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${completedPct}%` }}
                />
              </div>
            </div>

            {/* Pending & Processing */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <ClockIcon className="w-4 h-4 text-amber-500 stroke-[2]" />
                  Pending & In-Progress
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {orderStatusBreakdown.pendingProcessing} ({pendingPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${pendingPct}%` }}
                />
              </div>
            </div>

            {/* Cancelled / Failed */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <XCircleIcon className="w-4 h-4 text-rose-500 stroke-[2]" />
                  Cancelled / Refunded
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {orderStatusBreakdown.cancelled} ({cancelledPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${cancelledPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Total Recorded Orders:</span>
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {orderStatusBreakdown.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
