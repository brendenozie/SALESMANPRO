"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  FilmIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PlayCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

import { useParams } from 'next/navigation';

// Dynamic import for ApexCharts to prevent SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- APEX CHART COMPONENTS ---

const ViewerTrendsChart: React.FC<{ data?: any }> = () => {
  const series = [{
    name: 'Viewers',
    data: [310, 400, 280, 510, 420, 109, 100]
  }];

  const options: any = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
    colors: ['#22d3ee'], // cyan-400
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0, stops: [0, 90, 100] }
    },
    dataLabels: { enabled: false },
    grid: { borderColor: '#374151', strokeDashArray: 4 },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: '#9ca3af' } }
    },
    yaxis: { labels: { style: { colors: '#9ca3af' } } },
    theme: { mode: 'dark' },
    tooltip: { theme: 'dark' }
  };

  return <Chart options={options} series={series} type="area" height={250} />;
};

const CategoryDonutChart: React.FC = () => {
  const series = [44, 32, 14, 10];
  const options: any = {
    chart: { type: 'donut' },
    labels: ['Entertainment', 'Tech', 'Lifestyle', 'News'],
    colors: ['#22d3ee', '#818cf8', '#f472b6', '#fbbf24'],
    plotOptions: {
      pie: {
        donut: { size: '75%', labels: { show: true, total: { show: true, label: 'Media', color: '#fff' } } }
      }
    },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
    stroke: { show: false }
  };

  return <Chart options={options} series={series} type="donut" height={250} />;
};

// --- TYPES & INTERFACES ---

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

// --- SUB-COMPONENTS ---

const MetricCard: React.FC<any> = ({ title, value, icon: Icon, trend, delay }) => {
  const isPositive = trend >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="bg-gray-800/50 backdrop-blur-md p-5 rounded-2xl border border-gray-700 hover:border-cyan-500/50 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-900 rounded-lg group-hover:bg-cyan-500/10 transition-colors">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-2xl font-black text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{title}</p>
    </motion.div>
  );
};

export default function MediaDashboardClient() {
  const { slug: companyId } = useParams();
  const [data, setData] = useState<MediaDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/admin/dashboard/media?companyId=${companyId}`);
        const result = await response.json();
        if (!response.ok) throw new Error("Connection failed");
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  if (isLoading) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <PlayCircleIcon className="w-8 h-8 text-cyan-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="mt-4 text-cyan-500 font-bold tracking-tighter animate-pulse uppercase">Initializing Studio...</p>
    </div>
  );

  const metrics = [
    { title: 'Videos', value: data?.metrics.totalVideos, icon: FilmIcon, trend: 8.5 },
    { title: 'Subscribers', value: data?.metrics.activeSubscribers, icon: UserGroupIcon, trend: 12.3 },
    { title: 'Revenue', value: `$${data?.metrics.revenueThisMonth.toLocaleString()}`, icon: CurrencyDollarIcon, trend: 5.2 },
    { title: 'Scheduled', value: data?.metrics.premieresScheduled, icon: PlayCircleIcon, trend: 0 },
    { title: 'Articles', value: data?.metrics.totalArticles, icon: DocumentTextIcon, trend: -1.1 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-gray-100 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Studio Live</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">Production <span className="text-cyan-400">Hub</span></h1>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm transition border border-gray-700">
                <SignalIcon className="w-4 h-4" /> Go Live
            </button>
            <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 rounded-xl font-bold text-sm text-gray-900 transition shadow-lg shadow-cyan-500/20">
                <PlusIcon className="w-4 h-4" /> Upload Content
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {metrics.map((m, i) => <MetricCard key={i} {...m} delay={i * 0.1} />)}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-gray-800/40 border border-gray-700 p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2"><ChartBarIcon className="w-5 h-5 text-cyan-400" /> Audience Retention</h3>
                    <select className="bg-gray-900 border-none text-xs font-bold rounded-lg focus:ring-0">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
                <ViewerTrendsChart />
            </div>

            <div className="bg-gray-800/40 border border-gray-700 p-6 rounded-3xl">
                <h3 className="font-bold mb-6 flex items-center gap-2"><CalendarDaysIcon className="w-5 h-5 text-orange-400" /> Editorial Pipeline</h3>
                <div className="space-y-3">
                    {data?.tasks.map(task => (
                        <div key={task.id} className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700 hover:border-gray-500 transition-colors group cursor-pointer">
                            <p className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">{task.name}</p>
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-[10px] font-black uppercase text-gray-500">{task.dueDate}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-800 rounded-md text-cyan-400">{task.dueTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

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