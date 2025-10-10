"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ScaleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowUpIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// --- TYPE DEFINITIONS ---
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
    trend: number;
    color: string;
}

interface FinanceLegalDashboardData {
  metrics: {
    totalClients: number;
    activeContracts: number;
    pendingInvoices: number;
    revenueThisMonth: number;
    scheduledMeetings: number;
  };
  tasks: Task[];
  charts: {
      caseDistribution: { type: string, count: number }[];
      revenueGrowth: number[];
  }
}

// --- METRIC CARD COMPONENT ---
interface MetricCardProps extends Metric {
    delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, link, color, delay }) => {
    const trendColor = trend > 0 ? 'text-green-400' : 'text-red-400';
    const TrendIcon = trend > 0 ? ArrowUpIcon : trend < 0 ? ArrowRightIcon : ClockIcon;

    return (
        <motion.a
            href={link}
            className={`group bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between border-t-4 ${color.replace('text-', 'border-')} hover:ring-2 ${color.replace('text-', 'ring-')} transition-all duration-300`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
        >
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl bg-gray-700 ${color} shadow-lg`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                    {trend !== 0 && (
                        <span className={`flex items-center text-sm font-medium ${trendColor}`}>
                            <TrendIcon className="w-4 h-4 mr-1" />
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-4xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mt-1">{title}</p>
            </div>
        </motion.a>
    );
};

// --- CHART COMPONENTS ---
const RevenueGrowthChart: React.FC<{ data: number[] }> = ({ data }) => {
    const maxVal = Math.max(...data, 1); // Avoid division by zero
    const monthLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return (
        <div className="p-6 bg-gray-800 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-3 flex items-center gap-2">
                <ChartBarIcon className='w-5 h-5 text-green-400'/> Revenue Growth (Last 5 Mo.)
            </h2>
            <div className="relative h-56 flex items-end justify-between px-2">
                {data.map((val, index) => (
                    <motion.div
                        key={index}
                        className="w-1/5 h-full flex flex-col justify-end items-center px-2 group"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.round((val / maxVal) * 100)}%` }}
                        transition={{ duration: 0.8, delay: 1.2 + index * 0.05 }}
                    >
                        <div className="w-full bg-blue-600 rounded-t-lg hover:bg-amber-400 transition-colors duration-200 relative cursor-pointer">
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                ${(val / 1000).toFixed(1)}K
                            </span>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{monthLabels[index]}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

const CaseDistributionChart: React.FC<{ data: {type: string, count: number}[] }> = ({ data }) => {
    const totalCases = data.reduce((sum, item) => sum + item.count, 0);
    const caseColors: { [key: string]: string } = {
        FINANCE: 'bg-yellow-500',
        LEGAL: 'bg-red-500',
        ADVISORY: 'bg-blue-500',
        DEFAULT: 'bg-gray-500'
    };

    return (
        <div className="p-6 bg-gray-800 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-3 flex items-center gap-2">
                <ChartPieIcon className='w-5 h-5 text-purple-400'/> Case Type Distribution
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-around h-56">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gray-800 rounded-full text-white text-lg font-bold flex items-center justify-center border-4 border-gray-700">
                        {totalCases}
                    </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-400 mt-6 md:mt-0">
                    {data.map((item) => (
                        <li key={item.type} className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${caseColors[item.type] || caseColors.DEFAULT}`}></span>
                            <span className="font-semibold text-gray-200">{Math.round((item.count/totalCases)*100)}%</span> - {item.type}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}


// --- MAIN DASHBOARD COMPONENT ---
export default function FinanceLegalDashboardClient() {
  const [data, setData] = useState<FinanceLegalDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/finance-legal/dashboard');
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.data?.message || "Failed to fetch dashboard data.");
            }
            setData(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-900 text-amber-400 flex flex-col items-center justify-center">
            <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
            <p className="text-xl font-semibold">Loading Command Center...</p>
        </div>
    );
  }

  if (error || !data) {
     return (
        <div className="min-h-screen bg-gray-900 text-red-400 flex flex-col items-center justify-center text-center p-4">
            <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Dashboard Offline</h2>
            <p>{error || "Could not retrieve critical data."}</p>
        </div>
    );
  }
  
  const { totalClients, activeContracts, pendingInvoices, revenueThisMonth, scheduledMeetings } = data.metrics;
  const adminSlug = 'firm-admin'; // Placeholder

  const cards: Metric[] = [
    { title: 'Clients', value: totalClients, icon: UserGroupIcon, trend: 5.0, color: 'text-blue-400', link: `/admin/${adminSlug}/clients` },
    { title: 'Active Contracts', value: activeContracts, icon: DocumentCheckIcon, trend: 2.1, color: 'text-teal-400', link: `/admin/${adminSlug}/contracts` },
    { title: 'Pending Invoices', value: pendingInvoices, icon: BriefcaseIcon, trend: 0, color: 'text-red-400', link: `/admin/${adminSlug}/invoices` },
    { title: 'Monthly Revenue', value: `$${revenueThisMonth.toLocaleString()}`, icon: CurrencyDollarIcon, trend: 8.5, color: 'text-green-400', link: `/admin/${adminSlug}/revenue` },
    { title: 'Today\'s Meetings', value: scheduledMeetings, icon: CalendarDaysIcon, trend: 0, color: 'text-purple-400', link: `/admin/${adminSlug}/meetings` },
  ];

  return (
    <div className="min-h-screen bg-gray-900 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <motion.header className="mb-10 pb-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Legal & Financial <span className="text-amber-400">Command Center</span>
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Focus on pending actions, financial health, and operational deadlines.
          </p>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {cards.map((card, index) => <MetricCard key={card.title} {...card} delay={0.3 + index * 0.05} />)}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
                <RevenueGrowthChart data={data.charts.revenueGrowth} />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>
                <CaseDistributionChart data={data.charts.caseDistribution} />
            </motion.div>
        </section>

        <motion.div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ClockIcon className='w-6 h-6 text-red-400'/> Critical Deadlines
                </h2>
                <a href={`/admin/${adminSlug}/tasks`} className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                    View All <ArrowRightIcon className='w-4 h-4'/>
                </a>
            </div>
            {data.tasks.length > 0 ? (
                <ul className="space-y-4">
                    {data.tasks.map((task) => (
                        <li key={task.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-700 rounded-lg border-l-4 border-amber-500 hover:bg-gray-600 transition">
                            <div className="text-gray-200 font-medium truncate mb-1 sm:mb-0 flex items-center gap-2">
                                <ScaleIcon className="w-5 h-5 text-amber-400" />
                                {task.name}
                            </div>
                            <span className="text-sm text-gray-400 flex items-center gap-1 flex-shrink-0">
                                Due: <span className="font-semibold text-white">{task.dueDate}</span> @ {task.dueTime}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="text-center text-gray-500 py-8">No critical deadlines for today or tomorrow.</div>
            )}
        </motion.div>
      </div>
    </div>
  );
}