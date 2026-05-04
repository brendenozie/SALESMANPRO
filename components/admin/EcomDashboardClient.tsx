'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring } from 'framer-motion';
import {
    ArrowRightIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    CubeTransparentIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    ShoppingCartIcon,
    UsersIcon,
    TagIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

// --- HELPER & CHILD COMPONENTS ---

// 1. CountUp Component
const CountUp = ({ to, format }: { to: number; format?: (val: number) => string; }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const spring = useSpring(0, { damping: 50, stiffness: 200 });

    useEffect(() => {
        if (inView) {
            spring.set(to);
        }
    }, [spring, to, inView]);

    useEffect(() => {
        const unsubscribe = spring.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = format ? format(latest) : Math.round(latest).toLocaleString();
            }
        });
        return unsubscribe;
    }, [spring, format]);

    return <span ref={ref}>0</span>;
};

// 2. SimpleBarChart Component
const SimpleBarChart = ({ data, currency }: { data: { name: string, total: number }[], currency: string }) => {
    if (!data || data.length === 0) {
    return (
      // Redesigned empty state for dark mode panel
      <div className="w-full h-52 flex items-center justify-center p-4 bg-gray-700/50 rounded-lg border border-gray-700">
        <span className="text-sm font-semibold text-gray-500">
          No sales data available for this period.
        </span>
      </div>
    );
  }
  const maxValue = Math.max(...data.map(d => d.total), 0);

    return (
        <div className="h-64 flex items-end justify-around space-x-2 pt-4">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <motion.div
                        className="w-full bg-cyan-500 rounded-t-md"
                        initial={{ height: 0 }}
                        animate={{ height: `${maxValue > 0 ? (item.total / maxValue) * 100 : 0}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900 text-white text-xs rounded py-1 px-2 absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            {formatCurrency(item.total, currency)}
                        </div>
                    </motion.div>
                    <span className="text-xs text-gray-400 mt-2">{item.name}</span>
                </div>
            ))}
        </div>
    );
};

// 3. ActivityDonutChart Component
const ActivityDonutChart = ({ data }: { data: { pendingOrders: number; pendingRequests: number; openTasks: number; } }) => {

    if (!data || Object.keys(data).length === 0) {
        return (
        // Redesigned empty state for dark mode panel
        <div className="w-full h-52 flex items-center justify-center p-4 bg-gray-700/50 rounded-lg border border-gray-700">
            <span className="text-sm font-semibold text-gray-500">
            No sales data available for this period.
            </span>
        </div>
        );
    }

    const { pendingOrders, pendingRequests, openTasks } = data;
    const total = pendingOrders + pendingRequests + openTasks;
    const chartData = [
        { name: 'Pending Orders', value: pendingOrders, color: 'text-emerald-400', ringColor: 'stroke-emerald-500' },
        { name: 'Pending Requests', value: pendingRequests, color: 'text-indigo-400', ringColor: 'stroke-indigo-500' },
        { name: 'Open Tasks', value: openTasks, color: 'text-amber-400', ringColor: 'stroke-amber-500' },
    ];
    let offset = 0;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-64">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" className="stroke-current text-gray-700" strokeWidth="2" fill="transparent"></circle>
                    {chartData.map((item, index) => {
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const strokeDashoffset = -offset;
                        offset += percentage;
                        return (
                            <motion.circle
                                key={index}
                                cx="18"
                                cy="18"
                                r="15.9155"
                                className={item.ringColor}
                                strokeWidth="2.5"
                                fill="transparent"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                initial={{ strokeDasharray: `0 100` }}
                                animate={{ strokeDasharray: `${percentage} ${100 - percentage}` }}
                                transition={{ duration: 0.8, delay: index * 0.2, ease: "circOut" }}
                                transform="rotate(-90 18 18)"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-white">{total}</span>
                    <span className="text-xs text-gray-400">Total</span>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {chartData.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-3 ${item.color.replace('text-', 'bg-')}`}></span>
                        <span className={`font-medium ${item.color}`}>{item.name}</span>
                        <span className="ml-auto text-gray-300 font-semibold">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- TYPE DEFINITIONS ---
export interface DashboardData {
    slug: string;
    companyName: string;
    currency: string | 'USD' | 'EUR' | 'GBP' | 'KES' | 'UGX' | 'TZS' | 'RWF' | 'ZAR';
    todaySales: number;
    completedOrdersToday: number;
    averageOrderValueToday: number;
    totalRevenueMonth: number;
    monthlyTarget: number;
    monthlyTargetProgress: number;
    newClients: number;
    totalClients: number;
    topAgent: { name: string; totalSales: number };
    lowStock: number;
    overdueTasksCount: number;
    activityBreakdown: {
        pendingOrders: number;
        pendingRequests: number;
        openTasks: number;
    };
    commissionEarned: number;
    communicationsToday: number;
    pendingTasksList: { id: string; taskName: string; dueDate: string }[];
    recentOrders: { id: string; name: string | null; status: string; totalPrice: number | null; createdAt?: string }[];
    activePromotions: { id: string; title: string; description: string | null; badgeText: string | null }[];
    salesLast7Days: { name: string; total: number }[];
}

// --- HELPER FUNCTION ---
const formatCurrency = (amount: number, currency: string) => {
    // FIX: Added a fallback currency to prevent runtime errors if the currency prop is not yet available.
    const validCurrency = currency || 'USD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: validCurrency, minimumFractionDigits: 0 }).format(amount);
};

// --- STYLING & PROPS ---
const COLOR_PALETTE = {
    sales: { color: 'text-cyan-400', border: 'border-cyan-500/50', iconBg: 'bg-cyan-900/50', bar: 'bg-cyan-500' },
    revenue: { color: 'text-pink-400', border: 'border-pink-500/50', iconBg: 'bg-pink-900/50', bar: 'bg-pink-500' },
    orders: { color: 'text-emerald-400', border: 'border-emerald-500/50', iconBg: 'bg-emerald-900/50', bar: 'bg-emerald-500' },
    clients: { color: 'text-green-400', border: 'border-green-500/50', iconBg: 'bg-green-900/50', bar: 'bg-green-500' },
    agent: { color: 'text-yellow-400', border: 'border-yellow-500/50', iconBg: 'bg-yellow-900/50', bar: 'bg-yellow-500' },
    stock: { color: 'text-red-400', border: 'border-red-500/50', iconBg: 'bg-red-900/50', bar: 'bg-red-500' },
    tasks: { color: 'text-amber-400', border: 'border-amber-500/50', iconBg: 'bg-amber-900/50', bar: 'bg-amber-500' },
    avg: { color: 'text-indigo-400', border: 'border-indigo-500/50', iconBg: 'bg-indigo-900/50', bar: 'bg-indigo-500' },
    comms: { color: 'text-purple-400', border: 'border-purple-500/50', iconBg: 'bg-purple-900/50', bar: 'bg-purple-500' },
};

export interface DashboardCardProps {
    href: string;
    title: string;
    icon: React.ElementType;
    value: number;
    formatValue?: (val: number) => string;
    progress?: number;
    footerText?: string;
    color: string;
    border: string;
    iconBg: string;
    bar: string;
}

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1, y: 0, scale: 1,
        transition: { delay: i * 0.08 + 0.1, duration: 0.4, ease: 'easeOut' },
    }),
};

// --- DASHBOARD CARD COMPONENT ---
const DashboardCard = ({ href, title, icon: Icon, value, formatValue, progress, footerText, color, border, iconBg, bar }: DashboardCardProps) => {
    const isDanger = title === 'Low Stock Items' || title === 'Overdue Tasks';
    const progressPercent = Math.min(Math.max(progress || 0, 0), 100);
    const hasProgress = progress !== undefined;

    return (
        <a href={href} className={`flex flex-col justify-between p-6 rounded-xl transition-all transform hover:scale-[1.02] group relative overflow-hidden cursor-pointer bg-gray-800/80 border ${border} hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-gray-800/90 ${isDanger ? 'ring-2 ring-red-500' : ''} min-h-[15rem]`}>
            <div className={`absolute top-0 left-0 right-0 h-1 ${bar} transition-all duration-300`}></div>
            <div className='flex flex-col gap-4'>
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-full shadow-lg ${iconBg} ${color} transition-all duration-300`}>
                        <Icon className={`w-5 h-5`} />
                    </div>
                    <h3 className="text-xs font-medium uppercase text-gray-400 text-right">{title}</h3>
                </div>
                <div>
                    <div className={`text-4xl font-extrabold ${color} whitespace-nowrap overflow-hidden text-ellipsis`}>
                        <CountUp to={value} format={formatValue} />
                    </div>
                </div>
            </div>
            <div className="w-full relative z-10">
                {hasProgress && (
                    <div className="mb-2">
                        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-1">
                            <span>Target Progress</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="relative w-full h-1 rounded-full bg-gray-700 overflow-hidden">
                            <motion.div
                                className={`${bar} absolute top-0 left-0 h-full rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center text-xs font-medium text-gray-500 relative z-10 pt-1 border-t border-gray-700/50 mt-auto">
                    <span>{footerText}</span>
                    <span className="flex items-center text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">
                        View <ArrowRightIcon className="ml-1 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </div>
            </div>
        </a>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function EcomDashboardClient(props: DashboardData) {

    const dataCards: DashboardCardProps[] = [
        {
            href: `/admin/${props.slug}/sales`,
            title: 'Today\'s Sales',
            icon: ArrowTrendingUpIcon,
            value: props.todaySales,
            formatValue: (val: number) => formatCurrency(val, props.currency),
            footerText: 'View Sales Report',
            ...COLOR_PALETTE.sales,
        },
        {
            href: `/admin/${props.slug}/targets`,
            title: 'Monthly Revenue',
            icon: BanknotesIcon,
            value: props.totalRevenueMonth,
            formatValue: (val: number) => `${formatCurrency(val, props.currency)}`,
            progress: props.monthlyTargetProgress,
            footerText: `Target: ${formatCurrency(props.monthlyTarget, props.currency)}`,
            ...COLOR_PALETTE.revenue,
        },
        {
            href: `/admin/${props.slug}/orders`,
            title: 'Completed Orders',
            icon: CheckCircleIcon,
            value: props.completedOrdersToday,
            footerText: 'View All Orders',
            ...COLOR_PALETTE.orders,
        },
        {
            href: `/admin/${props.slug}/sales`,
            title: 'Avg. Order Value',
            icon: CurrencyDollarIcon,
            value: props.averageOrderValueToday,
            formatValue: (val: number) => formatCurrency(val, props.currency),
            footerText: 'View Analytics',
            ...COLOR_PALETTE.avg,
        },
        {
            href: `/admin/${props.slug}/consumers`,
            title: 'New Clients Today',
            icon: UsersIcon,
            value: props.newClients,
            footerText: `of ${props.totalClients} total`,
            ...COLOR_PALETTE.clients,
        },
        {
            href: `/admin/${props.slug}/agents`,
            title: `Top Agent: ${props.topAgent?.name || 'N/A'}`,
            icon: ChartBarIcon,
            value: props.topAgent?.totalSales || 0,
            formatValue: (val: number) => formatCurrency(val, props.currency),
            footerText: 'View Leaderboard',
            ...COLOR_PALETTE.agent,
        },
        {
            href: `/admin/${props.slug}/inventory`,
            title: 'Low Stock Items',
            icon: CubeTransparentIcon,
            value: props.lowStock,
            footerText: 'Restock Now',
            ...COLOR_PALETTE.stock,
        },
        {
            href: `/admin/${props.slug}/tasks`,
            title: 'Open Tasks',
            icon: ClipboardDocumentListIcon,
            value: props.activityBreakdown?.openTasks,
            footerText: 'Manage Tasks',
            ...COLOR_PALETTE.tasks,
        },
        {
            href: `/admin/${props.slug}/commissions`,
            title: 'Commission Earned',
            icon: BanknotesIcon,
            value: props.commissionEarned,
            formatValue: (val: number) => formatCurrency(val, props.currency),
            footerText: 'View Payouts',
            ...COLOR_PALETTE.comms,
        },
        {
            href: `/admin/${props.slug}/communications`,
            title: 'Comms Today',
            icon: ChatBubbleLeftRightIcon,
            value: props.communicationsToday,
            footerText: 'View Messages',
            ...COLOR_PALETTE.clients,
        },
    ];

    return (
        <div className="font-sans bg-gray-900 text-gray-100 min-h-screen p-4 sm:p-6 lg:p-10 transition-colors duration-500">
            <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-color-gray-800)_0%,_var(--tw-color-gray-900)_100%)]"></div>
            <div className="relative z-10 max-w-screen-xl mx-auto">
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
                        {props.companyName} Control Center
                    </h1>
                    <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full mb-3"></div>
                    <p className="text-lg text-gray-400 font-light">
                        Actionable summary for <strong>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>.
                    </p>
                </motion.header>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-2/3 space-y-8">
                        <div className="space-y-4">
                            {props.overdueTasksCount > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center p-4 rounded-xl bg-amber-900/40 text-amber-300 shadow-xl border border-amber-700/50">
                                    <ClockIcon className="w-6 h-6 mr-4 text-amber-400 animate-pulse" />
                                    <p className="text-sm font-medium flex-1">
                                        <b>Action Required:</b> <strong>{props.overdueTasksCount}</strong> overdue task(s).
                                    </p>
                                    <a href={`/admin/${props.slug}/tasks`} className="ml-4 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                                        Resolve Now <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}
                            {props.lowStock > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center p-4 rounded-xl bg-red-900/40 text-red-300 shadow-xl border border-red-700/50">
                                    <ExclamationTriangleIcon className="w-6 h-6 mr-4 text-red-400 animate-pulse" />
                                    <p className="text-sm font-medium flex-1">
                                        <b>Critical Alert:</b> <strong>{props.lowStock}</strong> products are low on stock.
                                    </p>
                                    <a href={`/admin/${props.slug}/inventory`} className="ml-4 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
                                        Restock Now <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {dataCards.map((card, idx) => (
                                <motion.div key={card.title} custom={idx} variants={cardVariants} initial="hidden" animate="visible">
                                    <DashboardCard {...card} />
                                </motion.div>
                            ))}
                        </div>
                        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                            <div className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50">
                                <h2 className="text-xl font-bold mb-4 text-white">Sales This Week 📈</h2>
                                <SimpleBarChart data={props.salesLast7Days} currency={props.currency} />
                            </div>
                            <div className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50">
                                <h2 className="text-xl font-bold mb-4 text-white">Activity Breakdown 📊</h2>
                                <ActivityDonutChart data={props.activityBreakdown} />
                            </div>
                        </motion.div>
                    </div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="w-full lg:w-1/3 space-y-8">
                        <div className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-white">Today's Focus</h3>
                                <a href={`/admin/${props.slug}/tasks`} className="py-1 px-3 text-xs font-semibold bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all">View All</a>
                            </div>
                            <div className="space-y-3">
                                {props.pendingTasksList?.length > 0 ? props.pendingTasksList?.map((task, i) => (
                                    <motion.a key={task.id} href={`/admin/${props.slug}/tasks/${task.id}`} className="block group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.5 }}>
                                        <div className="p-3 rounded-lg hover:bg-gray-700/70 transition-all flex items-center border border-gray-700">
                                            <ClipboardDocumentListIcon className="w-5 h-5 mr-3 text-amber-400 flex-shrink-0" />
                                            <div className='flex-1 overflow-hidden'>
                                                <h4 className="font-medium text-gray-200 group-hover:text-white transition-colors truncate">{task.taskName}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <ArrowRightIcon className="w-4 h-4 ml-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.a>
                                )) : (
                                    <div className="text-center py-4 text-gray-500 bg-gray-700/50 rounded-lg">
                                        🎉 No urgent tasks. Great job!
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-white">Recent Orders</h3>
                                <a href={`/admin/${props.slug}/orders`} className="py-1 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all">View All</a>
                            </div>
                            <div className="space-y-3">
                                {props.recentOrders?.length > 0 ? props.recentOrders?.map((order, i) => (
                                    <motion.a key={order.id} href={`/admin/${props.slug}/orders/${order.id}`} className="block group" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.8 }}>
                                        <div className="p-3 rounded-lg hover:bg-gray-700/70 transition-all flex items-center gap-4 border border-gray-700">
                                            <ShoppingCartIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-medium text-gray-200 truncate">{order.name || `Order #${order.id.slice(-6)}`}</h4>
                                                <p className="text-sm text-gray-500">{formatCurrency(order.totalPrice || 0, props.currency)}</p>
                                            </div>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 flex-shrink-0">{order.status}</span>
                                        </div>
                                    </motion.a>
                                )) : (
                                    <div className="text-center py-4 text-gray-500 bg-gray-700/50 rounded-lg">No recent orders yet.</div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-white">Active Promotions</h3>
                                <a href={`/admin/${props.slug}/promotions`} className="py-1 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all">Manage</a>
                            </div>
                            <div className="space-y-3">
                                {props.activePromotions?.length > 0 ? props.activePromotions?.map((promo, i) => (
                                    <motion.a key={promo.id} href={`/admin/${props.slug}/promotions/${promo.id}`} className="block group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.9 }}>
                                        <div className="p-3 rounded-lg hover:bg-gray-700/70 transition-all flex items-center gap-3 border border-gray-700">
                                            <TagIcon className="w-5 h-5 text-pink-400 flex-shrink-0" />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-medium text-gray-200 group-hover:text-white transition-colors truncate">{promo.title}</h4>
                                                {promo.badgeText && <p className="text-xs text-gray-500 mt-0.5">{promo.badgeText}</p>}
                                            </div>
                                            <ArrowRightIcon className="w-4 h-4 ml-auto text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.a>
                                )) : (
                                    <div className="text-center py-4 text-gray-500 bg-gray-700/50 rounded-lg">No active promotions.</div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
}

