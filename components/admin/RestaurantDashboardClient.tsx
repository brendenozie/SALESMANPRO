"use client";

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  TruckIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  TicketIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

// Dynamic import for ApexCharts to support Next.js SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- FUNCTIONAL APEX CHART COMPONENTS ---

const OrderFlowChart: React.FC<{ data: any[] }> = ({ data }) => {
  const series = [{
    name: "Orders",
    data: data?.map(d => d.count || d.value) || []
  }];

  const options: any = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
    },
    stroke: { curve: 'stepline', width: 4 }, // Stepline is great for "rush" visualization
    colors: ['#ef4444'], // red-500
    markers: { size: 0 },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    xaxis: {
      categories: data?.map(d => d.time || d.name) || [],
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: { labels: { style: { colors: '#64748b' } } },
    tooltip: { theme: 'light' },
    fill: {
      type: 'gradient',
      gradient: { shade: 'dark', gradientToColors: ['#f87171'], stops: [0, 100] }
    }
  };

  return <Chart options={options} series={series} type="line" height={300} />;
};

const RevenueTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  const series = [{
    name: "Revenue ($)",
    data: data?.map(d => d.amount || d.value) || []
  }];

  const options: any = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '55%',
        distributed: true,
      }
    },
    colors: ['#22c55e', '#16a34a', '#15803d', '#166534'], // green shades
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.map(d => d.day || d.name) || [],
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#64748b' },
        formatter: (val: number) => `$${val}`
      }
    },
    grid: { show: false },
    legend: { show: false },
    tooltip: { 
      theme: 'light',
      y: { formatter: (val: number) => `$${val.toLocaleString()}` }
    }
  };

  return <Chart options={options} series={series} type="bar" height={300} />;
};

// --- TYPE DEFINITIONS ---

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface RestaurantDashboardData {
  metrics: {
    totalOrders: number;
    activeDeliveries: number;
    menuItems: number;
    revenueToday: number;
  };
  tasks: Task[];
  charts: {
    dailyOrdersVolume: any[];
    revenueTrends: any[];
  }
}

// --- MAIN COMPONENT ---

export default function RestaurantDashboardClient() {
  const { slug: companyId } = useParams();
  const [data, setData] = useState<RestaurantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/dashboard/restaurent/${companyId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.data?.message || 'Failed to fetch');
        setData(result.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [companyId]);

  const cards = data ? [
    { title: 'Total Orders', value: data.metrics.totalOrders, icon: ClipboardDocumentCheckIcon, accent: 'text-yellow-500 bg-yellow-100 border-yellow-500', link: '/admin/orders', description: 'Total served today.' },
    { title: 'Active Deliveries', value: data.metrics.activeDeliveries, icon: TruckIcon, accent: 'text-blue-500 bg-blue-100 border-blue-500', link: '/admin/deliveries', description: 'Currently on the road.' },
    { title: 'Menu Items', value: data.metrics.menuItems, icon: FireIcon, accent: 'text-red-500 bg-red-100 border-red-500', link: '/admin/menu', description: 'Dishes available.' },
    { title: 'Revenue Today', value: `$${data.metrics.revenueToday.toLocaleString()}`, icon: CurrencyDollarIcon, accent: 'text-green-500 bg-green-100 border-green-500', link: '/admin/revenue', description: 'As of last update.' },
  ] : [];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 text-red-600 font-bold">
       <RocketLaunchIcon className="w-8 h-8 animate-bounce mr-3" /> Pre-heating the system...
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-200">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="font-bold text-xl text-gray-800">Connection Error</h2>
          <p className="text-gray-500 mt-2">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-16">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        <header className="mb-10 p-10 rounded-[2rem] shadow-2xl text-white" style={{ backgroundImage: 'linear-gradient(135deg, #44403c 0%, #1c1917 100%)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <span className="bg-yellow-500/20 text-yellow-400 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">Live Kitchen Data</span>
              <h1 className="text-5xl font-black mt-2 tracking-tight">Restaurant Control</h1>
              <p className="mt-2 text-stone-400 text-lg">Operational oversight for {companyId}</p>
            </div>
            <a href="/admin/order/new" className="px-8 py-4 bg-red-600 rounded-2xl font-black text-lg hover:bg-red-700 transition transform hover:scale-105 shadow-xl shadow-red-900/40 flex items-center gap-3">
              <TicketIcon className="w-6 h-6" /> START NEW ORDER
            </a>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <div key={card.title} className={`p-6 bg-white rounded-2xl shadow-lg border-l-8 ${card.accent.split(' ')[2]} transition-all hover:translate-y-[-4px]`}>
              <div className={`w-12 h-12 rounded-xl ${card.accent.split(' ')[1]} flex items-center justify-center mb-4`}>
                <card.icon className={`w-7 h-7 ${card.accent.split(' ')[0]}`} />
              </div>
              <p className="text-4xl font-black text-stone-900">{card.value}</p>
              <h2 className="font-bold text-stone-500 mt-1">{card.title}</h2>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-stone-800 flex items-center gap-3">
                  <FireIcon className="w-8 h-8 text-red-500" /> Rush Hour Flow
                </h3>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Real-time Volume</span>
              </div>
              <OrderFlowChart data={data.charts.dailyOrdersVolume} />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100">
              <h3 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3">
                <CurrencyDollarIcon className="w-8 h-8 text-green-500" /> Revenue Performance
              </h3>
              <RevenueTrendChart data={data.charts.revenueTrends} />
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 sticky top-8">
              <div className="flex justify-between items-center mb-6 border-b-4 border-red-500 pb-4">
                <h3 className="text-2xl font-black text-stone-900">Rush Tasks</h3>
                <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-1 rounded-md">{data.tasks.length} Active</span>
              </div>
              
              <div className="space-y-4">
                {data.tasks.length > 0 ? data.tasks.map(t => (
                  <div key={t.id} className="p-5 bg-red-50 rounded-2xl border-l-4 border-red-500 flex justify-between items-center group cursor-pointer hover:bg-red-100 transition">
                    <div>
                      <p className="font-black text-stone-800 group-hover:text-red-700">{t.name}</p>
                      <p className="text-sm font-bold text-red-500 mt-1 flex items-center gap-1 uppercase tracking-tighter">
                        <ClockIcon className="w-4 h-4" /> Due: {t.dueTime}
                      </p>
                    </div>
                    <TicketIcon className="w-6 h-6 text-red-300" />
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto opacity-20" />
                    <p className="mt-4 font-bold text-stone-400">Kitchen is Clean</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}