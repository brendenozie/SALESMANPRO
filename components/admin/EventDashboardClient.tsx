"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  BanknotesIcon,
  BellAlertIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  ArrowPathIcon, // For loading spinner
} from '@heroicons/react/24/outline';

// Framer Motion variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function AdminDashboard({ adminSlug = 'your-org-slug' }: { adminSlug?: string }) {
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/${adminSlug}/dashboard-summary`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch dashboard data.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (adminSlug) {
      fetchDashboardData();
    }
  }, [adminSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 flex items-center justify-center">
        <ArrowPathIcon className="w-16 h-16 animate-spin text-indigo-500" />
        <p className="ml-4 text-xl">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-red-400 p-8 sm:p-12 flex flex-col items-center justify-center">
        <ExclamationCircleIcon className="w-20 h-20 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Error Loading Dashboard</h2>
        <p className="text-lg text-center">{error}</p>
        <p className="text-sm text-gray-400 mt-2">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  const hasEvents = dashboardData?.totalEvents > 0;
  const hasRecentActivities = dashboardData?.recentActivities?.length > 0;
  const hasUpcomingEvents = dashboardData?.upcomingEventsList?.length > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Dashboard</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-300 mb-12"
        >
          Welcome back, Organizer! Here's a quick overview of your event performance.
        </motion.p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Events</p>
              <h2 className="text-3xl font-bold text-white">{dashboardData?.totalEvents || 0}</h2>
            </div>
            <CalendarIcon className="w-12 h-12 text-indigo-400 opacity-70" />
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Upcoming Events</p>
              <h2 className="text-3xl font-bold text-white">{dashboardData?.upcomingEvents || 0}</h2>
            </div>
            <HomeIcon className="w-12 h-12 text-purple-400 opacity-70" />
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tickets Sold</p>
              <h2 className="text-3xl font-bold text-white">{(dashboardData?.totalTicketsSold || 0).toLocaleString()}</h2>
            </div>
            <TicketIcon className="w-12 h-12 text-pink-400 opacity-70" />
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <h2 className="text-3xl font-bold text-white">${(dashboardData?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
            <BanknotesIcon className="w-12 h-12 text-green-400 opacity-70" />
          </motion.div>
        </div>

        {/* Recent Activities & Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }} className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Activities</h3>
            {hasRecentActivities ? (
              <ul className="space-y-4">
                {dashboardData.recentActivities.map((activity: any) => (
                  <li key={activity.id} className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <BellAlertIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-medium">{activity.type}: <span className="text-gray-300">{activity.description}</span></p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-400 italic flex flex-col items-center">
                <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
                <p>No recent activities to display.</p>
                <p className="text-sm">Start managing events to see updates here.</p>
              </div>
            )}
          </motion.div>

          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Upcoming Events</h3>
            {hasUpcomingEvents ? (
              <ul className="space-y-4">
                {dashboardData.upcomingEventsList.map((event: any) => (
                  <li key={event.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-white font-medium">{event.name}</p>
                      <p className="text-sm text-gray-400">{event.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-lg font-semibold">{event.ticketsSold} <span className="text-sm text-gray-400">sold</span></p>
                      <a href={`/admin/${adminSlug}/events/${event.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center mt-1">
                        View Event <ArrowRightIcon className="ml-1 w-4 h-4" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-400 italic flex flex-col items-center">
                <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
                <p>No upcoming events scheduled.</p>
                <p className="text-sm">Create a new event to see it listed here.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
