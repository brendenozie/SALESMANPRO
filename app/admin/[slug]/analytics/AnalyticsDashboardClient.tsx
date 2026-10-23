"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChartBarIcon, ArrowPathIcon, TrendingUpIcon, BanknotesIcon,
  ShoppingBagIcon, TagIcon, ClockIcon, CreditCardIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, SparklesIcon
} from "@heroicons/react/24/outline";

// Lightweight SVG chart components (no external lib needed)
function LineChart({ data, color = "#8b5cf6" }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const W = 100, H = 40;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#grad)" points={`0,${H} ${pts} ${W},${H}`} />
    </svg>
  );
}

function BarChart({ data, labels, color = "#06b6d4" }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full rounded-t transition-all duration-300 hover:opacity-80 relative"
            style={{ height: `${(v / max) * 80}px`, background: color, minHeight: v > 0 ? 2 : 0 }}>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {v}
            </div>
          </div>
          {labels[i] && <span className="text-slate-500 text-[9px] transform -rotate-45 origin-top-left">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const R = 40, cx = 50, cy = 50;
  const paths = segments.map(seg => {
    const pct = seg.value / total;
    const start = cumulative;
    cumulative += pct;
    const startAngle = start * Math.PI * 2 - Math.PI / 2;
    const endAngle = cumulative * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + R * Math.cos(startAngle), y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle), y2 = cy + R * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    return (
      <path key={seg.label}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={seg.color} className="hover:opacity-80 transition-opacity" />
    );
  });
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
        <circle cx={cx} cy={cy} r={R} fill="rgba(255,255,255,0.05)" />
        {paths}
        <circle cx={cx} cy={cy} r={22} fill="#0f172a" />
      </svg>
      <div className="space-y-1">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-slate-400 truncate max-w-[100px]">{seg.label}</span>
            <span className="text-white font-semibold ml-auto">{((seg.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PERIODS = [{ label: "7 Days", value: 7 }, { label: "30 Days", value: 30 }, { label: "90 Days", value: 90 }, { label: "1 Year", value: 365 }];
const PM_COLORS: Record<string, string> = {
  CASH: "#10b981", MPESA: "#8b5cf6", CARD: "#06b6d4", LOYALTY: "#f59e0b",
  CREDIT: "#ef4444", SPLIT: "#6366f1", UNKNOWN: "#94a3b8",
};

export default function AnalyticsDashboardClient({ companyId, slug }: { companyId: string; slug: string }) {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/analytics/revenue?companyId=${companyId}&period=${period}`);
      const d = await r.json();
      if (r.ok) setData(d);
    } finally { setLoading(false); }
  }, [companyId, period]);

  useEffect(() => { load(); }, [load]);

  const kes = (n: number) => `KES ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
  const pct = (n: number | null) => n == null ? "N/A" : `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

  const revenueArr = data?.dailySeries?.map((d: any) => d.revenue) ?? [];
  const ordersArr = data?.dailySeries?.map((d: any) => d.orders) ?? [];
  const dayLabels = data?.dailySeries?.map((d: any) => d.date.slice(5)) ?? [];
  const hourLabels = Array.from({ length: 24 }, (_, h) => h % 6 === 0 ? `${h}h` : "");

  const growth = data?.summary?.revenueGrowth;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-indigo-600/30"><ChartBarIcon className="h-7 w-7 text-indigo-300" /></div>
            <h1 className="text-3xl font-black text-white">Analytics Dashboard</h1>
          </div>
          <p className="text-slate-400 text-sm ml-14">Revenue, traffic, top products & payment insights</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${period === p.value ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
              {p.label}
            </button>
          ))}
          <button onClick={load} className="p-2 ml-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300">
            <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-20"><ArrowPathIcon className="h-10 w-10 animate-spin text-indigo-400" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total Revenue",
                value: kes(data?.summary?.totalRevenue ?? 0),
                sub: `${pct(growth)} vs prev period`,
                icon: BanknotesIcon,
                color: "from-indigo-600 to-indigo-400",
                trend: growth,
              },
              {
                label: "Total Orders",
                value: (data?.summary?.totalOrders ?? 0).toLocaleString(),
                sub: `Avg ${kes(data?.summary?.avgOrderValue ?? 0)} per order`,
                icon: ShoppingBagIcon,
                color: "from-violet-600 to-violet-400",
                trend: null,
              },
              {
                label: "Avg Order Value",
                value: kes(data?.summary?.avgOrderValue ?? 0),
                sub: "Per paid order",
                icon: TagIcon,
                color: "from-cyan-600 to-cyan-400",
                trend: null,
              },
              {
                label: "Total Discounts",
                value: kes(data?.summary?.totalDiscount ?? 0),
                sub: `${data?.summary?.totalRevenue ? ((data.summary.totalDiscount / (data.summary.totalRevenue + data.summary.totalDiscount)) * 100).toFixed(1) : 0}% of gross sales`,
                icon: SparklesIcon,
                color: "from-amber-600 to-amber-400",
                trend: null,
              },
            ].map(({ label, value, sub, icon: Icon, color, trend }) => (
              <div key={label} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${color} mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-black text-white mb-1">{value}</p>
                <p className={`text-xs flex items-center gap-1 ${trend != null && trend > 0 ? "text-emerald-400" : trend != null && trend < 0 ? "text-red-400" : "text-slate-500"}`}>
                  {trend != null && trend > 0 && <ArrowTrendingUpIcon className="h-3 w-3" />}
                  {trend != null && trend < 0 && <ArrowTrendingDownIcon className="h-3 w-3" />}
                  {sub}
                </p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold">Daily Revenue</h2>
                <span className="text-slate-400 text-xs">{period} days</span>
              </div>
              <LineChart data={revenueArr} color="#8b5cf6" />
              <div className="flex justify-between mt-2">
                {period <= 30 && dayLabels.filter((_: any, i: number) => i % Math.ceil(period / 8) === 0).map((l: string) => (
                  <span key={l} className="text-slate-600 text-[10px]">{l}</span>
                ))}
              </div>
            </div>

            {/* Payment breakdown donut */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-5">Payment Methods</h2>
              <DonutChart
                segments={(data?.paymentBreakdown ?? []).map((pb: any) => ({
                  label: pb.method,
                  value: pb.revenue,
                  color: PM_COLORS[pb.method] ?? "#94a3b8",
                }))}
              />
            </div>
          </div>

          {/* Hourly traffic + Top products */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-5 flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-cyan-400" /> Hourly Traffic
              </h2>
              <BarChart
                data={(data?.hourlySeries ?? []).map((h: any) => h.count)}
                labels={hourLabels}
                color="#06b6d4"
              />
              <p className="text-slate-500 text-xs mt-2 text-center">Peak hour analysis — orders by hour of day</p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-violet-400" /> Top Products by Revenue
              </h2>
              <div className="space-y-2">
                {(data?.topProducts ?? []).slice(0, 8).map((p: any, i: number) => {
                  const maxRev = data.topProducts[0]?._sum?.price ?? 1;
                  const pctWidth = ((p._sum?.price ?? 0) / maxRev) * 100;
                  return (
                    <div key={p.productId ?? i} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 text-xs w-4 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-white font-semibold truncate max-w-[180px] text-xs">{p.title ?? "Unknown"}</span>
                          <span className="text-violet-400 text-xs">{kes(p._sum?.price ?? 0)}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500"
                            style={{ width: `${pctWidth}%` }} />
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs w-8 text-right">×{p._sum?.quantity ?? 0}</span>
                    </div>
                  );
                })}
                {(!data?.topProducts?.length) && <p className="text-slate-500 text-sm text-center py-6">No data yet</p>}
              </div>
            </div>
          </div>

          {/* Daily Orders bar chart */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5 flex items-center gap-2">
              <ShoppingBagIcon className="h-4 w-4 text-emerald-400" /> Daily Order Volume
            </h2>
            <BarChart data={ordersArr} labels={dayLabels} color="#10b981" />
          </div>
        </>
      )}
    </div>
  );
}
