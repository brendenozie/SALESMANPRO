import React from "react";
import Link from "next/link";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  CalendarDaysIcon,
  TableCellsIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentDashboardPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "dashboard");

  const companyId = context.company.id;
  const currency = context.company.currency;
  const isEcommerce = ["ecommerce", "automotive"].includes(context.category);
  const isServices = ["services", "healthcare"].includes(context.category);
  const isFitness = context.category === "fitness";
  const isRestaurant = context.category === "restaurant";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Fetch real scoped operational metrics
  const [
    todayOrdersCount,
    todaySalesAgg,
    recentOrders,
    totalClientsCount,
    lowStockCount,
    pendingTasks,
  ] = await Promise.all([
    // Today's orders
    prisma.customerOrder.count({
      where: {
        companyId,
        createdAt: { gte: todayStart },
      },
    }).catch(() => 0),

    // Today's sales sum
    prisma.customerOrder.aggregate({
      where: {
        companyId,
        createdAt: { gte: todayStart },
        status: { notIn: ["CANCELLED", "DECLINED"] },
      },
      _sum: { totalPrice: true },
    }).catch(() => ({ _sum: { totalPrice: 0 } })),

    // Recent 5 orders
    prisma.customerOrder.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        customerName: true,
      },
    }).catch(() => []),

    // Customers count
    prisma.client.count({
      where: { companyId },
    }).catch(() => 0),

    // Low stock count (<= 5)
    prisma.inventoryItem.count({
      where: {
        companyId,
        quantity: { lte: 5 },
      },
    }).catch(() => 0),

    // Pending tasks for this agent/staff
    prisma.task.findMany({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
      },
    }).catch(() => []),
  ]);

  const todayRevenue = todaySalesAgg._sum?.totalPrice || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <span>{context.category.toUpperCase()} WORKSPACE</span>
              <span>•</span>
              <span>{context.role}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {context.user.name?.split(" ")[0]}!
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              You are operating inside <strong className="text-white">{context.company.name}</strong>. Here is your daily operational summary and active workstation tasks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/agents/${slug}/pos`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all transform active:scale-95"
            >
              <CreditCardIcon className="w-5 h-5" />
              <span>Launch Point of Sale</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Sales</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CurrencyDollarIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {currency} {todayRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">From completed daily orders</p>
          </div>
        </div>

        {/* Metric 2: Today's Orders / Bookings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isServices ? "Today's Bookings" : isRestaurant ? "Today's Tabs" : "Today's Orders"}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              {isServices ? (
                <CalendarDaysIcon className="w-5 h-5" />
              ) : isRestaurant ? (
                <TableCellsIcon className="w-5 h-5" />
              ) : (
                <ShoppingCartIcon className="w-5 h-5" />
              )}
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {todayOrdersCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Processed today</p>
          </div>
        </div>

        {/* Metric 3: Customers / Members */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isFitness ? "Active Members" : "Client Base"}
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {totalClientsCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Registered in store CRM</p>
          </div>
        </div>

        {/* Metric 4: Category Specific Alert */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isEcommerce ? "Low Stock Items" : "Open Tasks"}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              {isEcommerce ? <CubeIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {isEcommerce ? lowStockCount : pendingTasks.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isEcommerce ? "Requires restock requisition" : "Assigned pending work"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Orders / Operational Activity */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Transactions</h2>
            <Link
              href={`/agents/${slug}/orders`}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ShoppingCartIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-medium">No transactions recorded yet today.</p>
                <p className="text-xs text-slate-500 mt-1">Launch the POS to start processing customer orders.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.map((ord) => (
                  <div key={ord.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-mono text-xs font-bold">
                        #{ord.orderNumber || ord.id.slice(-6).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {ord.customerName || "Walk-in Customer"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {currency} {ord.totalPrice.toLocaleString()}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Operations & Tasks */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Operational Checklist</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <CheckCircleIcon className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-medium">All tasks completed!</p>
                <p className="text-xs text-slate-500">No pending operational duties assigned.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Status: {t.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/agents/${slug}/tasks`}
                className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Open Full Task Board
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
