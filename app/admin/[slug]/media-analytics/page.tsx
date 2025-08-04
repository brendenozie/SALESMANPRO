// app/admin/[adminSlug]/analytics/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ChartBarIcon, UsersIcon, EyeIcon, ClockIcon, DeviceTabletIcon, FilmIcon, SparklesIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';

// Dynamically import ApexCharts to ensure it's rendered on the client-side
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

// Placeholder for your AdminLayout component
const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </div>
);

// --- Mock Data and ApexCharts Configuration ---
const dailyViewsData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const dailyViewsCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

const topContentData = [250000, 180000, 150000, 120000, 90000];
const topContentCategories = ['Episode 1', 'Documentary', 'Q&A Session', 'Highlight Reel', 'Trailer'];

const deviceData = [400, 300, 300, 200];
const deviceLabels = ['Desktop', 'Mobile', 'Tablet', 'Other'];

// --- Dashboard Component ---
const DashboardCard = ({ title, value, icon, gradient, delay }) => {
  const Icon = icon;
  return (
    <motion.div
      className={`relative p-6 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm bg-gradient-to-br ${gradient}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-4xl font-extrabold text-white">{value}</p>
        </div>
        <div className="bg-white/10 p-3 rounded-full">
          <Icon className="h-10 w-10 text-white" />
        </div>
      </div>
      <div className="absolute inset-0 z-0 opacity-20">
        <Icon className="absolute -bottom-10 -right-10 h-32 w-32" />
      </div>
    </motion.div>
  );
};

const analyticsOverview = [
  { title: "Total Views", value: "2.8M", icon: EyeIcon, gradient: "from-blue-600 to-indigo-700" },
  { title: "New Users", value: "1,500", icon: UsersIcon, gradient: "from-green-600 to-teal-700" },
  { title: "Avg. Watch Time", value: "7:45 min", icon: ClockIcon, gradient: "from-yellow-600 to-orange-700" },
  { title: "Top Content", value: "Cosmic Echo", icon: SparklesIcon, gradient: "from-purple-600 to-pink-700" },
];

export default function AnalyticsPage() {
  // Chart options for ApexCharts
  const areaChartOptions = {
    chart: {
      id: 'daily-views-chart',
      toolbar: { show: false },
      background: 'transparent',
    },
    theme: {
      mode: 'dark',
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: {
      categories: dailyViewsCategories,
      labels: { style: { colors: '#9ca3af' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#9ca3af' } },
    },
    tooltip: {
      theme: 'dark',
    },
    grid: {
      borderColor: '#374151',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    colors: ['#8884d8'],
  };

  const barChartOptions = {
    chart: {
      id: 'top-content-chart',
      toolbar: { show: false },
      background: 'transparent',
    },
    theme: {
      mode: 'dark',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 10,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: topContentCategories,
      labels: { style: { colors: '#9ca3af' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#9ca3af' } },
    },
    tooltip: {
      theme: 'dark',
    },
    grid: {
      borderColor: '#374151',
    },
    colors: ['#82ca9d'],
  };

  const pieChartOptions = {
    chart: {
      id: 'device-data-chart',
      toolbar: { show: false },
      background: 'transparent',
    },
    theme: {
      mode: 'dark',
    },
    labels: deviceLabels,
    legend: {
      position: 'bottom',
      labels: {
        colors: '#9ca3af',
      },
    },
    tooltip: {
      theme: 'dark',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }],
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#FF7F50'],
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-0">
          Content <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-600">Analytics</span>
        </h1>
        <div className="flex items-center space-x-2 text-gray-400">
          <CalendarDaysIcon className="h-5 w-5" />
          <p className="font-medium">Last 30 Days</p>
        </div>
      </motion.div>

      {/* --- Key Metrics Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {analyticsOverview.map((stat, index) => (
          <DashboardCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
            delay={index * 0.1 + 0.3}
          />
        ))}
      </div>

      {/* --- Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Daily Views Chart */}
        <motion.div
          className="bg-gray-900 rounded-3xl shadow-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <EyeIcon className="h-6 w-6 mr-3 text-purple-400" />
            Daily Content Views
          </h2>
          <div className="w-full">
            <ApexCharts options={areaChartOptions} series={[{ name: 'Views', data: dailyViewsData }]} type="area" height={300} />
          </div>
        </motion.div>

        {/* Top Content Chart */}
        <motion.div
          className="bg-gray-900 rounded-3xl shadow-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <FilmIcon className="h-6 w-6 mr-3 text-red-400" />
            Top Content by Views
          </h2>
          <div className="w-full">
            <ApexCharts options={barChartOptions} series={[{ name: 'Views', data: topContentData }]} type="bar" height={300} />
          </div>
        </motion.div>
      </div>

      {/* Audience Demographics Chart */}
      <motion.div
        className="bg-gray-900 rounded-3xl shadow-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <DeviceTabletIcon className="h-6 w-6 mr-3 text-teal-400" />
          Audience by Device Type
        </h2>
        <div className="flex justify-center items-center w-full">
          <ApexCharts options={pieChartOptions} series={deviceData} type="pie" width="100%" height={300} />
        </div>
      </motion.div>
    </AdminLayout>
  );
}
