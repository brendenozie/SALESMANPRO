"use client";

import React, { useEffect, useState, useCallback } from 'react';
// Simulating Link component behavior
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

// --- MOCK CHART COMPONENTS (FOR SINGLE-FILE MANDATE) ---

const ChartTwo: React.FC<{ data: any }> = ({ data }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-red-200">
    <span className="text-red-600 font-semibold text-sm">
      [Placeholder: Daily Orders Volume Chart]
    </span>
     <pre className="mt-2 text-xs text-red-500/80 bg-gray-50 p-2 rounded w-full text-left">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

const ChartThree: React.FC<{ data: any }> = ({ data }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-green-200">
    <span className="text-green-600 font-semibold text-sm">
      [Placeholder: Revenue Trends Analysis]
    </span>
     <pre className="mt-2 text-xs text-green-500/80 bg-gray-50 p-2 rounded w-full text-left">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

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
    dailyOrdersVolume: any;
    revenueTrends: any;
  }
}

// --- MAIN COMPONENT ---

export default function RestaurantDashboardClient() {
  const [data, setData] = useState<RestaurantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/restaurant/dashboard');
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.data?.message || 'Failed to fetch dashboard data');
        }
        setData(result.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const cards = data ? [
    { title: 'Total Orders', value: data.metrics.totalOrders, icon: ClipboardDocumentCheckIcon, accent: 'text-yellow-500 bg-yellow-100 border-yellow-500', link: '/admin/orders', description: 'Total served today.' },
    { title: 'Active Deliveries', value: data.metrics.activeDeliveries, icon: TruckIcon, accent: 'text-blue-500 bg-blue-100 border-blue-500', link: '/admin/deliveries', description: 'Currently on the road.' },
    { title: 'Menu Items', value: data.metrics.menuItems, icon: FireIcon, accent: 'text-red-500 bg-red-100 border-red-500', link: '/admin/menu', description: 'Dishes available.' },
    { title: 'Revenue Today', value: `$${data.metrics.revenueToday.toLocaleString()}`, icon: CurrencyDollarIcon, accent: 'text-green-500 bg-green-100 border-green-500', link: '/admin/revenue', description: 'As of last update.' },
  ] : [];

  // Component for visually appealing metric cards
  const MetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card }) => (
    <a
      key={card.title}
      href={card.link}
      className={`relative p-6 rounded-2xl bg-white shadow-xl transition duration-300 hover:shadow-2xl transform group cursor-pointer border-l-4 ${card.accent.split(' ')[2]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-full p-2 ${card.accent.split(' ')[1]}`}>
          <card.icon className={`w-7 h-7 ${card.accent.split(' ')[0]}`} />
        </div>
        <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
      <p className="text-4xl font-extrabold text-gray-900 mt-1">{card.value}</p>
      <h2 className="mt-2 text-lg font-semibold text-gray-700">{card.title}</h2>
      <p className="mt-1 text-xs text-gray-500">{card.description}</p>
    </a>
  ), []);

  // Component for the Actionable Task List
  const TaskList: React.FC<{ tasks: Task[] }> = useCallback(({ tasks }) => (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b-2 border-red-300 pb-3">
        <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <FireIcon className="w-6 h-6 text-red-600" /> Rush Tasks
        </h3>
        <a href="/admin/tasks" className="text-sm text-red-600 font-semibold hover:text-red-800 flex items-center">
          View Full Ticket Log <ArrowRightIcon className="w-4 h-4 ml-1" />
        </a>
      </div>
      <ul className="space-y-3">
        {tasks.map((t) => (
          <li key={t.id} className="flex justify-between items-center p-4 bg-red-50 rounded-xl border-l-4 border-red-500 hover:bg-red-100 transition cursor-pointer shadow-sm">
            <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-800">{t.name}</span>
                <span className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" /> DUE {t.dueTime}
                </span>
            </div>
            <TicketIcon className="w-6 h-6 text-red-400" />
          </li>
        ))}
      </ul>
      {tasks.length === 0 && (
         <div className="py-6 text-center text-lg text-gray-500 flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            Kitchen is running smoothly.
         </div>
      )}
    </div>
  ), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex items-center gap-3 text-red-600">
          <RocketLaunchIcon className="w-6 h-6" />
          <span className="text-xl font-semibold">Pre-heating the system...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
            <ExclamationTriangleIcon className="w-10 h-10 mx-auto mb-4 text-red-500" />
            <h2 className="font-bold text-lg text-gray-800 mb-2">Could Not Load Dashboard</h2>
            <p className="text-sm text-gray-500">{error || "An unknown error occurred."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        <header className="mb-10 p-8 rounded-3xl shadow-xl" style={{ backgroundImage: 'linear-gradient(135deg, #44403c 0%, #1c1917 100%)' }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-yellow-400 font-semibold mb-1">Service Operations</p>
              <h1 className="text-5xl font-extrabold tracking-tight text-white">
                Restaurant Control Panel
              </h1>
              <p className="mt-2 text-gray-300">Monitor flow, optimize speed, and ensure customer satisfaction.</p>
            </div>
            <a
              href="/admin/order/new"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition transform hover:scale-105 shadow-lg shadow-red-500/50"
            >
              <TicketIcon className="w-5 h-5" />
              Start New Order
            </a>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <MetricCard key={card.title} card={card} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-red-500" /> Daily Order Flow
              </h3>
              <div className="min-h-[300px]">
                <ChartTwo data={data.charts.dailyOrdersVolume} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-6 h-6 text-green-500" /> Revenue & Sales Trends
              </h3>
              <div className="min-h-[300px]">
                <ChartThree data={data.charts.revenueTrends} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <TaskList tasks={data.tasks} />
          </div>
        </section>
      </div>
    </div>
  );
}