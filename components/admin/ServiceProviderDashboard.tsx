'use client';

import React, { useState, useEffect } from 'react';
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
  SunIcon,
  MoonIcon,
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

// --- CHART COMPONENTS (Self-contained & Responsive) ---

const ServiceTrendsChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="h-48 sm:h-56 md:h-60 w-full flex items-end justify-between gap-1.5 sm:gap-3 pt-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
          {/* Hover Tooltip */}
          <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-gray-800 text-white dark:text-gray-100 text-[10px] sm:text-xs py-1 px-2 rounded shadow-md pointer-events-none z-20 whitespace-nowrap">
            {item.value} bookings
          </div>
          <div className="w-full h-full flex items-end">
            <motion.div
              className="w-full bg-cyan-500 dark:bg-cyan-400 rounded-t-md transition-colors group-hover:bg-cyan-600 dark:group-hover:bg-cyan-300"
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 mt-2 font-medium">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

const ClientEngagementDonut = ({ data }: { data: ServiceProviderDashboardData['charts']['clientEngagement'] }) => {
  const engagementData = [
    { name: 'Completed', value: data.COMPLETED, color: 'stroke-emerald-500', bg: 'bg-emerald-500' },
    { name: 'Confirmed', value: data.CONFIRMED, color: 'stroke-cyan-500', bg: 'bg-cyan-500' },
    { name: 'Pending', value: data.PENDING, color: 'stroke-amber-500', bg: 'bg-amber-500' },
    { name: 'Cancelled', value: data.CANCELLED, color: 'stroke-rose-500', bg: 'bg-rose-500' },
  ];
  const total = engagementData.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  return (
    <div className="min-h-[200px] w-full flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-6 py-2">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <circle 
            cx="18" 
            cy="18" 
            r="15.9155" 
            className="stroke-slate-200 dark:stroke-gray-800" 
            strokeWidth="3.2" 
            fill="transparent" 
          />
          {engagementData.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const currentOffset = offset;
            offset += percentage;
            return (
              <motion.circle
                key={index}
                cx="18" 
                cy="18" 
                r="15.9155"
                className={item.color}
                strokeWidth="3.2"
                strokeLinecap="round"
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
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-none">{total}</span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-gray-400 mt-0.5">Total</span>
        </div>
      </div>

      <div className="w-full sm:w-auto flex flex-wrap sm:flex-col justify-center gap-2.5 sm:gap-2">
        {engagementData.map(item => (
          <div key={item.name} className="flex items-center text-xs sm:text-sm min-w-[110px] sm:min-w-[130px]">
            <span className={`w-2.5 h-2.5 rounded-full mr-2 shrink-0 ${item.bg}`}></span>
            <span className="text-slate-600 dark:text-gray-300 font-medium">{item.name}</span>
            <span className="ml-auto font-semibold text-slate-900 dark:text-white pl-2">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

type Props = Partial<ServiceProviderDashboardData> & {
  slug?: string;
};

export default function ServiceProviderDashboard({
  stats = mockData.stats,
  alerts = mockData.alerts,
  lists = mockData.lists,
  charts = mockData.charts,
  slug = 'default-service-provider',
}: Props) {
  // Theme state: supports light/dark switching and respects user preference
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return next;
    });
  };

  const statsCards = [
    { 
      title: 'New Bookings', 
      value: stats.newBookings, 
      icon: CalendarDaysIcon, 
      color: 'text-cyan-600 dark:text-cyan-400', 
      bg: 'bg-cyan-500/10 dark:bg-cyan-900/30 border-cyan-200/80 dark:border-cyan-800/40', 
      iconBg: 'bg-cyan-500/20 dark:bg-cyan-900/60',
      href: `/admin/${slug}/appointments` 
    },
    { 
      title: 'Active Clients', 
      value: stats.activeClients, 
      icon: UsersIcon, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-500/10 dark:bg-emerald-900/30 border-emerald-200/80 dark:border-emerald-800/40', 
      iconBg: 'bg-emerald-500/20 dark:bg-emerald-900/60',
      href: `/admin/${slug}/storeclients` 
    },
    { 
      title: 'Feedback This Month', 
      value: stats.feedbackReceived, 
      icon: HeartIcon, 
      color: 'text-pink-600 dark:text-pink-400', 
      bg: 'bg-pink-500/10 dark:bg-pink-900/30 border-pink-200/80 dark:border-pink-800/40', 
      iconBg: 'bg-pink-500/20 dark:bg-pink-900/60',
      href: `/admin/${slug}/feedback` 
    },
    { 
      title: 'Hours This Month', 
      value: stats.hoursWorked, 
      icon: ClockIcon, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-500/10 dark:bg-amber-900/30 border-amber-200/80 dark:border-amber-800/40', 
      iconBg: 'bg-amber-500/20 dark:bg-amber-900/60',
      href: `/admin/${slug}/timesheet` 
    },
  ];

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-800'}`}>
      <div className="relative min-h-screen p-3 sm:p-6 lg:p-8 overflow-x-hidden">
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.08),_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-gray-800/80 pb-4 sm:pb-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Welcome Back <span className="inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm lg:text-base mt-1">
                Here’s your service overview and performance summary.
              </p>
            </div>

            {/* Light / Dark Mode Toggle */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2.5 rounded-xl bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-800 shadow-sm hover:bg-slate-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer"
              >
                {isDark ? (
                  <>
                    <SunIcon className="w-5 h-5 text-amber-400" />
                    <span className="hidden xs:inline">Light Mode</span>
                  </>
                ) : (
                  <>
                    <MoonIcon className="w-5 h-5 text-indigo-600" />
                    <span className="hidden xs:inline">Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </motion.header>

          {/* Pending Tasks Alert Banner */}
          {alerts.pendingTasks > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="p-3.5 sm:p-4 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                  <p className="text-xs sm:text-sm font-medium truncate">
                    <span className="font-bold">Reminder:</span> {alerts.pendingTasks} pending task(s) need your attention.
                  </p>
                </div>
                <Link 
                  href={`/admin/${slug}/tasks`} 
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold text-xs sm:text-sm whitespace-nowrap underline shrink-0"
                >
                  View Tasks →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Key Metrics Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {statsCards.map((stat, i) => (
              <motion.div
                key={stat.title}
                custom={i}
                variants={{ 
                  hidden: { opacity: 0, y: 20 }, 
                  visible: (i: number) => ({ 
                    opacity: 1, 
                    y: 0, 
                    transition: { delay: i * 0.06 + 0.05 } 
                  }) 
                }}
                initial="hidden"
                animate="visible"
                className={`rounded-2xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all border group relative overflow-hidden ${stat.bg}`}
              >
                <Link href={stat.href} className="block">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 sm:p-3 rounded-xl ${stat.iconBg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:translate-x-1" />
                  </div>
                  <h4 className="mt-3 text-slate-500 dark:text-gray-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider truncate">
                    {stat.title}
                  </h4>
                  <p className={`text-xl sm:text-3xl font-extrabold ${stat.color} mt-1`}>
                    {stat.value}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Main Dashboard Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
            
            {/* Left/Main Content Column */}
            <div className="lg:col-span-2 space-y-5 lg:space-y-8">
              
              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Service Trends Chart */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.15 }} 
                  className="p-4 sm:p-6 bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800"
                >
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" /> 
                    Daily Bookings
                  </h3>
                  <ServiceTrendsChart data={charts.serviceTrends} />
                </motion.div>

                {/* Client Engagement Donut Chart */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.25 }} 
                  className="p-4 sm:p-6 bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800"
                >
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-pink-500 dark:text-pink-400" /> 
                    Booking Status
                  </h3>
                  <ClientEngagementDonut data={charts.clientEngagement} />
                </motion.div>
              </div>

              {/* Upcoming Appointments List */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.35 }} 
                className="p-4 sm:p-6 bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Upcoming Appointments</h3>
                  <Link href={`/admin/${slug}/appointments`} className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {lists.upcomingBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors border border-slate-100 dark:border-gray-800/40 gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-gray-100 truncate">
                          {booking.title || 'Appointment'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
                          {booking.clientName}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 shrink-0">
                        {booking.startTime ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column: Feedback Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.45 }} 
              className="lg:col-span-1 p-4 sm:p-6 bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Recent Feedback</h3>
                  <Link href={`/admin/${slug}/feedback`} className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                    See All
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {lists.recentFeedback.map(fb => (
                    <div 
                      key={fb.id} 
                      className="p-3.5 sm:p-4 bg-slate-50 dark:bg-gray-800/50 rounded-xl border border-slate-100 dark:border-gray-800/40"
                    >
                      <div className="flex items-center mb-2">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < (fb.rating || 0) ? 'fill-amber-400' : 'text-slate-300 dark:text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-gray-300 italic text-xs sm:text-sm leading-relaxed">
                        "{fb.quote}"
                      </p>
                      <p className="text-right text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-gray-400 mt-2">
                        — {fb.authorName || 'Anonymous'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}