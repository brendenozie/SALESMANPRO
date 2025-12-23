"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  UsersIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChartBarSquareIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';

// Dynamic import for ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiBaseUrl = 'http://127.0.0.1:3000/api';

// --- APEX CHART COMPONENTS ---

const QRRChart: React.FC<{ data: any }> = ({ data }) => {
  const series = [{
    name: "Revenue",
    data: data?.values || [32000, 41000, 38000, 51000, 49000, 62000]
  }];

  const options: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#4f46e5'], // indigo-600
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: { labels: { style: { colors: '#64748b' }, formatter: (val: number) => `$${val / 1000}k` } },
    grid: { borderColor: '#f1f5f9' },
    tooltip: { theme: 'light' }
  };

  return <Chart options={options} series={series} type="area" height={250} />;
};

const ConversionFunnelChart: React.FC<{ data: any }> = ({ data }) => {
  const series = [{
    name: "Prospects",
    data: data?.values || [500, 380, 210, 80, 42]
  }];

  const options: any = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 4, horizontal: true, barHeight: '70%', distributed: true }
    },
    colors: ['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3'],
    dataLabels: { 
        enabled: true, 
        textAnchor: 'start', 
        style: { colors: ['#fff'] },
        formatter: (val: any, opt: any) => `${opt.w.globals.labels[opt.dataPointIndex]}: ${val}`
    },
    xaxis: { categories: ['Leads', 'Qualified', 'Consulted', 'Proposed', 'Won'] },
    yaxis: { labels: { show: false } },
    grid: { show: false },
    legend: { show: false }
  };

  return <Chart options={options} series={series} type="bar" height={250} />;
};

// --- INTERFACES & TYPES ---
export interface CoachTask {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface CoachDashboardData {
  metrics: {
    activeClients: number;
    sessionsThisWeek: number;
    programSalesYTD: number;
    billedRevenueYTD: number;
    openLeads: number;
  };
  tasks: CoachTask[];
  charts: {
      qrr: any;
      funnel: any;
  }
}

// --- SUB-COMPONENTS ---
const MainMetricCard: React.FC<{ card: any }> = ({ card }) => (
    <motion.a 
        href={card.link} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-6 rounded-3xl bg-white shadow-lg border border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-1 group`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-2xl p-3 ${card.accentBg}`}>
          <card.icon className={`w-7 h-7 ${card.accentText}`} />
        </div>
        <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
      </div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">{card.title}</p>
      <p className="text-3xl font-black text-gray-900 mt-1">{card.value.toLocaleString()}</p>
    </motion.a>
);

export default function CoachDashboardClient() {
  const coachId = 'demo-coach-123';
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Simulated API response including chart data
            await new Promise(r => setTimeout(r, 1000));
            setData({
                metrics: { activeClients: 42, sessionsThisWeek: 18, programSalesYTD: 124, billedRevenueYTD: 154780, openLeads: 9 },
                tasks: [
                    { id: 't1', name: 'Prep QBR deck for Zenith Corp.', dueDate: '2025-10-21', dueTime: '10:00 AM', priority: 'High' },
                    { id: 't2', name: 'Follow up with 3 open leads.', dueDate: '2025-10-21', dueTime: '02:30 PM', priority: 'Medium' },
                ],
                charts: { qrr: null, funnel: null }
            });
        } catch (err: any) {
            setError("Failed to sync growth data.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-indigo-600">
      <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
      <p className="text-lg font-black uppercase tracking-widest">Optimizing Performance...</p>
    </div>
  );

  const metricCards = [
    { title: 'Active Clients', value: data?.metrics.activeClients, icon: UsersIcon, accentBg: 'bg-indigo-50', accentText: 'text-indigo-600', link: '#' },
    { title: 'Weekly Sessions', value: data?.metrics.sessionsThisWeek, icon: CalendarDaysIcon, accentBg: 'bg-purple-50', accentText: 'text-purple-600', link: '#' },
    { title: 'Program Sales', value: data?.metrics.programSalesYTD, icon: BookOpenIcon, accentBg: 'bg-amber-50', accentText: 'text-amber-600', link: '#' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 leading-none">Growth <span className="text-indigo-600">Command</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Strategy & Operations Overview</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition">Log Session</button>
            <button className="bg-indigo-600 px-6 py-3 rounded-2xl font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition">+ New Client</button>
          </div>
        </header>

        {/* --- Highlight Row --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <p className="text-indigo-100 font-bold uppercase tracking-widest text-sm mb-2">Billed Revenue YTD</p>
                    <h2 className="text-6xl font-black">${data?.metrics.billedRevenueYTD.toLocaleString()}</h2>
                </div>
                <div className="mt-8 flex gap-4 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10">↑ 12% vs last month</div>
                </div>
                {/* Abstract shape for flair */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-amber-400 rounded-[2.5rem] p-10 text-amber-950 flex flex-col justify-between shadow-xl">
                <div>
                    <BriefcaseIcon className="w-10 h-10 mb-4 opacity-80" />
                    <p className="font-bold uppercase tracking-widest text-sm mb-1">Open Leads</p>
                    <h2 className="text-6xl font-black">{data?.metrics.openLeads}</h2>
                </div>
                <button className="w-full bg-amber-950 text-white py-4 rounded-2xl font-bold mt-6 hover:bg-black transition">Start Outreach</button>
            </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {metricCards.map((card, i) => <MainMetricCard key={i} card={card} />)}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <ChartBarSquareIcon className="w-6 h-6 text-indigo-500" /> Revenue Trajectory
                    </h3>
                    <QRRChart data={data?.charts.qrr} />
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-purple-500" /> Client Acquisition Funnel
                    </h3>
                    <ConversionFunnelChart data={data?.charts.funnel} />
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-fit">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <PuzzlePieceIcon className="w-6 h-6 text-amber-500" /> Action Items
                </h3>
                <div className="space-y-4">
                    {data?.tasks.map(task => (
                        <div key={task.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${
                                    task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                    {task.priority}
                                </span>
                                <div className="flex items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    <span className="text-xs font-bold">{task.dueTime}</span>
                                </div>
                            </div>
                            <p className="font-bold text-slate-800 leading-snug">{task.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}