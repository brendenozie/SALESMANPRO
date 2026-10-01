import React from "react";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentTargetsPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "targets");

  const companyId = context.company.id;
  const currency = context.company.currency;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Aggregated sales this month
  const monthlySales = await prisma.customerOrder.aggregate({
    where: {
      companyId,
      createdAt: { gte: startOfMonth },
      status: { notIn: ["CANCELLED", "DECLINED"] },
    },
    _sum: { totalPrice: true },
    _count: { id: true },
  }).catch(() => ({ _sum: { totalPrice: 0 }, _count: { id: 0 } }));

  const currentRevenue = monthlySales._sum?.totalPrice || 0;
  const monthlyGoal = 250000;
  const progressPercent = Math.min(Math.round((currentRevenue / monthlyGoal) * 100), 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Sales Targets & Commission</h1>
        <p className="text-sm text-slate-500">
          Monthly quota progress, performance benchmarks, and commission tracking for <strong>{context.company.name}</strong>.
        </p>
      </div>

      {/* Main Target Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Monthly Store Quota</h2>
              <p className="text-xs text-slate-400">Current cycle: {now.toLocaleString("default", { month: "long", year: "numeric" })}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{progressPercent}%</span>
            <span className="text-xs text-slate-400 block">Achieved of goal</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{currency} {currentRevenue.toLocaleString()} Current</span>
            <span>Target: {currency} {monthlyGoal.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400">Orders Completed</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 block">
              {monthlySales._count?.id || 0}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400">Estimated Commission (5%)</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">
              {currency} {(currentRevenue * 0.05).toLocaleString()}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400">Remaining to Goal</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 block">
              {currency} {Math.max(monthlyGoal - currentRevenue, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
