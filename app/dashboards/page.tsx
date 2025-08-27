"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownCircleIcon,
} from '@heroicons/react/24/outline';

// --- Placeholder Data for the Dashboard ---
const adminDashboardData = {
  name: "Alex",
  totalMetrics: [
    { title: "Total Revenue", value: "Ksh. 185,231", icon: <ArrowTrendingUpIcon className="h-6 w-6" />, color: "from-green-400 to-green-600" },
    { title: "Active Orders", value: "25", icon: <ShoppingBagIcon className="h-6 w-6" />, color: "from-indigo-400 to-indigo-600" },
    { title: "Total Customers", value: "450", icon: <UsersIcon className="h-6 w-6" />, color: "from-purple-400 to-purple-600" },
    { title: "Store Locations", value: "3", icon: <BuildingStorefrontIcon className="h-6 w-6" />, color: "from-orange-400 to-orange-600" },
  ],
  recentActivity: [
    { id: 1, type: "New Store Created", description: "Vintage Vibe Boutique added", time: "10 minutes ago", icon: <PlusCircleIcon className="h-5 w-5 text-green-500" /> },
    { id: 2, type: "New Order", description: "Order #562 placed at Gourmet Grinds", time: "35 minutes ago", icon: <ShoppingBagIcon className="h-5 w-5 text-blue-500" /> },
    { id: 3, type: "Inventory Alert", description: "Low stock for 'Smartwatch' at Tech Treasures", time: "2 hours ago", icon: <BellIcon className="h-5 w-5 text-red-500" /> },
    { id: 4, type: "Customer Signed Up", description: "New account created by Sarah Jones", time: "Yesterday", icon: <UsersIcon className="h-5 w-5 text-purple-500" /> },
    { id: 5, type: "Order Complete", description: "Order #561 shipped to Jane Doe", time: "Yesterday", icon: <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" /> },
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

// --- Helper function for dynamic greeting ---
const getGreeting = (name : string) => {
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }
  return `${greeting}, ${name}!`;
};

// --- Main Admin Dashboard Component ---
const AdminDashboardPage = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting(adminDashboardData.name));
  }, []);

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
          {greeting}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Your businesses at a glance.
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
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {adminDashboardData.totalMetrics.map((metric, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl shadow-lg text-white transition-all duration-300 transform cursor-pointer bg-gradient-to-br ${metric.color}`}
            >
              <div className="flex items-center space-x-3 mb-2">
                {metric.icon}
                <span className="text-sm font-semibold uppercase">{metric.title}</span>
              </div>
              <p className="text-3xl font-bold">{metric.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Store Link Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
          <motion.a
            href="/stores" // Placeholder for navigation
            whileHover={{ scale: 1.03 }}
            className="p-6 bg-white text-gray-800 rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 transform cursor-pointer flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Manage Stores</h2>
              <BuildingStorefrontIcon className="h-8 w-8 text-indigo-500" />
            </div>
            <p className="text-sm text-gray-500">
              View all your stores and their individual dashboards.
            </p>
            <div className="mt-4 inline-flex items-center space-x-2 text-sm font-medium text-indigo-600">
              <span>Go to Stores</span>
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          </motion.a>

          <motion.a
            href="#" // Placeholder for navigation
            whileHover={{ scale: 1.03 }}
            className="p-6 bg-white text-gray-800 rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 transform cursor-pointer flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Total Sales Trend</h2>
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500">
              Explore your business growth over time with interactive charts.
            </p>
            <div className="mt-4 inline-flex items-center space-x-2 text-sm font-medium text-indigo-600">
              <span>View Analytics</span>
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          </motion.a>
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
          <Cog6ToothIcon className="h-6 w-6 mr-2 text-gray-500" />
          Recent Activity
        </h2>
        <ul className="divide-y divide-gray-200">
          {adminDashboardData.recentActivity.map((activity) => (
            <motion.li
              key={activity.id}
              variants={itemVariants}
              className="py-3 flex justify-between items-center"
            >
              <div className="flex items-center">
                {activity.icon}
                <div className="ml-4">
                  <p className="text-base font-medium text-gray-900">{activity.type}</p>
                  <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                </div>
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
