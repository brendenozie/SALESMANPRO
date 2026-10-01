import React from "react";
import Link from "next/link";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentSalesPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "sales");

  const companyId = context.company.id;
  const currency = context.company.currency;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayAgg, weekAgg, monthAgg, recentSales] = await Promise.all([
    prisma.customerOrder.aggregate({
      where: {
        companyId,
        createdAt: { gte: startOfDay },
        status: { notIn: ["CANCELLED", "DECLINED"] },
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    }).catch(() => ({ _sum: { totalPrice: 0 }, _count: { id: 0 } })),

    prisma.customerOrder.aggregate({
      where: {
        companyId,
        createdAt: { gte: startOfWeek },
        status: { notIn: ["CANCELLED", "DECLINED"] },
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    }).catch(() => ({ _sum: { totalPrice: 0 }, _count: { id: 0 } })),

    prisma.customerOrder.aggregate({
      where: {
        companyId,
        createdAt: { gte: startOfMonth },
        status: { notIn: ["CANCELLED", "DECLINED"] },
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    }).catch(() => ({ _sum: { totalPrice: 0 }, _count: { id: 0 } })),

    prisma.customerOrder.findMany({
      where: {
        companyId,
        status: { notIn: ["CANCELLED", "DECLINED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalPrice: true,
        createdAt: true,
        paymentStatus: true,
      },
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Sales & Revenue</h1>
          <p className="text-sm text-slate-500">
            Real-time sales performance and turnover for <strong>{context.company.name}</strong>.
          </p>
        </div>
        <Link
          href={`/agents/${slug}/pos`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>Launch POS Register</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400">Today's Revenue</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {currency} {(todayAgg._sum?.totalPrice || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">{todayAgg._count?.id || 0} transactions today</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400">This Week</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {currency} {(weekAgg._sum?.totalPrice || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">{weekAgg._count?.id || 0} transactions this week</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400">This Month</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {currency} {(monthAgg._sum?.totalPrice || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">{monthAgg._count?.id || 0} transactions this month</p>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">Transaction History</h2>
          <span className="text-xs text-slate-400">Latest 20 orders</span>
        </div>

        {recentSales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CurrencyDollarIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-medium">No sales recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                      #{s.orderNumber || s.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {s.customerName || "Walk-in Customer"}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        {s.paymentStatus || "PAID"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                      {currency} {s.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
