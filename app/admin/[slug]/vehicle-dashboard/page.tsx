// app/admin/[adminSlug]/page.js
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon, ClipboardDocumentListIcon, UsersIcon,
  CurrencyDollarIcon, ArrowTrendingUpIcon, WalletIcon
} from '@heroicons/react/24/solid';
import { VideoCameraSlashIcon } from '@heroicons/react/24/outline';

// Dummy Data
const getDashboardData = (adminSlug : any) => ({
  storeName: adminSlug,//.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
  totalVehicles: 150,
  activeListings: 120,
  pendingRequests: 25,
  newClientsLastMonth: 15,
  revenueLastMonth: 750000,
  recentSales: [
    { id: 1, vehicle: '2023 Tesla Model 3', client: 'Alice Johnson', amount: 48000, date: '2025-07-10' },
    { id: 2, vehicle: '2024 Toyota RAV4', client: 'Bob Williams', amount: 36000, date: '2025-07-08' },
    { id: 3, vehicle: '2022 Ford F-150', client: 'Charlie Davis', amount: 62000, date: '2025-07-05' },
  ],
  inventoryBreakdown: {
    cars: 80,
    suvs: 40,
    trucks: 20,
    motorcycles: 10,
  },
});

// Animation Variants
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
  visible: { y: 0, opacity: 1 },
};

const Card = ({ icon: Icon, title, value, description, bgColor } : any) => (
  <motion.div
    variants={itemVariants}
    className={`p-6 rounded-2xl shadow-lg ${bgColor} text-white flex flex-col justify-between h-full`}
  >
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      {/* <Icon className="w-8 h-8 opacity-80" /> */}
    </div>
    <p className="text-4xl font-bold mb-2">{value}</p>
    <p className="text-sm opacity-90">{description}</p>
  </motion.div>
);

export default function AdminDashboardPage() {
  const params = useParams();
  const { adminSlug } = params;
  const data = getDashboardData(adminSlug);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 md:p-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold mb-8 text-blue-700 dark:text-blue-400"
      >
        {data.storeName} Dashboard
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
      >
        <Card
          icon={VideoCameraSlashIcon}
          title="Total Vehicles"
          value={data.totalVehicles}
          description="In your inventory"
          bgColor="bg-blue-600"
        />
        <Card
          icon={ClipboardDocumentListIcon}
          title="Pending Requests"
          value={data.pendingRequests}
          description="New inquiries awaiting action"
          bgColor="bg-yellow-600"
        />
        <Card
          icon={UsersIcon}
          title="New Clients"
          value={data.newClientsLastMonth}
          description="Joined last month"
          bgColor="bg-green-600"
        />
        <Card
          icon={CurrencyDollarIcon}
          title="Revenue (Last Month)"
          value={`$${data.revenueLastMonth.toLocaleString()}`}
          description="Total sales income"
          bgColor="bg-purple-600"
        />
        <Card
          icon={ArrowTrendingUpIcon}
          title="Active Listings"
          value={data.activeListings}
          description="Currently visible to customers"
          bgColor="bg-indigo-600"
        />
        <Card
          icon={WalletIcon}
          title="Avg. Deal Size"
          value={`$${(data.revenueLastMonth / data.recentSales.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          description="Based on recent sales"
          bgColor="bg-pink-600"
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8"
      >
        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sale.vehicle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{sale.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">${sale.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sale.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}