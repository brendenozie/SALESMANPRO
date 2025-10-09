'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
} from '@heroicons/react/24/outline';
// NOTE: These components must exist in your project setup for this code to run.
import CountUp from './CountUp'; 
import SimpleBarChart from './SimpleBarChart';
import ActivityDonutChart from './ActivityDonutChart';


// --- TYPES & INTERFACES (UNCHANGED) ---
export interface DashboardData {
    slug: string;
    companyName: string;
    currency: string;
    todaySales: number;
    completedOrdersToday: number;
    averageOrderValueToday: number;
    newClients: number;
    commissionEarned: number;
    totalRevenueMonth: number;
    monthlyTarget: number;
    monthlyTargetProgress: number;
    lowStock: number;
    overdueTasksCount: number;
    activityBreakdown: {
        pendingOrders: number;
        pendingRequests: number;
        openTasks: number;
    };
    topAgent: { name: string; totalSales: number };
    communicationsToday: number;
    pendingTasksList: { id: string; taskName: string; dueDate: string }[];
    recentOrders: { id: string; name: string | null; status: string; totalPrice: number | null }[];
    activePromotions: { id: string; title: string; description: string | null; badgeText: string | null }[];
    salesLast7Days: { name: string; total: number }[];
    totalClients: number;
}

// --- HELPER FUNCTIONS (UNCHANGED) ---
const formatCurrency = (amount: number, currency: string) => {
    // Note: Ensuring the currency formatting uses a comma separator helps keep the number tighter on a single line
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
};

// --- COLOR PALETTE (Vibrant Dark Mode for High-Contrast) ---
const COLOR_PALETTE = {
    sales: { color: 'text-cyan-400', border: 'border-cyan-500/50', iconBg: 'bg-cyan-900/50', bar: 'bg-cyan-500' },
    revenue: { color: 'text-pink-400', border: 'border-pink-500/50', iconBg: 'bg-pink-900/50', bar: 'bg-pink-500' },
    orders: { color: 'text-emerald-400', border: 'border-emerald-500/50', iconBg: 'bg-emerald-900/50', bar: 'bg-emerald-500' },
    clients: { color: 'text-green-400', border: 'border-green-500/50', iconBg: 'bg-green-900/50', bar: 'bg-green-500' },
    agent: { color: 'text-yellow-400', border: 'border-yellow-500/50', iconBg: 'bg-yellow-900/50', bar: 'bg-yellow-500' },
    stock: { color: 'text-red-400', border: 'border-red-500/50', iconBg: 'bg-red-900/50', bar: 'bg-red-500' },
    tasks: { color: 'text-amber-400', border: 'border-amber-500/50', iconBg: 'bg-amber-900/50', bar: 'bg-amber-500' },
    avg: { color: 'text-indigo-400', border: 'border-indigo-500/50', iconBg: 'bg-indigo-900/50', bar: 'bg-indigo-500' },
};

// --- DASHBOARD CARD PROPS ---
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

// --- DASHBOARD CARD COMPONENT (FIXED HEIGHT & VALUE CONSISTENCY) ---
const DashboardCard = ({ href, title, icon: Icon, value, formatValue, progress, footerText, color, border, iconBg, bar }: DashboardCardProps) => {
    const isDanger = title === 'Low Stock Items' || title === 'Overdue Tasks';
    const progressPercent = Math.min(Math.max(progress || 0, 0), 100);
    const hasProgress = progress !== undefined;

    return (
        // UPDATE: Increased min-h to min-h-[15rem] (240px) to ensure the 4xl value always fits on one line and maintains vertical consistency.
        <a href={href} className={`flex flex-col justify-between p-6 rounded-xl transition-all transform hover:scale-[1.02] group relative overflow-hidden cursor-pointer bg-gray-800/80 border ${border} hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-gray-800/90 ${isDanger ? 'ring-2 ring-red-500' : ''} min-h-[15rem]`}>
            
            {/* Top Border Accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${bar} transition-all duration-300`}></div> 
            
            <div className='flex flex-col gap-4'>
                <div className="flex items-center justify-between">
                    {/* ICON: Dark background, bright icon color */}
                    <div className={`p-3 rounded-full shadow-lg ${iconBg} ${color} transition-all duration-300`}>
                        <Icon className={`w-5 h-5`} />
                    </div>
                    <h3 className="text-xs font-medium uppercase text-gray-400">{title}</h3>
                </div>
                
                <div className=''>
                    {/* VALUE: Uses flex-nowrap to aggressively discourage wrapping if possible */}
                    <div className={`text-xl font-extrabold ${color} whitespace-nowrap overflow-hidden text-ellipsis`}>
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
                            <div className={`${bar} absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out`} style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                )}
                
                {/* FOOTER: Minimal and action-focused */}
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

// --- MAIN DASHBOARD COMPONENT (UNCHANGED LAYOUT) ---

export default function EcomDashboardClient(props: DashboardData) {

    // --- Data Cards Initialization (using new COLOR_PALETTE) ---
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
            formatValue: (val: number) => `${formatCurrency(val, props.currency)} / ${formatCurrency(props.monthlyTarget, props.currency)}`,
            progress: props.monthlyTargetProgress,
            footerText: 'Analyze Performance',
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
            href: `/admin/${props.slug}/customers`,
            title: 'New Clients Today',
            icon: UsersIcon,
            value: props.newClients,
            footerText: `of ${props.totalClients} total`,
            ...COLOR_PALETTE.clients,
        },
        {
            href: `/admin/${props.slug}/agents`,
            title: 'Top Agent: ' + props.topAgent?.name,
            icon: ChartBarIcon,
            value: props.topAgent?.totalSales,
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
    ];
    // --- End Data Cards Initialization ---

    return (
        <div className="font-sans bg-gray-900 text-gray-100 min-h-screen p-4 sm:p-6 lg:p-10 transition-colors duration-500">
            
            {/* Minimal Background Effect (Removed Blobs, kept conceptual depth) */}
            <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-color-gray-800)_0%,_var(--tw-color-gray-900)_100%)]"></div>

            <div className="relative z-10 max-w-screen-xl mx-auto">
                
                {/* Header (Sharp and Focused) */}
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
                        {props.companyName} Control Center
                    </h1>
                    {/* Sharp accent line */}
                    <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full mb-3"></div>
                    <p className="text-lg text-gray-400 font-light">
                        Actionable summary for **{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}**.
                    </p>
                </motion.header>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Main Content Area */}
                    <div className="w-full lg:w-2/3 space-y-8">
                        
                        {/* Action Alerts Section (Sharp/Elevated) */}
                        <div className="space-y-4">
                            {/* Overdue Tasks Alert */}
                            {props.overdueTasksCount > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center p-4 rounded-xl bg-amber-900/40 text-amber-300 shadow-xl border border-amber-700/50">
                                    <ClockIcon className="w-6 h-6 mr-4 text-amber-400 animate-pulse" />
                                    <p className="text-sm font-medium flex-1">
                                        <b>Action Required:</b> **{props.overdueTasksCount}** overdue task(s).
                                    </p>
                                    <a href={`/admin/${props.slug}/tasks`} className="ml-4 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                                        Resolve Now <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}

                            {/* Low Stock Alert */}
                            {props.lowStock > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center p-4 rounded-xl bg-red-900/40 text-red-300 shadow-xl border border-red-700/50">
                                    <ExclamationTriangleIcon className="w-6 h-6 mr-4 text-red-400 animate-pulse" />
                                    <p className="text-sm font-medium flex-1">
                                        <b>Critical Alert:</b> **{props.lowStock}** products are low on stock.
                                    </p>
                                    <a href={`/admin/${props.slug}/inventory`} className="ml-4 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
                                        Restock Now <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}
                        </div>

                        {/* KPI Cards Grid (Uniform Dark Style) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {dataCards.map((card, idx) => (
                                <motion.div key={card.title} custom={idx} variants={cardVariants} initial="hidden" animate="visible">
                                    <DashboardCard {...card} /> 
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* Charts Section (Flat Dark Panels) */}
                        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                            {/* Sales Chart Panel */}
                            <div className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50">
                                <h2 className="text-xl font-bold mb-4 text-white">Sales This Week 📈</h2>
                                <SimpleBarChart data={props.salesLast7Days} currency={props.currency} />
                            </div>
                            {/* Activity Chart Panel */}
                            <div className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50">
                                <h2 className="text-xl font-bold mb-4 text-white">Activity Breakdown 📊</h2>
                                <ActivityDonutChart data={props.activityBreakdown} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar Area (Tasks & Orders) */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="w-full lg:w-1/3 space-y-8">
                        
                        {/* Today's Focus Panel */}
                        <div className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-white">Today's Focus</h3>
                                <a href={`/admin/${props.slug}/tasks`} className="py-1 px-3 text-xs font-semibold bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all">View All</a>
                            </div>
                            <div className="space-y-3">
                                {props.pendingTasksList?.length > 0 ? props.pendingTasksList?.map((task, i) => (
                                    <motion.a key={task.id} href={`/admin/${props.slug}/tasks/${task.id}`} className="block group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.5 }}>
                                        {/* Task Item Refinement */}
                                        <div className="p-3 rounded-lg hover:bg-gray-700/70 transition-all flex items-center border border-gray-700">
                                            <ClipboardDocumentListIcon className="w-5 h-5 mr-3 text-amber-400 flex-shrink-0" />
                                            <div className='flex-1'>
                                                <h4 className="font-medium text-gray-200 group-hover:text-white transition-colors">{task.taskName}</h4>
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

                        {/* Recent Orders Panel */}
                        <div className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-white">Recent Orders</h3>
                                <a href={`/admin/${props.slug}/orders`} className="py-1 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all">View All</a>
                            </div>
                            <div className="space-y-3">
                                {props.recentOrders?.length > 0 ? props.recentOrders?.map((order, i) => (
                                    <motion.a key={order.id} href={`/admin/${props.slug}/orders/${order.id}`} className="block" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.8 }}>
                                        {/* Order Item Refinement */}
                                        <div className="p-3 rounded-lg hover:bg-gray-700/70 transition-all flex items-center gap-4 border border-gray-700">
                                        <ShoppingCartIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-200">{order.name || `Order #${order.id.slice(-6)}`}</h4>
                                            <p className="text-sm text-gray-500">{formatCurrency(order.totalPrice || 0, props.currency)}</p>
                                        </div>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300">{order.status}</span>
                                        <ArrowRightIcon className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-transform" />
                                        </div>
                                    </motion.a>
                                )) : (
                                    <div className="text-center py-4 text-gray-500 bg-gray-700/50 rounded-lg">No recent orders yet.</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}