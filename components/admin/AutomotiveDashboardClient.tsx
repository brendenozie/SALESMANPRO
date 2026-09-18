"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TruckIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  ClockIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

/* ================= TYPES ================= */

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface AutomotiveDashboardData {
  metrics: {
    totalVehicles: number;
    vehiclesSold: number;
    activeListings: number;
    revenueThisMonth: number;
    serviceBookingsToday: number;
  };
  tasks: Task[];
  charts: {
    salesTrend: number[];
    inventoryBreakdown: { type: string; count: number }[];
  };
}

interface Metric {
  title: string;
  value: string | number;
  icon: React.ElementType;
  link: string;
  trend: number;
  color: string;
}

type Props = AutomotiveDashboardData &{
  slug: string;
}

/* ================= METRIC CARD ================= */

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  link,
  color,
  delay
}: Metric & { delay: number }) => {
  const trendColor = trend > 0 ? "text-green-600" : "text-gray-400";
  const TrendIcon = trend > 0 ? ArrowUpIcon : ArrowRightIcon;

  return (
    <motion.a
      href={link}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white p-6 rounded-2xl shadow-xl border hover:ring-2 hover:ring-orange-400"
    >
      <div className="flex justify-between">
        <div className={`p-3 rounded-xl ${color.replace("text-", "bg-")} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>

        {trend !== 0 && (
          <span className={`flex items-center text-sm ${trendColor}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            {trend}%
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500 uppercase">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </motion.a>
  );
};

/* ================= CHARTS ================= */

const SalesTrendsChart = ({ data }: { data: number[] }) => {
  if (!data?.length) {
    return <div className="p-6 bg-white rounded-xl">No sales data available</div>;
  }

  const max = Math.max(...data, 1);
  const labels = ["Feb", "Mar", "Apr", "May", "Jun"];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="font-bold mb-4 flex gap-2">
        <ChartBarIcon className="w-5 h-5 text-orange-500" />
        Monthly Sales Trend
      </h2>

      <div className="flex items-end h-48 gap-3">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-orange-500 rounded-t-lg"
              style={{ height: `${(v / max) * 100}%` }}
            />
            <span className="text-xs mt-2">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const VehicleCategoriesChart = ({
  data
}: {
  data: { type: string; count: number }[];
}) => {
  if (!data?.length) {
    return <div className="p-6 bg-white rounded-xl">No inventory breakdown</div>;
  }

  const total = data.reduce((a, b) => a + b.count, 0);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="font-bold mb-4 flex gap-2">
        <TruckIcon className="w-5 h-5 text-indigo-600" />
        Inventory Breakdown
      </h2>

      <ul className="space-y-2">
        {data.map(item => (
          <li key={item.type} className="flex justify-between">
            <span>{item.type}</span>
            <span className="font-semibold">
              {total ? Math.round((item.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

export default function AutomotiveDashboardClient({ slug, metrics, charts, tasks }: Props) {
  const adminSlug = slug || "dealership-admin";

  const safeMetrics = {
    totalVehicles: 0,
    vehiclesSold: 0,
    activeListings: 0,
    revenueThisMonth: 0,
    serviceBookingsToday: 0,
    ...(metrics || {})
  };

  const safeCharts = {
    salesTrend: [0, 0, 0, 0, 0],
    inventoryBreakdown: [],
    ...(charts || {})
  };

  const safeTasks = tasks || [];

  const cards: Metric[] = [
    {
      title: "Total Inventory",
      value: safeMetrics.totalVehicles,
      icon: TruckIcon,
      trend: 2.5,
      color: "text-blue-600",
      link: `/admin/${adminSlug}/vehicles`
    },
    {
      title: "Units Sold",
      value: safeMetrics.vehiclesSold,
      icon: ClipboardDocumentCheckIcon,
      trend: 10,
      color: "text-green-600",
      link: `/admin/${adminSlug}/sales`
    },
    {
      title: "Active Listings",
      value: safeMetrics.activeListings,
      icon: ChartBarIcon,
      trend: 1.2,
      color: "text-indigo-600",
      link: `/admin/${adminSlug}/listings`
    },
    {
      title: "Revenue (MoM)",
      value: `KES ${(safeMetrics.revenueThisMonth ?? 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      trend: 5.4,
      color: "text-yellow-600",
      link: `/admin/${adminSlug}/finance`
    },
    {
      title: "Service Appointments",
      value: safeMetrics.serviceBookingsToday,
      icon: WrenchScrewdriverIcon,
      trend: -1.5,
      color: "text-red-600",
      link: `/admin/${adminSlug}/services`
    }
  ];

  return (
     <div className="min-h-screen bg-gray-50 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <motion.header className="mb-10 pb-4 border-b border-gray-200" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Dealership <span className="text-orange-500">Operations Hub</span>
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Real-time management of inventory, sales, and service bay schedule.
          </p>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {cards.map((card, index) => <MetricCard key={card.title} {...card} delay={0.3 + index * 0.05} />)}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                <SalesTrendsChart data={charts.salesTrend} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                <VehicleCategoriesChart data={charts.inventoryBreakdown} />
            </motion.div>
        </section>

        <motion.div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ClockIcon className='w-6 h-6 text-teal-600'/> Service & Sales Pipeline
                </h2>
                <a href={`/admin/${adminSlug}/tasks`} className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                    View Full Schedule <ArrowRightIcon className='w-4 h-4'/>
                </a>
            </div>
            {tasks.length > 0 ? (
                <ul className="space-y-4">
                    {tasks.map((task) => (
                        <li key={task.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-100 rounded-lg border-l-4 border-orange-500 hover:bg-gray-200 transition">
                            <div className="text-gray-900 font-medium truncate mb-1 sm:mb-0 flex items-center gap-2">
                                <WrenchScrewdriverIcon className="w-5 h-5 text-orange-500" />
                                {task.name}
                            </div>
                            <span className="text-sm text-gray-600 flex items-center gap-1 flex-shrink-0">
                                Due: <span className="font-semibold text-gray-800">{task.dueDate}</span> @ {task.dueTime}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center text-gray-500 py-8">The service bay is clear. No pending tasks.</div>
            )}
        </motion.div>
      </div>
    </div>
  );
}
