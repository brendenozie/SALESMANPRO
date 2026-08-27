"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  FilmIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PlayCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  PlusIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";

import { useParams } from "next/navigation";

// Dynamic import for ApexCharts (no SSR)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ----------------------------------
   TYPES
---------------------------------- */

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface MediaDashboardData {
  metrics: {
    totalVideos: number;
    totalArticles: number;
    activeSubscribers: number;
    revenueThisMonth: number;
    premieresScheduled: number;
  };
  tasks: Task[];
}

type Props = MediaDashboardData &{
  slug: string;
}

/* ----------------------------------
   CHARTS
---------------------------------- */

const ViewerTrendsChart = () => {
  const series = [
    {
      name: "Viewers",
      data: [310, 400, 280, 510, 420, 109, 100],
    },
  ];

  const options: any = {
    chart: { type: "area", toolbar: { show: false }, background: "transparent" },
    colors: ["#22d3ee"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.5, opacityTo: 0 },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#374151", strokeDashArray: 4 },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { colors: "#9ca3af" } },
    },
    yaxis: { labels: { style: { colors: "#9ca3af" } } },
    theme: { mode: "dark" },
  };

  return <Chart options={options} series={series} type="area" height={250} />;
};

const CategoryDonutChart = () => {
  const series = [44, 32, 14, 10];

  const options: any = {
    chart: { type: "donut" },
    labels: ["Entertainment", "Tech", "Lifestyle", "News"],
    colors: ["#22d3ee", "#818cf8", "#f472b6", "#fbbf24"],
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: { show: true, label: "Media", color: "#fff" },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { position: "bottom", labels: { colors: "#9ca3af" } },
    stroke: { show: false },
  };

  return <Chart options={options} series={series} type="donut" height={250} />;
};

/* ----------------------------------
   METRIC CARD
---------------------------------- */

const MetricCard = ({ title, value, icon: Icon, trend, delay }: any) => {
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="bg-gray-800/50 backdrop-blur-md p-5 rounded-2xl border border-gray-700 hover:border-cyan-500/50 transition-all"
    >
      <div className="flex justify-between mb-4">
        <div className="p-2 bg-gray-900 rounded-lg">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <div
          className={`flex items-center text-xs font-bold ${
            isPositive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {isPositive ? (
            <ArrowUpIcon className="w-3 h-3 mr-1" />
          ) : (
            <ArrowDownIcon className="w-3 h-3 mr-1" />
          )}
          {Math.abs(trend)}%
        </div>
      </div>

      <p className="text-2xl font-black text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        {title}
      </p>
    </motion.div>
  );
};

/* ----------------------------------
   MAIN COMPONENT
---------------------------------- */

export default function MediaDashboardClient({ metrics, tasks, slug: companyId }: Props) {
  // const { slug: companyId } = useParams();

  const metricsDetails = [
    { title: "Videos", value: metrics.totalVideos, icon: FilmIcon, trend: 8.5 },
    { title: "Subscribers", value: metrics.activeSubscribers, icon: UserGroupIcon, trend: 12.3 },
    {
      title: "Revenue",
      value: `$${metrics.revenueThisMonth.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      trend: 5.2,
    },
    { title: "Scheduled", value: metrics.premieresScheduled, icon: PlayCircleIcon, trend: 0 },
    { title: "Articles", value: metrics.totalArticles, icon: DocumentTextIcon, trend: -1.1 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="mb-10 flex justify-between">
          <h1 className="text-4xl font-black">
            Production <span className="text-cyan-400">Hub</span>
          </h1>
          <div className="flex gap-3">
            <button className="bg-gray-800 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
              <SignalIcon className="w-4 h-4" /> Go Live
            </button>
            <button className="bg-cyan-500 px-5 py-2.5 rounded-xl font-bold text-sm text-gray-900 flex items-center gap-2">
              <PlusIcon className="w-4 h-4" /> Upload
            </button>
          </div>
        </header>

        {/* METRICS */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {metricsDetails.map((m, i) => (
            <MetricCard key={i} {...m} delay={i * 0.1} />
          ))}
        </section>

        {/* CHARTS + TASKS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800/40 p-6 rounded-3xl">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-cyan-400" /> Audience Retention
            </h3>
            <ViewerTrendsChart />
          </div>

          <div className="bg-gray-800/40 p-6 rounded-3xl">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-orange-400" /> Editorial Pipeline
            </h3>

            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming tasks</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 bg-gray-900 rounded-xl mb-3">
                  <p className="font-bold">{task.name}</p>
                  <p className="text-xs text-gray-400">
                    {task.dueDate} • {task.dueTime}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DONUT */}
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/40 border border-gray-700 p-6 rounded-3xl">
                <h3 className="font-bold mb-6 flex items-center gap-2 text-white">
                    <FilmIcon className="w-5 h-5 text-pink-500" /> Distribution
                </h3>
                <CategoryDonutChart />
            </div>
            
            <div className="lg:col-span-2 bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/20 p-8 rounded-[2rem] flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white mb-2">Ready to Premiere?</h2>
                    <p className="text-gray-400 max-w-sm text-sm">You have 3 videos waiting in the queue. Scheduling a premiere can increase engagement by up to 40%.</p>
                    <button className="mt-6 bg-white text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-cyan-400 transition">Open Schedule</button>
                </div>
                <div className="hidden md:block">
                    <PlayCircleIcon className="w-32 h-32 text-cyan-500/10" />
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}
