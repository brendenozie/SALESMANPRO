'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TruckIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  FireIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

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

const sampleData: RestaurantDashboardData = {
  metrics: {
    totalOrders: 325,
    activeDeliveries: 28,
    menuItems: 85,
    revenueToday: 18200,
  },
  tasks: [
    { id: '1', name: 'Prepare Chicken Alfredo (Order #182)', dueDate: '2025-06-17', dueTime: '12:15 PM' },
    { id: '2', name: 'Assign Delivery: Order #184', dueDate: '2025-06-17', dueTime: '12:30 PM' },
    { id: '3', name: 'Restock Fresh Basil', dueDate: '2025-06-17', dueTime: '03:00 PM' },
  ],
};

export default function RestaurantDashboardClient() {
  const [data, setData] = useState<RestaurantDashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const { totalOrders, activeDeliveries, menuItems, revenueToday } = data.metrics;

  const cards = [
    {
      title: 'Orders',
      value: totalOrders,
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-orange-100 text-orange-700',
      link: '/admin/orders',
    },
    {
      title: 'Deliveries',
      value: activeDeliveries,
      icon: TruckIcon,
      color: 'bg-yellow-100 text-yellow-700',
      link: '/admin/deliveries',
    },
    {
      title: 'Menu Items',
      value: menuItems,
      icon: FireIcon,
      color: 'bg-red-100 text-red-700',
      link: '/admin/menu',
    },
    {
      title: 'Revenue Today',
      value: `$${revenueToday.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-100 text-green-700',
      link: '/admin/revenue',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Restaurant Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className="group p-5 rounded-2xl shadow border border-gray-200 hover:shadow-md transition bg-white hover:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-full p-2 ${card.color}`}>
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
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Orders</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Trends</h2>
          <ChartThree />
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Kitchen & Delivery Tasks</h2>
          <Link href="/admin/tasks" className="text-sm text-orange-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <UserGroupIcon className="w-5 h-5 text-orange-600" />
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
