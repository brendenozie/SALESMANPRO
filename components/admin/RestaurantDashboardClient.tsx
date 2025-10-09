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
} from '@heroicons/react/24/outline';

// --- MOCK CHART COMPONENTS (FOR SINGLE-FILE MANDATE) ---

const ChartTwo = () => (
  <div className="flex items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-red-200">
    <span className="text-red-600 font-semibold text-sm">
      [Placeholder: Daily Orders Volume Chart]
    </span>
  </div>
);

const ChartThree = () => (
  <div className="flex items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-green-200">
    <span className="text-green-600 font-semibold text-sm">
      [Placeholder: Revenue Trends Analysis]
    </span>
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
}

// --- DATA & API SIMULATION ---

const sampleData: RestaurantDashboardData = {
  metrics: {
    totalOrders: 325,
    activeDeliveries: 28,
    menuItems: 85,
    revenueToday: 18200,
  },
  tasks: [
    { id: '1', name: 'Prepare Chicken Alfredo (Order #182)', dueDate: '12:15 PM', dueTime: '12:15 PM' },
    { id: '2', name: 'Assign Delivery: Order #184', dueDate: '12:30 PM', dueTime: '12:30 PM' },
    { id: '3', name: 'Restock Fresh Basil', dueDate: '03:00 PM', dueTime: '03:00 PM' },
  ],
};

// --- MAIN COMPONENT ---

export default function RestaurantDashboardClient() {
  const [data, setData] = useState<RestaurantDashboardData>(sampleData);
  const [loading, setLoading] = useState(true);

  // Simulate data fetch
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600)); 
      setData(sampleData);
      setLoading(false);
    };
    loadData();
  }, []);

  const { totalOrders, activeDeliveries, menuItems, revenueToday } = data.metrics;

  const cards = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ClipboardDocumentCheckIcon,
      accent: 'text-yellow-500 bg-yellow-100 border-yellow-500',
      link: '/admin/orders',
      description: 'Total served today.',
    },
    {
      title: 'Active Deliveries',
      value: activeDeliveries,
      icon: TruckIcon,
      accent: 'text-blue-500 bg-blue-100 border-blue-500',
      link: '/admin/deliveries',
      description: 'Currently on the road.',
    },
    {
      title: 'Menu Items',
      value: menuItems,
      icon: FireIcon,
      accent: 'text-red-500 bg-red-100 border-red-500',
      link: '/admin/menu',
      description: 'Dishes available.',
    },
    {
      title: 'Revenue Today',
      value: `$${revenueToday.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      accent: 'text-green-500 bg-green-100 border-green-500',
      link: '/admin/revenue',
      description: 'As of closing.',
    },
  ];

  // Component for visually appealing metric cards
  const MetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card }) => (
    <a
      key={card.title}
      href={card.link}
      className={`relative p-6 rounded-2xl bg-white shadow-xl transition duration-300 hover:shadow-2xl transform group cursor-pointer border-l-4 ${card.accent.split(' ').slice(2, 3).join(' ')}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-full p-2 ${card.accent.split(' ').slice(1, 2).join(' ')}`}>
          <card.icon className={`w-7 h-7 ${card.accent.split(' ')[0]}`} />
        </div>
        <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
      
      {/* Value */}
      <p className="text-4xl font-extrabold text-gray-900 mt-1">{card.value}</p>
      
      {/* Title and Description */}
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
          <li
            key={t.id}
            className="flex justify-between items-center p-4 bg-red-50 rounded-xl border-l-4 border-red-500 hover:bg-red-100 transition cursor-pointer shadow-sm"
          >
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Main Header - Urgency and Focus */}
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

        {/* Metrics Cards - Real-time Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <MetricCard key={card.title} card={card} />
          ))}
        </section>

        {/* Main Content: Charts and Tasks */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Charts Section (2/3 width) - Performance Over Time */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-red-500" /> Daily Order Flow
              </h3>
              <div className="min-h-[300px]">
                <ChartTwo />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-6 h-6 text-green-500" /> Revenue & Sales Trends
              </h3>
              <div className="min-h-[300px]">
                <ChartThree />
              </div>
            </div>
          </div>

          {/* Today's Tasks (1/3 width) - Rush Tickets */}
          <div className="lg:col-span-1">
            <TaskList tasks={data.tasks} />
          </div>
        </section>
      </div>
    </div>
  );
}
