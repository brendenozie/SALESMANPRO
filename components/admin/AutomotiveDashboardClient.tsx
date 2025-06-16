'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TruckIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';     // Sales Trends Chart
import ChartThree from '@/components/ChartThree'; // Vehicle Categories Chart

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
    { id: '1', name: 'Test Drive - Toyota RAV4', dueDate: '2025-06-18', dueTime: '10:30 AM' },
    { id: '2', name: 'Oil Change - Ford Ranger', dueDate: '2025-06-18', dueTime: '1:00 PM' },
    { id: '3', name: 'Customer Pickup - Mazda CX-5', dueDate: '2025-06-18', dueTime: '4:00 PM' },
  ],
};

export default function AutomotiveDashboardClient() {
  const [data, setData] = useState<AutomotiveDashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const {
    totalVehicles,
    vehiclesSold,
    activeListings,
    revenueThisMonth,
    serviceBookingsToday,
  } = data.metrics;

  const cards = [
    {
      title: 'Total Vehicles',
      value: totalVehicles,
      icon: TruckIcon,
      bg: 'bg-blue-50 text-blue-700',
      link: '/admin/vehicles',
    },
    {
      title: 'Sold',
      value: vehiclesSold,
      icon: ClipboardDocumentCheckIcon,
      bg: 'bg-green-50 text-green-700',
      link: '/admin/sales',
    },
    {
      title: 'Active Listings',
      value: activeListings,
      icon: ChartBarIcon,
      bg: 'bg-indigo-50 text-indigo-700',
      link: '/admin/listings',
    },
    {
      title: 'Revenue',
      value: `$${revenueThisMonth.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      bg: 'bg-yellow-50 text-yellow-700',
      link: '/admin/revenue',
    },
    {
      title: 'Bookings',
      value: serviceBookingsToday,
      icon: CalendarDaysIcon,
      bg: 'bg-red-50 text-red-700',
      link: '/admin/bookings',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Automotive Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-3">
              <div className={`p-2 rounded-full ${card.bg}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-sm text-gray-500">{card.title}</span>
            </div>
            <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Trends</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Categories</h2>
          <ChartThree />
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white border p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Tasks</h2>
          <Link href="/admin/tasks" className="text-sm text-indigo-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <WrenchScrewdriverIcon className="w-5 h-5 text-indigo-600" />
                {task.name}
              </div>
              <span className="text-sm text-gray-500">{task.dueDate} @ {task.dueTime}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// A garage inventory module?

// Live booking calendar view?

// VIN scanning integration?