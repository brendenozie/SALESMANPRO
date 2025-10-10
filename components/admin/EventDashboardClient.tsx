"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  BanknotesIcon,
  BellAlertIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  BoltIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

// Framer Motion variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

// Data structure for type safety and initial state
interface Activity {
    id: string;
    type: string;
    description: string;
    time: string;
}

interface Event {
    id: string;
    name: string;
    date: string;
    ticketsSold: number;
}

interface DashboardData {
    totalEvents: number;
    upcomingEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    recentActivities: Activity[];
    upcomingEventsList: Event[];
}

export default function AdminDashboard({ params }: { params: { adminSlug: string } }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (adminSlug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/dashboard/${adminSlug}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
          throw new Error(result.data?.message || 'Failed to fetch dashboard data');
      }
      setDashboardData(result.data);

    } catch (err: any) {
      setError(err.message);
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.adminSlug) {
      fetchDashboardData(params.adminSlug);
    }
  }, [params.adminSlug, fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-cyan-400 flex flex-col items-center justify-center p-8">
        <ArrowPathIcon className="w-16 h-16 animate-spin text-cyan-500 mb-4" />
        <p className="text-xl font-semibold">Initializing Command Center...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-950 text-red-500 p-8 sm:p-12 flex flex-col items-center justify-center">
        <ExclamationCircleIcon className="w-20 h-20 mb-6" />
        <h2 className="text-3xl font-bold mb-4">SYSTEM OFFLINE: Error Loading Data</h2>
        <p className="text-lg text-center text-red-400">{error || "Could not retrieve dashboard data."}</p>
        <p className="text-sm text-gray-500 mt-2">Check API connection or try refreshing the page.</p>
      </div>
    );
  }

  const { totalRevenue, totalEvents, upcomingEvents, totalTicketsSold, recentActivities, upcomingEventsList } = dashboardData;
  const hasRecentActivities = recentActivities?.length > 0;
  const hasUpcomingEvents = upcomingEventsList?.length > 0;

  // --- Components for Reuse ---

  const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; accentClass: string; delay: number; link: string; }> = 
    ({ title, value, icon: Icon, accentClass, delay, link }) => (
      <motion.a 
        variants={cardVariants} 
        initial="hidden" 
        animate="visible" 
        transition={{ delay }} 
        href={link}
        className={`bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 transition duration-300 hover:shadow-2xl hover:border-cyan-500 flex flex-col justify-between cursor-pointer group`}
      >
        <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <Icon className={`w-8 h-8 ${accentClass} opacity-70 group-hover:opacity-100 transition-opacity`} />
        </div>
        <h2 className="text-4xl font-extrabold text-white leading-none">{value}</h2>
        <div className="flex justify-end mt-4">
            <ArrowRightIcon className={`w-5 h-5 text-gray-500 group-hover:${accentClass.replace('text-', 'text-')} transition-colors`} />
        </div>
      </motion.a>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="mb-12 border-b border-gray-800 pb-6"
        >
          <p className="text-xl text-cyan-400 font-semibold mb-1">Status: Operational</p>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Command Center</span>
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Monitoring real-time performance for admin slug: <span className="text-cyan-400 font-mono">{params.adminSlug}</span>
          </p>
        </motion.header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            <motion.div 
                variants={cardVariants} 
                initial="hidden" 
                animate="visible" 
                transition={{ delay: 0.3 }}
                className="bg-gray-800 p-8 rounded-3xl shadow-2xl border-l-8 border-green-500 flex flex-col justify-between transition duration-500 hover:bg-gray-700/50"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <BanknotesIcon className="w-10 h-10 text-green-400 mr-3" />
                        <p className="text-lg text-gray-300 font-semibold">Total Revenue Generated</p>
                    </div>
                </div>
                <h2 className="text-6xl font-black text-white leading-tight mb-2">
                    ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className="text-sm text-gray-500">All-time tracked earnings across all events.</p>
                <a href="/admin/finance" className="mt-6 text-green-400 hover:text-green-300 text-base font-semibold flex items-center group">
                    Detailed Finance Report <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
                <MetricCard title="Total Events" value={totalEvents || 0} icon={CalendarIcon} accentClass="text-indigo-400" delay={0.4} link="/admin/events" />
                <MetricCard title="Upcoming" value={upcomingEvents || 0} icon={BellAlertIcon} accentClass="text-cyan-400" delay={0.5} link="/admin/events/upcoming" />
                <MetricCard title="Tickets Sold" value={(totalTicketsSold || 0).toLocaleString()} icon={TicketIcon} accentClass="text-pink-400" delay={0.6} link="/admin/tickets" />
                <MetricCard title="Total Participants" value={(totalTicketsSold || 0).toLocaleString()} icon={UsersIcon} accentClass="text-yellow-400" delay={0.7} link="/admin/users" />
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="lg:col-span-1 bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-3">
                    <BoltIcon className="w-6 h-6 text-pink-400" /> Recent Activity Log
                </h3>
                {hasRecentActivities ? (
                    <ul className="space-y-4">
                        {recentActivities.map((activity: Activity) => (
                            <li key={activity.id} className="p-3 bg-gray-900 rounded-lg border-l-4 border-pink-500 hover:bg-gray-700/50 transition">
                                <p className="text-white font-medium text-sm">
                                    <span className="font-bold text-pink-400 uppercase mr-1">{activity.type}:</span> {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 text-gray-400 italic flex flex-col items-center">
                        <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
                        <p>System is quiet. No recent activities.</p>
                    </div>
                )}
            </motion.div>

            <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.9 }} className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-3">
                    <CalendarIcon className="w-6 h-6 text-cyan-400" /> Upcoming Event Pipeline
                </h3>
                {hasUpcomingEvents ? (
                    <ul className="space-y-4">
                        {upcomingEventsList.map((event: Event) => (
                            <li key={event.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition duration-300">
                                <div className='flex flex-col sm:flex-row sm:items-center'>
                                    <p className="text-white text-lg font-semibold mr-4">{event.name}</p>
                                    <p className="text-sm text-gray-400 flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-1 text-cyan-400" />
                                        {event.date}
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div className="text-base text-gray-300">
                                        <span className="text-cyan-400 font-bold text-xl">{event.ticketsSold.toLocaleString()}</span> sold
                                    </div>
                                    <a href={`/admin/${params.adminSlug}/events/${event.id}`} className="px-4 py-2 bg-indigo-600 rounded-full text-white text-sm font-medium hover:bg-indigo-700 transition flex items-center">
                                        Manage <ArrowRightIcon className="ml-2 w-4 h-4" />
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 text-gray-400 italic flex flex-col items-center">
                        <LightBulbIcon className="w-12 h-12 mb-4 text-gray-600" />
                        <p>No new missions scheduled. Time to create some events!</p>
                    </div>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
}