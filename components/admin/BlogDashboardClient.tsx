"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  PencilSquareIcon,
  FolderOpenIcon,
  UserGroupIcon,
  EyeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

// Dynamic import for ApexCharts to prevent SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- APEX CHART COMPONENTS ---

const TrafficChart: React.FC<{ data: any }> = ({ data }) => {
  const series = [{
    name: 'Page Views',
    data: data?.values || [3100, 4000, 2800, 5100, 4200, 10900, 10000]
  }];

  const options: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#0d9488'], // teal-600
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: '#94a3b8' } }
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    grid: { borderColor: '#f1f5f9' },
    tooltip: { theme: 'light' }
  };

  return <Chart options={options} series={series} type="area" height={300} />;
};

const EngagementChart: React.FC<{ data: any }> = ({ data }) => {
  const series = [
    { name: 'Likes', data: data?.likes || [44, 55, 41, 67, 22, 43, 21] },
    { name: 'Comments', data: data?.comments || [13, 23, 20, 8, 13, 27, 33] }
  ];

  const options: any = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
    colors: ['#0ea5e9', '#f43f5e'], // sky-500, rose-500
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.labels || ['Post A', 'Post B', 'Post C', 'Post D', 'Post E', 'Post F', 'Post G'],
      labels: { style: { colors: '#94a3b8' } }
    },
    legend: { position: 'top', horizontalAlign: 'right', fontWeight: 600 },
    grid: { borderColor: '#f1f5f9' },
  };

  return <Chart options={options} series={series} type="bar" height={300} />;
};

// --- TYPE DEFINITIONS ---

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

export interface DashboardData {
  metrics: {
    totalPosts: number;
    totalCategories: number;
    subscribers: number;
    monthlyViews: number;
    scheduledPosts: number;
  };
  tasks: Task[];
  charts: {
    trafficOverview: any;
    engagementMetrics: any;
  }
}

// --- MAIN COMPONENT ---

export default function BlogDashboardClient() {
  const { slug: companyId } = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/dashboard/blog/${companyId}`);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error('Failed to fetch dashboard data');
        setData(result.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [companyId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-teal-600">
      <RocketLaunchIcon className="w-12 h-12 animate-pulse mb-4" />
      <span className="text-sm font-black uppercase tracking-[0.3em]">Syncing Editorial Core</span>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50 p-6">
        <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-rose-900 font-bold">{error || "Console Offline"}</p>
        </div>
    </div>
  );

  const cards = [
    { title: 'Library', value: data.metrics.totalPosts, icon: PencilSquareIcon, accent: 'text-teal-600', sub: 'Published Posts' },
    { title: 'Taxonomy', value: data.metrics.totalCategories, icon: FolderOpenIcon, accent: 'text-blue-600', sub: 'Categories' },
    { title: 'Audience', value: data.metrics.subscribers.toLocaleString(), icon: UserGroupIcon, accent: 'text-indigo-600', sub: 'Active Subs' },
    { title: 'Reach', value: data.metrics.monthlyViews.toLocaleString(), icon: EyeIcon, accent: 'text-amber-600', sub: 'Monthly Views' },
    { title: 'Pipeline', value: data.metrics.scheduledPosts, icon: CalendarDaysIcon, accent: 'text-rose-600', sub: 'Scheduled' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFF] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Editorial <span className="text-teal-600">Console</span></h1>
            <p className="text-slate-500 font-medium mt-1">Manage content velocity and audience growth.</p>
          </div>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:bg-teal-700 transition-all flex items-center gap-2">
            <PencilSquareIcon className="w-5 h-5" /> New Masterpiece
          </button>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          {cards.map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-opacity-10 ${card.accent.replace('text-', 'bg-')} ${card.accent}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.title}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <EyeIcon className="w-6 h-6 text-teal-500" /> Readers over Time
                </h3>
                <TrafficChart data={data.charts.trafficOverview} />
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <UserGroupIcon className="w-6 h-6 text-sky-500" /> Interaction Density
                </h3>
                <EngagementChart data={data.charts.engagementMetrics} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl shadow-teal-900/20">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black">Editorial Queue</h3>
                    <CheckIcon className="w-6 h-6 text-teal-400" />
                </div>
                <div className="space-y-4">
                    {data.tasks.map(task => (
                        <div key={task.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition cursor-pointer">
                            <p className="font-bold text-sm text-white mb-1">{task.name}</p>
                            <div className="flex items-center text-[10px] font-bold text-teal-400 uppercase tracking-tighter">
                                <ClockIcon className="w-3 h-3 mr-1" /> {task.dueTime} • {task.dueDate}
                            </div>
                        </div>
                    ))}
                    {data.tasks.length === 0 && <p className="text-slate-500 italic text-sm">Queue is empty.</p>}
                </div>
                <button className="w-full mt-6 py-3 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition">
                    View Full Calendar
                </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}