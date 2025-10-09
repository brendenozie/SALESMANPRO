"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// Using simple anchor tags (<a>) instead of Next.js <Link> for single-file mandate
import {
  FilmIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PlayCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface Metric {
    title: string;
    value: string | number;
    icon: React.ElementType;
    link: string;
    trend: number; // Percentage change (positive or negative)
}

interface MediaDashboardData {
  metrics: {
    totalVideos: number;
    totalArticles: number;
    activeSubscribers: number;
    revenueThisMonth: number;
    premieresScheduled: number;
  };
  tasks: Task[];
}

// Mock Data updated with trend values
const sampleData: MediaDashboardData = {
  metrics: {
    totalVideos: 215,
    totalArticles: 130,
    activeSubscribers: 4120,
    revenueThisMonth: 98500,
    premieresScheduled: 3,
  },
  tasks: [
    { id: '1', name: 'Edit Episode 4 of "Cinema Scope"', dueDate: 'Today', dueTime: '12:00 PM' },
    { id: '2', name: 'Review draft for "Behind The Beat"', dueDate: 'Today', dueTime: '03:30 PM' },
    { id: '3', name: 'Schedule live Q&A session', dueDate: 'Tomorrow', dueTime: '10:00 AM' },
  ],
};

// --- Metric Card Component (Dark Theme) ---
interface MetricCardProps extends Metric {
    delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, link, delay }) => {
  const isPositive = trend >= 0;
  const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
  const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <motion.a
      href={link}
      className="group bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 hover:border-cyan-500 transition-all duration-300 flex flex-col justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
        <div className="flex justify-between items-start">
            <Icon className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <div className={`flex items-center text-sm font-medium ${trendColor}`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                {Math.abs(trend)}%
            </div>
        </div>

        <div className="mt-6">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-extrabold text-white mt-1 group-hover:text-cyan-500 transition-colors">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
        </div>
    </motion.a>
  );
};

// --- Mock Line Chart Component for Viewer Trends ---
const ViewerTrendsChart: React.FC = () => {
    // Mock data for 6 time points
    const data = [120, 150, 140, 180, 160, 210];
    const maxVal = Math.max(...data);

    return (
        <div className="relative h-64 p-4">
            <h2 className="text-xl font-semibold text-white mb-4">Viewer Trends (Last 6 Weeks)</h2>
            <div className="flex h-40 items-end justify-between border-b border-gray-700 pb-2">
                {data.map((val, index) => (
                    <motion.div
                        key={index}
                        className="w-1/6 h-full flex flex-col justify-end items-center px-1"
                        initial={{ height: 0 }}
                        animate={{ height: `${(val / maxVal) * 100}%` }}
                        transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                    >
                        <div className="w-full bg-cyan-600 rounded-t-lg shadow-lg hover:bg-cyan-400 transition-colors duration-200 cursor-pointer relative">
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 group-hover:text-white transition-opacity hidden group-hover:block">{val}K</span>
                        </div>
                    </motion.div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-2">
                {['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'].map((label, index) => (
                    <span key={index}>{label}</span>
                ))}
            </div>
        </div>
    );
}

// --- Main Dashboard Component ---

export default function MediaDashboardClient() {
  // We use a mock admin slug since next/navigation/router is unavailable
  const adminSlug = 'content-manager';
  const [data] = useState<MediaDashboardData>(sampleData);

  const { totalVideos, totalArticles, activeSubscribers, revenueThisMonth, premieresScheduled } = data.metrics;

  const cards: Metric[] = [
    {
      title: 'Total Videos',
      value: totalVideos,
      icon: FilmIcon,
      trend: 8.5,
      link: `/admin/${adminSlug}/videos`,
    },
    {
      title: 'Active Subscribers',
      value: activeSubscribers,
      icon: UserGroupIcon,
      trend: 12.3, // Strong growth indicator
      link: `/admin/${adminSlug}/subscribers`,
    },
    {
      title: 'Monthly Revenue',
      value: `$${revenueThisMonth.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      trend: 5.2,
      link: `/admin/${adminSlug}/revenue`,
    },
    {
      title: 'Scheduled Premieres',
      value: premieresScheduled,
      icon: PlayCircleIcon,
      trend: 0, // No change
      link: `/admin/${adminSlug}/premieres`,
    },
    {
      title: 'Total Articles',
      value: totalArticles,
      icon: DocumentTextIcon,
      trend: -1.1, // Slight dip indicator
      link: `/admin/${adminSlug}/articles`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 font-inter py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <motion.h1
            className="text-4xl sm:text-5xl font-extrabold text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            Content Production Hub
        </motion.h1>
        <motion.p
             className="text-lg text-gray-500 mb-10"
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
        >
            Real-time insights on media performance and editorial pipeline.
        </motion.p>

        {/* --- Metric Cards --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {cards.map((card, index) => (
            <MetricCard key={card.title} {...card} delay={0.3 + index * 0.1} />
          ))}
        </section>

        {/* --- Charts and Key Sections --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* 1. Viewer Trends (Line Chart Mock) */}
          <motion.div
            className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <ViewerTrendsChart />
          </motion.div>

          {/* 2. Today's Editorial Tasks */}
          <motion.div
            className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarDaysIcon className='w-6 h-6 text-orange-400'/> Editorial Pipeline
              </h2>
              <a href={`/admin/${adminSlug}/tasks`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View All</a>
            </div>
            <ul className="space-y-4">
              {data.tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  <div className="text-gray-200 font-medium truncate mb-1 sm:mb-0">
                    {task.name}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                    <ClockIcon className="w-3 h-3"/>
                    {task.dueDate} @ {task.dueTime}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </section>
        
        {/* --- Category Breakdown Placeholder --- */}
        <motion.div
            className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
        >
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-3 flex items-center gap-2">
                <ChartBarIcon className='w-6 h-6 text-teal-400'/> Content Category Breakdown
            </h2>
            <div className="min-h-[200px] flex items-center justify-center bg-gray-700 rounded-lg border border-dashed border-gray-600 text-gray-500 font-semibold text-sm">
                [Placeholder for Category Breakdown Pie/Donut Chart]
            </div>
        </motion.div>

      </div>
    </div>
  );
}
