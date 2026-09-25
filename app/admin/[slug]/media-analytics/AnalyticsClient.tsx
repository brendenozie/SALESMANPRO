"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  UsersIcon,
  EyeIcon,
  ClockIcon,
  DeviceTabletIcon,
  FilmIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";

// Dynamically import ApexCharts for client-side rendering
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface DashboardCardProps {
  delay: number;
  title: string;
  value: string;
  gradient: string;
}

interface AnalyticsClientProps {
  companyId: string;
}

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-6 lg:p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">{children}</div>
  </div>
);

const getCardIcon = (title: string) => {
  if (title.includes("View")) return EyeIcon;
  if (title.includes("Content")) return FilmIcon;
  if (title.includes("Subscriber") || title.includes("User")) return UsersIcon;
  if (title.includes("Revenue")) return CurrencyDollarIcon;
  return SparklesIcon;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  gradient,
  delay,
}) => {
  const Icon = getCardIcon(title);
  return (
    <motion.div
      className={`relative p-6 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm bg-gradient-to-br ${gradient}`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-1">{title}</h3>
          <p className="text-3xl font-extrabold text-white">{value}</p>
        </div>
        <div className="bg-white/10 p-3 rounded-full">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <Icon className="absolute -bottom-8 -right-8 h-28 w-28" />
      </div>
    </motion.div>
  );
};

export default function AnalyticsClient({ companyId }: AnalyticsClientProps) {
  const [selectedRange, setSelectedRange] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media-analytics?companyId=${companyId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error("[AnalyticsClient] Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const dailyViews = data?.dailyViewsData || [];
  const topContentCategories = data?.topContent?.categories || ["No data"];
  const topContentData = data?.topContent?.data || [0];
  const deviceLabels = data?.deviceBreakdown?.labels || ["Mobile", "Desktop", "Tablet"];
  const deviceData = data?.deviceBreakdown?.data || [70, 25, 5];
  const overview = data?.overview || [
    { title: "Total Views", value: "0", gradient: "from-blue-600 to-indigo-700" },
    { title: "Total Content", value: "0", gradient: "from-green-600 to-teal-700" },
    { title: "Subscribers & Consumers", value: "0", gradient: "from-purple-600 to-pink-700" },
    { title: "Content Revenue", value: "KES 0", gradient: "from-amber-600 to-orange-700" },
  ];

  const areaChartOptions: ApexCharts.ApexOptions = {
    chart: { id: "daily-views-chart", toolbar: { show: false }, background: "transparent" },
    theme: { mode: "dark" },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: dailyViews.map((d: any) => d.date),
      labels: { style: { colors: "#9ca3af", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "11px" } } },
    tooltip: { theme: "dark" },
    grid: { borderColor: "#1e293b" },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 100] },
    },
    colors: ["#ec4899"],
  };

  const barChartOptions: ApexCharts.ApexOptions = {
    chart: { id: "top-content-chart", toolbar: { show: false }, background: "transparent" },
    theme: { mode: "dark" },
    plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: topContentCategories,
      labels: { style: { colors: "#9ca3af", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "11px" } } },
    tooltip: { theme: "dark" },
    grid: { borderColor: "#1e293b" },
    colors: ["#3b82f6"],
  };

  const pieChartOptions: ApexCharts.ApexOptions = {
    chart: { id: "device-data-chart", toolbar: { show: false }, background: "transparent" },
    theme: { mode: "dark" },
    labels: deviceLabels,
    legend: { position: "bottom", labels: { colors: "#9ca3af" } },
    tooltip: { theme: "dark" },
    responsive: [{ breakpoint: 480, options: { legend: { position: "bottom" } } }],
    colors: ["#ec4899", "#3b82f6", "#10b981", "#f59e0b"],
  };

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Media & Audience{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-indigo-500">
              Analytics
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time analytics for video streams, articles, purchases, and device impressions.
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => fetchAnalytics()}
            className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 text-gray-300 transition"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center space-x-2 text-gray-400 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <CalendarDaysIcon className="h-4 w-4" />
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(Number(e.target.value))}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value={7} className="bg-gray-900">Last 7 Days</option>
              <option value={30} className="bg-gray-900">Last 30 Days</option>
              <option value={90} className="bg-gray-900">Last 90 Days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {overview.map((stat: any, index: number) => (
          <DashboardCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Daily Views */}
        <motion.div
          className="bg-gray-900/80 border border-gray-800/80 rounded-3xl shadow-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <EyeIcon className="h-5 w-5 mr-3 text-rose-500" />
            Daily Content Views & Impressions
          </h2>
          <ApexCharts
            options={areaChartOptions}
            series={[{ name: "Views", data: dailyViews.map((d: any) => d.value) }]}
            type="area"
            height={280}
          />
        </motion.div>

        {/* Top Content */}
        <motion.div
          className="bg-gray-900/80 border border-gray-800/80 rounded-3xl shadow-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <FilmIcon className="h-5 w-5 mr-3 text-blue-500" />
            Top Performing Content
          </h2>
          <ApexCharts
            options={barChartOptions}
            series={[{ name: "Views", data: topContentData }]}
            type="bar"
            height={280}
          />
        </motion.div>
      </div>

      {/* Audience by Device */}
      <motion.div
        className="bg-gray-900/80 border border-gray-800/80 rounded-3xl shadow-2xl p-6 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <DeviceTabletIcon className="h-5 w-5 mr-3 text-emerald-400" />
          Audience by Device
        </h2>
        <div className="flex justify-center items-center w-full">
          <ApexCharts options={pieChartOptions} series={deviceData} type="pie" height={280} />
        </div>
      </motion.div>
    </AdminLayout>
  );
}