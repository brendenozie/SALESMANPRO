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
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08 + 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function ServiceProviderDashboard() {
  const stats = [
    {
      title: 'New Bookings',
      value: 24,
      icon: CalendarDaysIcon,
      color: 'text-cyan-400',
      bg: 'bg-cyan-900/40 border border-cyan-800/50',
      href: '/appointments',
    },
    {
      title: 'Active Clients',
      value: 112,
      icon: UsersIcon,
      color: 'text-green-400',
      bg: 'bg-green-900/40 border border-green-800/50',
      href: '/clients',
    },
    {
      title: 'Feedback Received',
      value: 56,
      icon: HeartIcon,
      color: 'text-pink-400',
      bg: 'bg-pink-900/40 border border-pink-800/50',
      href: '/feedback',
    },
    {
      title: 'Hours Worked',
      value: 143,
      icon: ClockIcon,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/40 border border-yellow-800/50',
      href: '/timesheet',
    },
  ];

  const quickActions = [
    { label: 'New Booking', href: '/appointments/new', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { label: 'View Clients', href: '/clients', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Feedback', href: '/feedback', color: 'bg-pink-600 hover:bg-pink-700' },
    { label: 'Settings', href: '/settings', color: 'bg-gray-600 hover:bg-gray-700' },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 overflow-hidden p-4 sm:p-6 lg:p-10">
      {/* Subtle glow gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Welcome Back 👋</h1>
            <p className="text-gray-400 text-lg">Here’s your service overview and performance summary</p>
          </div>
          <Link
            href="/profile"
            className="mt-4 sm:mt-0 inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
          >
            Manage Profile
          </Link>
        </motion.header>

        {/* Alerts Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 sm:p-5 bg-amber-900/30 border border-amber-700/40 text-amber-300 rounded-xl shadow-md"
        >
          <div className="flex items-center gap-3">
            <WrenchScrewdriverIcon className="w-6 h-6 text-amber-400 animate-pulse" />
            <p className="text-sm sm:text-base">
              <b>Reminder:</b> 3 pending maintenance tasks need review today.
            </p>
            <Link href="/tasks" className="ml-auto text-amber-400 hover:text-amber-300 font-semibold text-sm">
              View Tasks →
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              custom={i}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className={`rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer group ${stat.bg}`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-full bg-gray-800/60 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
              </div>
              <h4 className="mt-4 text-gray-400 text-sm uppercase font-semibold tracking-wide">{stat.title}</h4>
              <p className={`text-3xl font-extrabold ${stat.color} mt-2`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gray-900/70 rounded-2xl shadow-xl border border-gray-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-cyan-400" /> Service Trends
            </h3>
            <ChartTwo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-gray-900/70 rounded-2xl shadow-xl border border-gray-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-pink-400" /> Client Engagement
            </h3>
            <ChartThree />
          </motion.div>
        </div>

      </div>
    </div>
  );
}
