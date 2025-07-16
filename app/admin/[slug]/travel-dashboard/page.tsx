// AdminDashboard.jsx
"use client";

import React from 'react';
import {
  HomeIcon, UsersIcon, CalendarDaysIcon, GlobeAltIcon, CurrencyDollarIcon, ChartBarIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const adminSlug = 'your-admin-id'; // Replace with dynamic admin ID

// Dummy Data
const stats = [
  { id: 1, name: 'Total Bookings', value: '1,245', icon: CalendarDaysIcon, color: 'text-blue-500' },
  { id: 2, name: 'Total Revenue', value: '$1.5M', icon: CurrencyDollarIcon, color: 'text-green-500' },
  { id: 3, name: 'New Users This Month', value: '189', icon: UsersIcon, color: 'text-purple-500' },
  { id: 4, name: 'Popular Destinations', value: 'Bali, Paris, Kyoto', icon: GlobeAltIcon, color: 'text-yellow-500' },
];

const quickLinks = [
  { label: 'Manage Bookings', href: `/admin/${adminSlug}/bookings`, icon: CalendarDaysIcon },
  { label: 'Add New Package', href: `/admin/${adminSlug}/packages?action=add`, icon: BriefcaseIcon },
  { label: 'View Inquiries', href: `/admin/${adminSlug}/inquiries`, icon: QuestionMarkCircleIcon },
  { label: 'Manage Users', href: `/admin/${adminSlug}/users`, icon: UsersIcon },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8"
      >
        Admin Dashboard
      </motion.h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: stat.id * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4"
          >
            <div className={`p-3 rounded-full bg-opacity-20 ${stat.color.replace('text-', 'bg-')}`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-md p-8 mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              className="flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 font-semibold py-3 px-4 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity (Placeholder) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white rounded-xl shadow-md p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <p className="text-gray-600">No recent activity to display.</p>
        {/* In a real app, this would be a list or table of recent events */}
      </motion.div>
    </div>
  );
}