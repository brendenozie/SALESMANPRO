// app/[adminSlug]/reports/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon, CurrencyDollarIcon, StarIcon, UserGroupIcon, ClockIcon, CalendarDaysIcon
} from '@heroicons/react/24/outline'; // Added CalendarDaysIcon, ClockIcon
import { useParams } from 'next/navigation';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

// Define the ReportSummary interface to match the API response
interface ReportSummary {
  period: string;
  totalRevenue: number;
  newMembers: number;
  totalBookings: number;
  mostBookedTrainer: string;
  topPerformingClass: string;
  bookingTypeChartData: { name: string; value: number }[];
  revenueTrendChartData: { name: string; revenue: number }[];
}

interface ReportsPageProps {
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

const StatCard = ({ title, value, description, icon, color }: { title: string; value: string | number; description: string; icon: React.ReactNode; color: string; }) => (
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

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042']; // For Pie/Bar charts

export default function ReportsPage({ params }: ReportsPageProps) {
  const { adminSlug } = params;

  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('last30days'); // Default period

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${adminSlug}/reports?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ReportSummary = await response.json();
      setReportData(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch report data:", err);
    } finally {
      setLoading(false);
    }
  }, [adminSlug, selectedPeriod]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8 text-gray-100 font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600 mb-12 drop-shadow-lg"
      >
        Comprehensive Analytics Dashboard
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Performance Summary</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="lastyear">Last Year</option>
            <option value="alltime">All Time</option>
          </select>
        </div>

        {loading && (
          <div className="text-center py-20">
            <svg className="animate-spin h-10 w-10 text-green-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-400">Loading analytics data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading reports:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && reportData && (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <StatCard
                title="Total Revenue"
                value={`$${reportData.totalRevenue.toFixed(2)}`}
                description={`Generated over the ${reportData.period.replace('last', '').replace('days', ' day').replace('year', ' year').replace('time', ' time')} period`}
                icon={<CurrencyDollarIcon className='w-6 h-6' />}
                color="bg-green-600"
              />
              <StatCard
                title="New Members"
                value={reportData.newMembers}
                description={`New sign-ups in the ${reportData.period.replace('last', '').replace('days', ' day').replace('year', ' year').replace('time', ' time')} period`}
                icon={<UserGroupIcon className='w-6 h-6' />}
                color="bg-blue-600"
              />
              <StatCard
                title="Total Bookings"
                value={reportData.totalBookings}
                description={`Confirmed bookings in the ${reportData.period.replace('last', '').replace('days', ' day').replace('year', ' year').replace('time', ' time')} period`}
                icon={<CalendarDaysIcon className='w-6 h-6' />}
                color="bg-purple-600"
              />
              <StatCard
                title="Most Booked Trainer"
                value={reportData.mostBookedTrainer}
                description="Top personal trainer by bookings"
                icon={<StarIcon className='w-6 h-6' />}
                color="bg-yellow-400 text-gray-900"
              />
              <StatCard
                title="Top Performing Class"
                value={reportData.topPerformingClass}
                description="Most popular class by bookings"
                icon={<ChartBarIcon className='w-6 h-6' />}
                color="bg-indigo-600"
              />
            </motion.div>

            {/* Detailed Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                className="bg-gray-800 p-6 rounded-2xl shadow-xl h-96 border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={reportData.revenueTrendChartData}>
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#E5E7EB' }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                className="bg-gray-800 p-6 rounded-2xl shadow-xl h-96 border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Bookings by Type</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={reportData.bookingTypeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.bookingTypeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#E5E7EB' }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: number, name: string) => [`${value} bookings`, name]}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
