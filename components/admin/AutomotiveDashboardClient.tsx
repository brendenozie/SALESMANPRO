"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Using simple anchor tags (<a>) instead of Next.js <Link> for single-file mandate
import {
  TruckIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowRightIcon,
   // Placeholder for vehicle category
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface Metric {
    title: string;
    value: string | number;
    icon: React.ElementType;
    link: string;
    trend: number; // Mock trend indicator
    color: string;
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
}

const sampleData: AutomotiveDashboardData = {
  metrics: {
    totalVehicles: 184,
    vehiclesSold: 32,
    activeListings: 97,
    revenueThisMonth: 540000,
    serviceBookingsToday: 6,
  },
  tasks: [
    { id: '1', name: 'Test Drive - Toyota RAV4', dueDate: 'Today', dueTime: '10:30 AM' },
    { id: '2', name: 'Oil Change - Ford Ranger', dueDate: 'Today', dueTime: '1:00 PM' },
    { id: '3', name: 'Customer Pickup - Mazda CX-5', dueDate: 'Today', dueTime: '4:00 PM' },
  ],
};

// --- Metric Card Component (High-Energy Design) ---
interface MetricCardProps extends Metric {
    delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, link, color, delay }) => {
    const trendColor = trend > 0 ? 'text-green-600' : 'text-red-600';
    const trendIcon = trend > 0 ? ArrowUpIcon : ArrowRightIcon;

    return (
        <motion.a
            href={link}
            className="group bg-white p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all duration-300 border border-gray-100 hover:ring-2 hover:ring-offset-2 hover:ring-teal-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
        >
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-')} bg-opacity-10 ${color} shadow-md`}>
                    <Icon className="w-7 h-7" />
                </div>
                <div className="text-right">
                    {trend !== 0 && (
                        <span className={`flex items-center text-sm font-semibold ${trendColor}`}>
                            {React.createElement(trendIcon, { className: "w-4 h-4 mr-1" })}
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1 group-hover:text-teal-600 transition-colors">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
        </motion.a>
    );
};

// --- Mock Bar Chart for Sales Trends ---
const SalesTrendsChart: React.FC = () => {
    const data = [12, 18, 15, 22, 32]; // Sales last 5 months
    const maxVal = 35; // Set max for visual scale

    return (
        <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3 flex items-center gap-2">
                <ChartBarIcon className='w-5 h-5 text-indigo-600'/> Monthly Sales Trend (Units)
            </h2>
            <div className="relative h-56 flex items-end justify-between px-2">
                {data.map((val, index) => {
                    const heightPercentage = Math.round((val / maxVal) * 100);
                    const monthLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun'];

                    return (
                        <motion.div
                            key={index}
                            className="w-1/5 h-full flex flex-col justify-end items-center px-2 group"
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercentage}%` }}
                            transition={{ duration: 0.8, delay: 0.7 + index * 0.05 }}
                        >
                            <div className="w-full bg-orange-500 rounded-t-lg shadow-lg hover:bg-teal-500 transition-colors duration-200 relative cursor-pointer">
                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                                    {val}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2">{monthLabels[index]}</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Mock Vehicle Categories Donut Chart ---
const VehicleCategoriesChart: React.FC = () => {
    // Data: Sedan, Truck/SUV, Luxury, Economy
    const categories = [40, 35, 15, 10]; // Sum is 100%
    const labels = ['Truck/SUV', 'Sedan', 'Luxury', 'Economy'];
    const colors = ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-gray-500'];

    return (
        <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3 flex items-center gap-2">
                <TruckIcon className='w-5 h-5 text-orange-600'/> Inventory Breakdown by Type
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-around h-56">
                
                {/* Mock Donut Chart */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full" style={{
                        background: `conic-gradient(
                            var(--tw-cat-1) 0% 40%,
                            var(--tw-cat-2) 40% 75%,
                            var(--tw-cat-3) 75% 90%,
                            var(--tw-cat-4) 90% 100%
                        )`,
                        // Mocking Tailwind colors
                        // '--tw-cat-1': '#3B82F6', // Blue 40%
                        // '--tw-cat-2': '#F97316', // Orange 35%
                        // '--tw-cat-3': '#9333EA', // Purple 15%
                        // '--tw-cat-4': '#6B7280', // Gray 10%
                    }}></div>
                    <div className="w-24 h-24 bg-white rounded-full text-gray-700 text-sm flex flex-col items-center justify-center border-4 border-gray-200 shadow-inner">
                        <span className='font-bold text-lg'>184</span>
                        <span className='text-xs'>Units</span>
                    </div>
                </div>

                {/* Legend */}
                <ul className="space-y-2 text-sm text-gray-700 mt-6 md:mt-0">
                    {categories.map((percent, index) => (
                        <li key={index} className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${colors[index]}`}></span>
                            <span className="font-semibold text-gray-900">{percent}%</span> - {labels[index]}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

// --- Main Dashboard Component ---

export default function AutomotiveDashboardClient() {
  const [data] = useState<AutomotiveDashboardData>(sampleData);
  const adminSlug = 'dealership-admin';

  const {
    totalVehicles,
    vehiclesSold,
    activeListings,
    revenueThisMonth,
    serviceBookingsToday,
  } = data.metrics;

  const cards: Metric[] = [
    {
      title: 'Total Inventory',
      value: totalVehicles,
      icon: TruckIcon,
      trend: 2.5, // Stock acquisition trend
      color: 'text-blue-600',
      link: `/admin/${adminSlug}/vehicles`,
    },
    {
      title: 'Units Sold (MoM)',
      value: vehiclesSold,
      icon: ClipboardDocumentCheckIcon,
      trend: 10.3, // Key sales metric
      color: 'text-green-600',
      link: `/admin/${adminSlug}/sales`,
    },
    {
      title: 'Active Listings',
      value: activeListings,
      icon: ChartBarIcon,
      trend: 0.8,
      color: 'text-indigo-600',
      link: `/admin/${adminSlug}/listings`,
    },
    {
      title: 'Gross Revenue (MoM)',
      value: `$${(revenueThisMonth / 1000).toFixed(1)}K`,
      icon: CurrencyDollarIcon,
      trend: 15.1,
      color: 'text-orange-600',
      link: `/admin/${adminSlug}/revenue`,
    },
    {
      title: 'Service Bookings',
      value: serviceBookingsToday,
      icon: WrenchScrewdriverIcon,
      trend: 0,
      color: 'text-teal-600',
      link: `/admin/${adminSlug}/bookings`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <motion.header
          className="mb-10 pb-4 border-b border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Dealership <span className="text-orange-500">Operations Hub</span>
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Real-time management of inventory, sales, and service bay schedule.
          </p>
        </motion.header>

        {/* --- Metric Cards --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {cards.map((card, index) => (
            <MetricCard key={card.title} {...card} delay={0.3 + index * 0.05} />
          ))}
        </section>

        {/* --- Charts: Sales Trends & Inventory --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <SalesTrendsChart />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
            >
                <VehicleCategoriesChart />
            </motion.div>
        </section>

        {/* --- Today's Service & Sales Tasks --- */}
        <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
        >
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ClockIcon className='w-6 h-6 text-teal-600'/> Service & Sales Pipeline
                </h2>
                <a href={`/admin/${adminSlug}/tasks`} className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                    View Full Schedule <ArrowRightIcon className='w-4 h-4'/>
                </a>
            </div>
            <ul className="space-y-4">
                {data.tasks.map((task) => (
                    <li
                        key={task.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-100 rounded-lg border-l-4 border-orange-500 hover:bg-gray-200 transition"
                    >
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
        </motion.div>

      </div>
    </div>
  );
}
