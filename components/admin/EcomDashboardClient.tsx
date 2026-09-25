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

const SimpleBarChart = ({ data, currency }: { data: { name: string, total: number }[], currency: string }) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-52 flex items-center justify-center p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    No sales data available for this period.
                </span>
            </div>
        );
    }
    const maxValue = Math.max(...data.map(d => d.total), 0);

    return (
        <div className="h-64 flex items-end justify-around space-x-1 sm:space-x-2 pt-4">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <motion.div
                        className="w-full bg-cyan-500 hover:bg-cyan-400 dark:bg-cyan-500/80 dark:hover:bg-cyan-400 rounded-t-md transition-colors cursor-pointer"
                        initial={{ height: 0 }}
                        animate={{ height: `${maxValue > 0 ? (item.total / maxValue) * 100 : 0}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    >
                        <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded py-1 px-2 absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-md">
                            {formatCurrency(item.total, currency)}
                        </div>
                    </motion.div>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 truncate max-w-full">{item.name}</span>
                </div>
            ))}
        </div>
    );
};

const ActivityDonutChart = ({ data }: { data: { pendingOrders: number; pendingRequests: number; openTasks: number; } }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="w-full h-52 flex items-center justify-center p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    No activity data available.
                </span>
            </div>
        );
    }

    const { pendingOrders, pendingRequests, openTasks } = data;
    const total = pendingOrders + pendingRequests + openTasks;
    const chartData = [
        { name: 'Pending Orders', value: pendingOrders, color: 'text-emerald-500 dark:text-emerald-400', ringColor: 'stroke-emerald-500' },
        { name: 'Pending Requests', value: pendingRequests, color: 'text-indigo-500 dark:text-indigo-400', ringColor: 'stroke-indigo-500' },
        { name: 'Open Tasks', value: openTasks, color: 'text-amber-500 dark:text-amber-400', ringColor: 'stroke-amber-500' },
    ];
    let offset = 0;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 h-auto sm:h-64 py-4">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" className="stroke-current text-gray-100 dark:text-slate-700/50" strokeWidth="3" fill="transparent"></circle>
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
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                initial={{ strokeDasharray: `0 100` }}
                                animate={{ strokeDasharray: `${percentage} ${100 - percentage}` }}
                                transition={{ duration: 0.8, delay: index * 0.2, ease: "circOut" }}
                                transform="rotate(-90 18 18)"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{total}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</span>
                </div>
            </div>
            <div className="flex flex-col gap-3 w-full sm:w-auto">
                {chartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between sm:justify-start">
                        <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-3 ${item.ringColor.replace('stroke-', 'bg-')}`}></span>
                            <span className={`text-sm font-medium text-gray-600 dark:text-slate-300`}>{item.name}</span>
                        </div>
                        <span className="ml-4 text-sm text-gray-900 dark:text-slate-100 font-bold">{item.value}</span>
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
    currency: string;
    todaySales: number;
    completedOrdersToday: number;
    averageOrderValueToday: number;
    totalRevenueMonth: number;
    netRevenueMonth?: number;
    cogsMonth?: number;
    grossProfitMonth?: number;
    operatingExpensesMonth?: number;
    netProfitMonth?: number;
    accountsReceivableTotal?: number;
    accountsPayableTotal?: number;
    overdueInvoicesCount?: number;
    pendingSupplierBillsCount?: number;
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

const formatCurrency = (amount: number, currency: string) => {
    const validCurrency = currency || 'USD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: validCurrency, minimumFractionDigits: 0 }).format(amount);
};

const COLOR_PALETTE = {
    sales: { color: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-500/30', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40', bar: 'bg-cyan-500' },
    revenue: { color: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-500/30', iconBg: 'bg-pink-100 dark:bg-pink-900/40', bar: 'bg-pink-500' },
    orders: { color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/30', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', bar: 'bg-emerald-500' },
    clients: { color: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-500/30', iconBg: 'bg-green-100 dark:bg-green-900/40', bar: 'bg-green-500' },
    agent: { color: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-500/30', iconBg: 'bg-yellow-100 dark:bg-yellow-900/40', bar: 'bg-yellow-500' },
    stock: { color: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/30', iconBg: 'bg-red-100 dark:bg-red-900/40', bar: 'bg-red-500' },
    tasks: { color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/30', iconBg: 'bg-amber-100 dark:bg-amber-900/40', bar: 'bg-amber-500' },
    avg: { color: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/30', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40', bar: 'bg-indigo-500' },
    comms: { color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/30', iconBg: 'bg-purple-100 dark:bg-purple-900/40', bar: 'bg-purple-500' },
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
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: (i: number) => ({
        opacity: 1, y: 0, scale: 1,
        transition: { delay: i * 0.05 + 0.1, duration: 0.4, ease: 'easeOut' },
    }),
};

const DashboardCard = ({ 
    href, 
    title, 
    icon: Icon, 
    value, 
    formatValue, 
    progress, 
    footerText, 
    color, 
    border, 
    iconBg, 
    bar 
}: DashboardCardProps) => {
    const isDanger = title === 'Low Stock Items' || title === 'Overdue Tasks';
    const progressPercent = Math.min(Math.max(progress || 0, 0), 100);
    const hasProgress = progress !== undefined;

    return (
        <a 
            href={href} 
            className={`
                group relative flex flex-col justify-between h-64 w-full p-4 xs:p-5 sm:p-6 rounded-2xl
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
                border ${border || 'border-slate-200/80 dark:border-slate-800'}
                shadow-sm hover:shadow-xl dark:shadow-slate-950/40 dark:hover:shadow-indigo-500/10
                transition-all duration-300 ease-out hover:-translate-y-1.5 overflow-hidden
                ${isDanger ? 'ring-2 ring-red-500/50 dark:ring-red-500/60 animate-pulse' : ''}
            `}
        >
            {/* Top accent glow line */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${bar} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Top & Middle Content Section */}
            <div className="flex flex-col gap-3 sm:gap-4">
                {/* Header: Icon & Title */}
                <div className="flex items-start justify-between gap-2">
                    <div className={`p-2.5 sm:p-3 rounded-xl shadow-inner ${iconBg} ${color} group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-[10px] xs:text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right line-clamp-2 leading-tight mt-1">
                        {title}
                    </h3>
                </div>

                {/* Main Metric Value */}
                <div className="mt-1">
                    <div className={`text-2xl xs:text-3xl sm:text-4xl font-extrabold tracking-tight ${color} whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-sm`}>
                        <CountUp to={value} format={formatValue} />
                    </div>
                </div>
            </div>

            {/* Bottom Content Section pinned to base */}
            <div className="w-full relative z-10 mt-auto pt-2">
                {/* Progress Bar (reserves height to keep layout constant even if progress is absent) */}
                <div className="h-8 flex flex-col justify-end mb-2">
                    {hasProgress ? (
                        <div>
                            <div className="flex justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                                <span>Target Progress</span>
                                <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="relative w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                                <motion.div
                                    className={`${bar} absolute top-0 left-0 h-full rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer Link */}
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="truncate pr-2 text-slate-600 dark:text-slate-400">{footerText}</span>
                    <span className="flex items-center text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors duration-300 shrink-0 font-bold">
                        View <ArrowRightIcon className="ml-1 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                </div>
            </div>
        </a>
    );
};

export default function EcomDashboardClient(rawProps: Partial<DashboardData>) {
    const props = {
        slug: rawProps.slug || '',
        companyName: rawProps.companyName || 'Your Store',
        currency: rawProps.currency || 'KES',
        todaySales: rawProps.todaySales ?? 0,
        completedOrdersToday: rawProps.completedOrdersToday ?? 0,
        averageOrderValueToday: rawProps.averageOrderValueToday ?? 0,
        totalRevenueMonth: rawProps.totalRevenueMonth ?? 0,
        monthlyTarget: rawProps.monthlyTarget ?? 50000,
        monthlyTargetProgress: rawProps.monthlyTargetProgress ?? 0,
        newClients: rawProps.newClients ?? 0,
        totalClients: rawProps.totalClients ?? 0,
        topAgent: rawProps.topAgent || { name: 'N/A', totalSales: 0 },
        lowStock: rawProps.lowStock ?? 0,
        overdueTasksCount: rawProps.overdueTasksCount ?? 0,
        activityBreakdown: rawProps.activityBreakdown || { pendingOrders: 0, pendingRequests: 0, openTasks: 0 },
        commissionEarned: rawProps.commissionEarned ?? 0,
        communicationsToday: rawProps.communicationsToday ?? 0,
        pendingTasksList: rawProps.pendingTasksList || [],
        recentOrders: rawProps.recentOrders || [],
        activePromotions: rawProps.activePromotions || [],
        salesLast7Days: rawProps.salesLast7Days || [],
        netRevenueMonth: rawProps.netRevenueMonth ?? rawProps.totalRevenueMonth ?? 0,
        cogsMonth: rawProps.cogsMonth ?? 0,
        grossProfitMonth: rawProps.grossProfitMonth ?? 0,
        operatingExpensesMonth: rawProps.operatingExpensesMonth ?? 0,
        netProfitMonth: rawProps.netProfitMonth ?? 0,
        accountsReceivableTotal: rawProps.accountsReceivableTotal ?? 0,
        accountsPayableTotal: rawProps.accountsPayableTotal ?? 0,
        overdueInvoicesCount: rawProps.overdueInvoicesCount ?? 0,
        pendingSupplierBillsCount: rawProps.pendingSupplierBillsCount ?? 0,
    };

    const dataCards: DashboardCardProps[] = [
        { href: `/admin/${props.slug}/sales`, title: 'Today\'s Sales', icon: ArrowTrendingUpIcon, value: props.todaySales, formatValue: (val) => formatCurrency(val, props.currency), footerText: 'View Sales Report', ...COLOR_PALETTE.sales },
        { href: `/admin/${props.slug}/targets`, title: 'Monthly Revenue', icon: BanknotesIcon, value: props.totalRevenueMonth, formatValue: (val) => `${formatCurrency(val, props.currency)}`, progress: props.monthlyTargetProgress, footerText: `Target: ${formatCurrency(props.monthlyTarget, props.currency)}`, ...COLOR_PALETTE.revenue },
        { href: `/admin/${props.slug}/orders`, title: 'Completed Orders', icon: CheckCircleIcon, value: props.completedOrdersToday, footerText: 'View All Orders', ...COLOR_PALETTE.orders },
        { href: `/admin/${props.slug}/sales`, title: 'Avg. Order Value', icon: CurrencyDollarIcon, value: props.averageOrderValueToday, formatValue: (val) => formatCurrency(val, props.currency), footerText: 'View Analytics', ...COLOR_PALETTE.avg },
        { href: `/admin/${props.slug}/consumers`, title: 'New Clients Today', icon: UsersIcon, value: props.newClients, footerText: `of ${props.totalClients} total`, ...COLOR_PALETTE.clients },
        { href: `/admin/${props.slug}/agents`, title: `Top Agent: ${props.topAgent?.name || 'N/A'}`, icon: ChartBarIcon, value: props.topAgent?.totalSales || 0, formatValue: (val) => formatCurrency(val, props.currency), footerText: 'View Leaderboard', ...COLOR_PALETTE.agent },
        { href: `/admin/${props.slug}/inventory`, title: 'Low Stock Items', icon: CubeTransparentIcon, value: props.lowStock, footerText: 'Restock Now', ...COLOR_PALETTE.stock },
        { href: `/admin/${props.slug}/tasks`, title: 'Open Tasks', icon: ClipboardDocumentListIcon, value: props.activityBreakdown?.openTasks, footerText: 'Manage Tasks', ...COLOR_PALETTE.tasks },
        { href: `/admin/${props.slug}/commissions`, title: 'Commission Earned', icon: BanknotesIcon, value: props.commissionEarned, formatValue: (val) => formatCurrency(val, props.currency), footerText: 'View Payouts', ...COLOR_PALETTE.comms },
        { href: `/admin/${props.slug}/communications`, title: 'Comms Today', icon: ChatBubbleLeftRightIcon, value: props.communicationsToday, footerText: 'View Messages', ...COLOR_PALETTE.clients },
    ];

    return (
        <div className="font-sans bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 min-h-screen p-3 sm:p-6 lg:p-10 transition-colors duration-500 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-0 dark:opacity-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-color-slate-800)_0%,_transparent_50%)] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-screen-2xl mx-auto">
                <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 sm:mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-5 sticky top-0 bg-gray-50/90 dark:bg-slate-900/90 backdrop-blur-md z-20 py-2 sm:py-0 sm:relative sm:bg-transparent dark:sm:bg-transparent">
                    <div>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                            {props.companyName} Control Center
                        </h1>
                        <div className="w-16 h-1 sm:h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full mb-3"></div>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-slate-400 font-medium">
                            Actionable summary for <strong>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <a href={`/admin/${props.slug}/finance`} className="flex-1 sm:flex-none justify-center px-4 py-3 sm:py-2.5 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 min-h-[44px]">
                            <BanknotesIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Finance Hub
                        </a>
                        <a href={`/admin/${props.slug}/invoices`} className="flex-1 sm:flex-none justify-center px-4 py-3 sm:py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/80 text-gray-700 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 min-h-[44px]">
                            <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" /> Invoices
                        </a>
                        <a href={`/admin/${props.slug}/inventory-purchase-orders`} className="flex-1 sm:flex-none justify-center px-4 py-3 sm:py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/80 text-gray-700 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 min-h-[44px]">
                            <CubeTransparentIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" /> Purchases
                        </a>
                    </div>
                </motion.header>

                <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
                    <div className="w-full xl:w-2/3 space-y-6 lg:space-y-8">
                        {/* Alerts Section */}
                        <div className="space-y-3 sm:space-y-4">
                            {props.overdueInvoicesCount > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-700/30 gap-3 sm:gap-4">
                                    <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 animate-pulse flex-shrink-0" />
                                    <p className="text-sm font-medium flex-1">
                                        <b>Receivables Alert:</b> <strong>{props.overdueInvoicesCount}</strong> overdue customer invoice(s) awaiting collection.
                                    </p>
                                    <a href={`/admin/${props.slug}/finance`} className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center">
                                        View Invoices <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}
                            {props.pendingSupplierBillsCount > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300 shadow-sm border border-amber-200 dark:border-amber-700/30 gap-3 sm:gap-4">
                                    <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    <p className="text-sm font-medium flex-1">
                                        <b>Payables Notice:</b> <strong>{props.pendingSupplierBillsCount}</strong> open supplier bill(s) pending payment.
                                    </p>
                                    <a href={`/admin/${props.slug}/finance`} className="text-sm font-bold text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center">
                                        Pay Bills <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}
                            {props.overdueTasksCount > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-300 shadow-sm border border-orange-200 dark:border-orange-700/30 gap-3 sm:gap-4">
                                    <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 animate-pulse flex-shrink-0" />
                                    <p className="text-sm font-medium flex-1">
                                        <b>Action Required:</b> <strong>{props.overdueTasksCount}</strong> overdue task(s).
                                    </p>
                                    <a href={`/admin/${props.slug}/tasks`} className="text-sm font-bold text-orange-700 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center">
                                        Resolve Now <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}
                            {props.lowStock > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300 shadow-sm border border-red-200 dark:border-red-700/30 gap-3 sm:gap-4">
                                    <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 animate-pulse flex-shrink-0" />
                                    <p className="text-sm font-medium flex-1">
                                        <b>Critical Alert:</b> <strong>{props.lowStock}</strong> products are low on stock.
                                    </p>
                                    <a href={`/admin/${props.slug}/inventory`} className="text-sm font-bold text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center">
                                        Restock Now <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}
                        </div>

                        {/* MTD Finances */}
                        <div className="p-5 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-md">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-5 border-b border-gray-100 dark:border-slate-700/60">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                            Business Financial Health (MTD)
                                        </h2>
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mt-1">
                                        Authoritative net figures calculated from real orders, COGS, expenses, and ledgers.
                                    </p>
                                </div>
                                <a href={`/admin/${props.slug}/finance`} className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 flex items-center justify-center gap-1 transition-all bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2.5 sm:py-2 rounded-xl border border-emerald-200 dark:border-emerald-500/30 w-full sm:w-auto min-h-[44px] sm:min-h-0">
                                    Full Finance Hub <ArrowRightIcon className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                <a href={`/admin/${props.slug}/finance`} className="p-4 bg-white dark:bg-slate-800/80 hover:bg-gray-50 dark:hover:bg-slate-700/80 border border-gray-100 dark:border-slate-700/60 rounded-xl transition-all shadow-sm">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">Net Profit</span>
                                    <p className={`text-lg sm:text-xl font-black ${props.netProfitMonth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                        {formatCurrency(props.netProfitMonth, props.currency)}
                                    </p>
                                    <span className="text-[10px] text-gray-500 dark:text-slate-500 mt-1 block">Gross: {formatCurrency(props.grossProfitMonth, props.currency)}</span>
                                </a>
                                <a href={`/admin/${props.slug}/finance`} className="p-4 bg-white dark:bg-slate-800/80 hover:bg-gray-50 dark:hover:bg-slate-700/80 border border-gray-100 dark:border-slate-700/60 rounded-xl transition-all shadow-sm">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">COGS</span>
                                    <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(props.cogsMonth, props.currency)}</p>
                                    <span className="text-[10px] text-gray-500 dark:text-slate-500 mt-1 block">Sales: {formatCurrency(props.netRevenueMonth, props.currency)}</span>
                                </a>
                                <a href={`/admin/${props.slug}/finance`} className="p-4 bg-white dark:bg-slate-800/80 hover:bg-gray-50 dark:hover:bg-slate-700/80 border border-gray-100 dark:border-slate-700/60 rounded-xl transition-all shadow-sm">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">Receivables</span>
                                    <p className="text-lg sm:text-xl font-black text-cyan-600 dark:text-cyan-400">{formatCurrency(props.accountsReceivableTotal, props.currency)}</p>
                                    <span className="text-[10px] text-cyan-700 dark:text-cyan-500 mt-1 block">{props.overdueInvoicesCount} overdue invoice(s)</span>
                                </a>
                                <a href={`/admin/${props.slug}/finance`} className="p-4 bg-white dark:bg-slate-800/80 hover:bg-gray-50 dark:hover:bg-slate-700/80 border border-gray-100 dark:border-slate-700/60 rounded-xl transition-all shadow-sm">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">Payables</span>
                                    <p className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">{formatCurrency(props.accountsPayableTotal, props.currency)}</p>
                                    <span className="text-[10px] text-purple-700 dark:text-purple-500 mt-1 block">{props.pendingSupplierBillsCount} open bill(s)</span>
                                </a>
                            </div>
                        </div>

                        {/* KPI Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {dataCards.map((card, idx) => (
                                <motion.div key={card.title} custom={idx} variants={cardVariants} initial="hidden" animate="visible">
                                    <DashboardCard {...card} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Area */}
                        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                            <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700/50">
                                <h2 className="text-lg sm:text-xl font-black mb-4 text-gray-900 dark:text-white">Sales This Week 📈</h2>
                                <SimpleBarChart data={props.salesLast7Days} currency={props.currency} />
                            </div>
                            <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700/50">
                                <h2 className="text-lg sm:text-xl font-black mb-4 text-gray-900 dark:text-white">Activity Breakdown 📊</h2>
                                <ActivityDonutChart data={props.activityBreakdown} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar / Lists Area */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full xl:w-1/3 space-y-6 lg:space-y-8">
                        
                        {/* Tasks */}
                        <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700/50">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Today's Focus</h3>
                                <a href={`/admin/${props.slug}/tasks`} className="py-2 px-4 text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all min-h-[36px] flex items-center">View All</a>
                            </div>
                            <div className="space-y-3">
                                {props.pendingTasksList?.length > 0 ? props.pendingTasksList?.map((task, i) => (
                                    <motion.a key={task.id} href={`/admin/${props.slug}/tasks/${task.id}`} className="block group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.3 }}>
                                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all flex items-center border border-gray-100 dark:border-slate-700">
                                            <ClipboardDocumentListIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                            <div className='flex-1 overflow-hidden'>
                                                <h4 className="font-semibold text-sm text-gray-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">{task.taskName}</h4>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-4 text-gray-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </motion.a>
                                )) : (
                                    <div className="text-center py-6 text-sm text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                                        🎉 No urgent tasks. Great job!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700/50">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Recent Orders</h3>
                                <a href={`/admin/${props.slug}/orders`} className="py-2 px-4 text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all min-h-[36px] flex items-center">View All</a>
                            </div>
                            <div className="space-y-3">
                                {props.recentOrders?.length > 0 ? props.recentOrders?.map((order, i) => (
                                    <motion.a key={order.id} href={`/admin/${props.slug}/orders/${order.id}`} className="block group" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.4 }}>
                                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all flex items-center gap-4 border border-gray-100 dark:border-slate-700">
                                            <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-semibold text-sm text-gray-800 dark:text-slate-200 truncate">{order.name || `Order #${order.id.slice(-6)}`}</h4>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{formatCurrency(order.totalPrice || 0, props.currency)}</p>
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 flex-shrink-0">{order.status}</span>
                                        </div>
                                    </motion.a>
                                )) : (
                                    <div className="text-center py-6 text-sm text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                                        No recent orders yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Active Promotions */}
                        <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700/50">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Active Promos</h3>
                                <a href={`/admin/${props.slug}/promotions`} className="py-2 px-4 text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all min-h-[36px] flex items-center">Manage</a>
                            </div>
                            <div className="space-y-3">
                                {props.activePromotions?.length > 0 ? props.activePromotions?.map((promo, i) => (
                                    <motion.a key={promo.id} href={`/admin/${props.slug}/promotions/${promo.id}`} className="block group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.5 }}>
                                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all flex items-center gap-3 border border-gray-100 dark:border-slate-700">
                                            <TagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 dark:text-pink-400 flex-shrink-0" />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-semibold text-sm text-gray-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">{promo.title}</h4>
                                                {promo.badgeText && <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-slate-400 mt-1">{promo.badgeText}</p>}
                                            </div>
                                            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-auto text-gray-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </motion.a>
                                )) : (
                                    <div className="text-center py-6 text-sm text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                                        No active promotions.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}