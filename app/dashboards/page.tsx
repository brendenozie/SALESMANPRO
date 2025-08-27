"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  UsersIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// --- Placeholder Data for the Dashboard ---
const adminDashboardData = {
  name: "Alex",
  totalMetrics: [
    { title: "Total Revenue", value: "Ksh. 185,231", icon: <DocumentTextIcon className="h-6 w-6 text-green-500" /> },
    { title: "Active Orders", value: "25", icon: <ShoppingBagIcon className="h-6 w-6 text-indigo-500" /> },
    { title: "Total Customers", value: "450", icon: <UsersIcon className="h-6 w-6 text-purple-500" /> },
    { title: "Store Locations", value: "3", icon: <BuildingStorefrontIcon className="h-6 w-6 text-orange-500" /> },
  ],
  recentActivity: [
    { id: 1, type: "New Store Created", description: "Vintage Vibe Boutique added", time: "10 minutes ago" },
    { id: 2, type: "New Order", description: "Order #562 placed at Gourmet Grinds", time: "35 minutes ago" },
    { id: 3, type: "Inventory Alert", description: "Low stock for 'Smartwatch' at Tech Treasures", time: "2 hours ago" },
    { id: 4, type: "Customer Signed Up", description: "New account created by Sarah Jones", time: "Yesterday" },
  ]
};

// --- Framer Motion Variants for Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

// --- Main Admin Dashboard Component ---
const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-6 sm:p-10">
      {/* Dashboard Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
          Hello, {adminDashboardData.name}!
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Here's a high-level overview of your businesses.
        </p>
      </motion.header>

      {/* Main Content Grid */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {/* Total Metrics Section */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200"
        >
          {adminDashboardData.totalMetrics.map((metric, index) => (
            <motion.div
              key={index}
              className="p-4 rounded-xl transition-all duration-300 transform hover:bg-gray-50"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center space-x-3 mb-2">
                {metric.icon}
                <span className="text-sm font-semibold text-gray-500 uppercase">{metric.title}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions & Store Link Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-6 bg-indigo-600 text-white rounded-2xl shadow-lg transition-all duration-300 transform cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Manage Stores</h2>
              <BuildingStorefrontIcon className="h-8 w-8 text-indigo-200" />
            </div>
            <p className="text-sm text-indigo-100">
              View all your stores and their individual dashboards.
            </p>
            <motion.a
              href="#" // Placeholder for navigation
              className="mt-4 inline-flex items-center space-x-2 text-sm font-medium transition-all duration-200"
            >
              <span>Go to Stores</span>
              <ArrowRightIcon className="h-4 w-4" />
            </motion.a>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 transform cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Create a Store</h2>
              <PlusCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500">
              Launch a brand new storefront in minutes.
            </p>
            <motion.a
              href="#" // Placeholder for navigation
              className="mt-4 inline-flex items-center space-x-2 text-sm font-medium text-indigo-600 transition-all duration-200"
            >
              <span>Get Started</span>
              <ArrowRightIcon className="h-4 w-4" />
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.main>

      {/* Recent Activity Section */}
      <motion.section
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
          <SparklesIcon className="h-6 w-6 mr-2 text-red-500" />
          Recent Activity
        </h2>
        <ul className="divide-y divide-gray-200">
          {adminDashboardData.recentActivity.map((activity) => (
            <motion.li
              key={activity.id}
              variants={itemVariants}
              className="py-3 flex justify-between items-start"
            >
              <div>
                <p className="text-base font-medium text-gray-900">{activity.type}</p>
                <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </motion.li>
          ))}
        </ul>
      </motion.section>
    </div>
  );
};

export default AdminDashboardPage;
