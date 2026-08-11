// app/admin/[adminSlug]/analytics/page.tsx
"use client";

import React, { SVGProps, ComponentType, ForwardRefExoticComponent, RefAttributes, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  UsersIcon,
  EyeIcon,
  ClockIcon,
  DeviceTabletIcon,
  FilmIcon,
  SparklesIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

export interface DashboardCardProps {
  delay: number;
  title: string;
  value: string;
  icon:
    | ComponentType<SVGProps<SVGSVGElement>>
    | ForwardRefExoticComponent<SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>>;
  gradient: string;
  key: string;
}



// Dynamically import ApexCharts for client-side rendering
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

// --- Layout ---
interface AdminLayoutProps {
  children: React.ReactNode;
}
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">{children}</div>
  </div>
);

// --- Types ---

// export interface DashboardCardProps {
//   delay: number;
//   title: string;
//   value: string;
//   icon: ComponentType<SVGProps<SVGSVGElement>>; // works with Heroicons too
//   gradient: string;
//   key: string;
// }


// --- Mock Data (replace with API later) ---
const dailyViewsData: { date: string; value: number }[] = [
  { date: "2025-08-25", value: 2000 },
  { date: "2025-09-01", value: 4000 },
  { date: "2025-09-05", value: 3000 },
  { date: "2025-09-10", value: 2000 },
  { date: "2025-09-15", value: 2780 },
  { date: "2025-09-20", value: 2390 },
  { date: "2025-09-22", value: 3490 },
];

const topContentData: number[] = [250000, 180000, 150000, 120000, 90000];
const topContentCategories: string[] = [
  "Episode 1",
  "Documentary",
  "Q&A Session",
  "Highlight Reel",
  "Trailer",
];

const deviceData: number[] = [400, 300, 300, 200];
const deviceLabels: string[] = ["Desktop", "Mobile", "Tablet", "Other"];

// --- Components ---
const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  gradient,
  delay,
}) => {
  return (
    <motion.div
      className={`relative p-6 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm bg-gradient-to-br ${gradient}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

// --- Main Page ---
export default async function AnalyticsPage({ params }: PageProps) {
  const [selectedRange, setSelectedRange] = useState<number>(30);
  
    const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  // Filter daily views based on selected range
  const filteredViews = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selectedRange);
    return dailyViewsData.filter((d) => new Date(d.date) >= cutoff);
  }, [selectedRange]);

  // Chart configs
  const areaChartOptions: ApexCharts.ApexOptions = {
    chart: { id: "daily-views-chart", toolbar: { show: false }, background: "transparent" },
    theme: { mode: "dark" },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: {
      categories: filteredViews.map((d) => d.date),
      labels: { style: { colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9ca3af" } } },
    tooltip: { theme: "dark" },
    grid: { borderColor: "#374151" },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 100] },
    },
    colors: ["#8884d8"],
  };

  const barChartOptions: ApexCharts.ApexOptions = {
    chart: { id: "top-content-chart", toolbar: { show: false }, background: "transparent" },
    theme: { mode: "dark" },
    plotOptions: { bar: { horizontal: true, borderRadius: 10 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: topContentCategories,
      labels: { style: { colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9ca3af" } } },
    tooltip: { theme: "dark" },
    grid: { borderColor: "#374151" },
    colors: ["#82ca9d"],
  };

  const pieChartOptions: ApexCharts.ApexOptions = {
    chart: { id: "device-data-chart", toolbar: { show: false }, background: "transparent" },
    theme: { mode: "dark" },
    labels: deviceLabels,
    legend: { position: "bottom", labels: { colors: "#9ca3af" } },
    tooltip: { theme: "dark" },
    responsive: [{ breakpoint: 480, options: { legend: { position: "bottom" } } }],
    colors: ["#8884d8", "#82ca9d", "#ffc658", "#FF7F50"],
  };

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-0">
          Content{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-600">
            Analytics
          </span>
        </h1>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-2 text-gray-400">
          <CalendarDaysIcon className="h-5 w-5" />
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {analyticsOverview.map((stat, index) => (
          <DashboardCard key={stat.title} {...stat} delay={index * 0.1 + 0.3} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Daily Views */}
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
          <ApexCharts
            options={areaChartOptions}
            series={[{ name: "Views", data: filteredViews.map((d) => d.value) }]}
            type="area"
            height={300}
          />
        </motion.div>

        {/* Top Content */}
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
          <ApexCharts
            options={barChartOptions}
            series={[{ name: "Views", data: topContentData }]}
            type="bar"
            height={300}
          />
        </motion.div>
      </div>

      {/* Audience by Device */}
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
          <ApexCharts options={pieChartOptions} series={deviceData} type="pie" height={300} />
        </div>
      </motion.div>
    </AdminLayout>
  );
}
