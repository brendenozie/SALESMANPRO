"use client";

import React from 'react';
import { getReportsData, ReportSummary } from '@/constant/Data';
import { motion } from 'framer-motion';
import { BellAlertIcon, ChartBarIcon, CurrencyDollarIcon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline';


interface ReportsProps {
  params: {
    adminSlug: string;
  };
}

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.2,
    },
  },
};

const StatCard = ({ title, value, description, icon, color }:any) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col items-center text-center"
    variants={statCardVariants}
    whileHover="hover"
  >
    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 text-3xl text-white ${color}`}>
      {icon}
    </div>
    <p className="text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wider">{title}</p>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-xs text-gray-500">{description}</p>
  </motion.div>
);

export default function ReportsPage({ params }: ReportsProps) {
  const { adminSlug } = params;
  const reportsSummary: ReportSummary = getReportsData(adminSlug);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <h1 className="text-4xl font-bold mb-10 text-white">Analytics Dashboard</h1>

      {/* Summary Cards Section */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold mb-6 text-white">Summary: {reportsSummary.period}</h3>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            title="Total Revenue"
            value={`$${reportsSummary.totalRevenue.toFixed(2)}`}
            description="15% increase from last period"
            icon={<CurrencyDollarIcon className='w-6 h-6' />}
            color="bg-green-600"
          />
          <StatCard
            title="New Members"
            value={reportsSummary.newMembers}
            description="3 new sign-ups this week"
            icon={<UserGroupIcon className='w-6 h-6' />}
            color="bg-blue-600"
          />
          <StatCard
            title="Attendance Rate"
            value={`${reportsSummary.classAttendanceRate}%`}
            description="Meeting our target of 85%"
            icon={<ChartBarIcon className='w-6 h-6' />}
            color="bg-purple-600"
          />
          <StatCard
            title="Top Class"
            value={reportsSummary.topPerformingClass}
            description="Our most popular offering"
            icon={<BellAlertIcon className='w-6 h-6' />}
            color="bg-indigo-600"
          />
          <StatCard
            title="Top Trainer"
            value={reportsSummary.mostBookedTrainer}
            description="Most requested personal trainer"
            icon={<StarIcon className='w-6 h-6' />}
            color="bg-yellow-400 text-gray-900"
          />
        </motion.div>
      </div>

      {/* Detailed Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl h-96 flex items-center justify-center text-gray-400">
          <p className="text-xl">Interactive Revenue Chart (Placeholder)</p>
          {/* A real implementation would use a library like Recharts here */}
        </div>
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl h-96 flex items-center justify-center text-gray-400">
          <p className="text-xl">Class Attendance Breakdown (Placeholder)</p>
        </div>
      </div>
    </div>
  );
}