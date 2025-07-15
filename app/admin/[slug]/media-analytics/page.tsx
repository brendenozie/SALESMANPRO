// app/admin/[adminSlug]/analytics/page.tsx
"use client";

import React from 'react';
import AdminLayout from '../../../../components/AdminLayout'; // Adjust path as needed
import { motion } from 'framer-motion';
import { ChartBarIcon, UsersIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/solid';

const analyticsOverview = [
  { label: "Total Views (Last 30 Days)", value: "2.8M", icon: EyeIcon, color: "text-blue-400" },
  { label: "New Users (Last 30 Days)", value: "1,500", icon: UsersIcon, color: "text-green-400" },
  { label: "Avg. Watch Time", value: "7:45 min", icon: ClockIcon, color: "text-yellow-400" },
  { label: "Top Content", value: "'Cosmic Echo' Trailer", icon: ChartBarIcon, color: "text-purple-400" },
];

export default function AnalyticsPage() {
  return (
    <div>
      <p className="text-gray-300 text-lg mb-8">
        Gain insights into your content performance, audience engagement, and platform growth.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {analyticsOverview.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              className="bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Icon className={`h-16 w-16 mb-4 ${stat.color}`} />
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="bg-gray-800 rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Detailed Reports</h2>
        <p className="text-gray-400">
          This section would typically feature interactive charts and graphs (e.g., using Recharts or D3.js)
          displaying trends in video views, article reads, user demographics, and more.
          <br /><br />
          <span className="text-red-400">Example charts:</span>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Daily Viewership Trends</li>
            <li>Top 10 Most Watched Videos</li>
            <li>Audience Retention Rates</li>
            <li>Geographic Distribution of Users</li>
          </ul>
        </p>
      </motion.div>
    </div>
  );
}