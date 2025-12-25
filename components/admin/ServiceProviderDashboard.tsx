'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    CalendarDaysIcon,
    UsersIcon,
    HeartIcon,
    ClockIcon,
    ArrowRightIcon,
    ChartBarIcon,
    StarIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

// --- TYPE DEFINITIONS ---


export interface ServiceProviderDashboardData {
    stats: {
        newBookings: number;
        activeClients: number;
        feedbackReceived: number;
        hoursWorked: number;
    };
    alerts: {
        pendingTasks: number;
    };
    lists: {
        upcomingBookings: {
            id: string;
            title: string | null;
            clientName: string;
            startTime: string | undefined;
        }[];
        recentFeedback: {
            id: string;
            quote: string;
            authorName: string | null;
            rating: number | null;
        }[];
    };
    charts: {
        serviceTrends: { name: string; value: number }[];
        clientEngagement: {
            PENDING: number;
            CONFIRMED: number;
            COMPLETED: number;
            CANCELLED: number;
        };
    };
}

// --- MOCK DATA (for standalone development/testing) ---
const mockData: ServiceProviderDashboardData = {
    stats: {
        newBookings: 24,
        activeClients: 112,
        feedbackReceived: 56,
        hoursWorked: 143,
    },
    alerts: {
        pendingTasks: 3,
    },
    lists: {
        upcomingBookings: [
            { id: '1', title: 'Deep Tissue Massage', clientName: 'Jane Doe', startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
            { id: '2', title: 'Consultation', clientName: 'John Smith', startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
            { id: '3', title: 'Follow-up Session', clientName: 'Alice Johnson', startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        recentFeedback: [
            { id: 'f1', quote: "Absolutely fantastic service, highly recommend!", authorName: 'Emily White', rating: 5 },
            { id: 'f2', quote: "Very professional and helpful.", authorName: 'Michael Brown', rating: 5 },
            { id: 'f3', quote: "Good experience overall, will be back.", authorName: 'Sarah Green', rating: 4 },
        ]
    },
    charts: {
        serviceTrends: [
            { name: 'Mon', value: 5 }, { name: 'Tue', value: 8 }, { name: 'Wed', value: 6 },
            { name: 'Thu', value: 10 }, { name: 'Fri', value: 12 }, { name: 'Sat', value: 15 },
            { name: 'Sun', value: 7 },
        ],
        clientEngagement: {
            PENDING: 15,
            CONFIRMED: 40,
            COMPLETED: 120,
            CANCELLED: 8,
        },
    }
};

// --- CHART COMPONENTS (Self-contained) ---

const ServiceTrendsChart = ({ data }: { data: { name: string; value: number }[] }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="h-60 w-full flex items-end justify-around gap-2 pt-4">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative h-full">
                    <div className="w-full h-full flex items-end">
                     <motion.div
                        className="w-full bg-cyan-500 rounded-t-md transition-colors group-hover:bg-cyan-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.value / maxValue) * 100}%` }}
                        transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
                     />
                    </div>
                    <span className="text-xs text-gray-400 mt-2">{item.name}</span>
                </div>
            ))}
        </div>
    );
};

const ClientEngagementDonut = ({ data }: { data: ServiceProviderDashboardData['charts']['clientEngagement'] }) => {
    const engagementData = [
        { name: 'Completed', value: data.COMPLETED, color: 'stroke-green-500' },
        { name: 'Confirmed', value: data.CONFIRMED, color: 'stroke-cyan-500' },
        { name: 'Pending', value: data.PENDING, color: 'stroke-yellow-500' },
        { name: 'Cancelled', value: data.CANCELLED, color: 'stroke-red-500' },
    ];
    const total = engagementData.reduce((sum, item) => sum + item.value, 0);
    let offset = 0;
    
    return (
        <div className="h-60 w-full flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="relative w-36 h-36">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" className="stroke-current text-gray-800" strokeWidth="3" fill="transparent" />
                     {engagementData.map((item, index) => {
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const currentOffset = offset;
                        offset += percentage;
                        return (
                           <motion.circle
                                key={index}
                                cx="18" cy="18" r="15.9155"
                                className={item.color}
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray="0 100"
                                strokeDashoffset={-currentOffset}
                                animate={{ strokeDasharray: `${percentage} ${100 - percentage}` }}
                                transition={{ duration: 0.7, delay: index * 0.15, ease: "circOut" }}
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
            <div className="flex flex-col gap-2">
                {engagementData.map(item => (
                    <div key={item.name} className="flex items-center text-sm">
                        <span className={`w-3 h-3 rounded-full mr-3 ${item.color.replace('stroke-', 'bg-')}`}></span>
                        <span className="text-gray-300">{item.name}</span>
                        <span className="ml-auto font-semibold text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---

export default function ServiceProviderDashboard({ data = mockData }: { data?: ServiceProviderDashboardData }) {

    const stats = [
        { title: 'New Bookings', value: data.stats.newBookings, icon: CalendarDaysIcon, color: 'text-cyan-400', bg: 'bg-cyan-900/40 border border-cyan-800/50', href: '/appointments' },
        { title: 'Active Clients', value: data.stats.activeClients, icon: UsersIcon, color: 'text-green-400', bg: 'bg-green-900/40 border border-green-800/50', href: '/clients' },
        { title: 'Feedback This Month', value: data.stats.feedbackReceived, icon: HeartIcon, color: 'text-pink-400', bg: 'bg-pink-900/40 border border-pink-800/50', href: '/feedback' },
        { title: 'Hours This Month', value: data.stats.hoursWorked, icon: ClockIcon, color: 'text-yellow-400', bg: 'bg-yellow-900/40 border border-yellow-800/50', href: '/timesheet' },
    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 overflow-hidden p-4 sm:p-6 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Welcome Back 👋</h1>
                        <p className="text-gray-400 text-lg">Here’s your service overview and performance summary.</p>
                    </div>
                    <Link href="/profile" className="mt-4 sm:mt-0 inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30">
                        Manage Profile
                    </Link>
                </motion.header>
                
                {data.alerts.pendingTasks > 0 && (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 sm:p-5 bg-amber-900/30 border border-amber-700/40 text-amber-300 rounded-xl shadow-md">
                    <div className="flex items-center gap-3">
                        <WrenchScrewdriverIcon className="w-6 h-6 text-amber-400 animate-pulse" />
                        <p className="text-sm sm:text-base">
                            <b>Reminder:</b> {data.alerts.pendingTasks} pending task(s) need your attention.
                        </p>
                        <Link href="/tasks" className="ml-auto text-amber-400 hover:text-amber-300 font-semibold text-sm whitespace-nowrap">
                            View Tasks →
                        </Link>
                    </div>
                 </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            custom={i}
                            variants={{ hidden: { opacity: 0, y: 25 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 + 0.1 } }) }}
                            initial="hidden"
                            animate="visible"
                            className={`rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer group ${stat.bg}`}
                        >
                            <Link href={stat.href}>
                                <div className="flex items-center justify-between">
                                    <div className={`p-3 rounded-full bg-gray-800/60 ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
                                </div>
                                <h4 className="mt-4 text-gray-400 text-sm uppercase font-semibold tracking-wide">{stat.title}</h4>
                                <p className={`text-3xl font-extrabold ${stat.color} mt-2`}>{stat.value}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Main Content: Charts & Upcoming */}
                     <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-gray-900/70 rounded-2xl shadow-xl border border-gray-800">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <ChartBarIcon className="w-5 h-5 text-cyan-400" /> Daily Bookings
                                </h3>
                                <ServiceTrendsChart data={data.charts.serviceTrends} />
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 bg-gray-900/70 rounded-2xl shadow-xl border border-gray-800">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <StarIcon className="w-5 h-5 text-pink-400" /> Booking Status
                                </h3>
                                <ClientEngagementDonut data={data.charts.clientEngagement} />
                            </motion.div>
                        </div>
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 bg-gray-900/70 rounded-2xl shadow-xl border border-gray-800">
                             <h3 className="text-lg font-semibold text-white mb-4">Upcoming Appointments</h3>
                             <div className="space-y-3">
                                 {data.lists.upcomingBookings.map(booking => (
                                     <div key={booking.id} className="p-3 bg-gray-800/50 rounded-lg flex items-center justify-between hover:bg-gray-800 transition-colors">
                                         <div>
                                             <p className="font-medium text-gray-200">{booking.title || 'Appointment'}</p>
                                             <p className="text-sm text-gray-400">{booking.clientName}</p>
                                         </div>
                                         <p className="text-sm text-gray-400">{booking.startTime ? new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
                                     </div>
                                 ))}
                             </div>
                         </motion.div>
                     </div>

                    {/* Sidebar: Feedback */}
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-1 p-6 bg-gray-900/70 rounded-2xl shadow-xl border border-gray-800">
                         <h3 className="text-lg font-semibold text-white mb-4">Recent Feedback</h3>
                         <div className="space-y-4">
                              {data.lists.recentFeedback.map(fb => (
                                <div key={fb.id} className="p-4 bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < (fb.rating || 0) ? 'fill-current' : ''}`} />)}
                                        </div>
                                    </div>
                                    <p className="text-gray-300 italic text-sm">"{fb.quote}"</p>
                                    <p className="text-right text-xs text-gray-400 mt-2">- {fb.authorName}</p>
                                </div>
                              ))}
                         </div>
                     </motion.div>
                </div>

            </div>
        </div>
    );
}
