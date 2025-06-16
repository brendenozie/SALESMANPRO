'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserGroupIcon,
  ServerStackIcon,
  CurrencyDollarIcon,
  WrenchIcon,
  ChartBarSquareIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo'; // User Growth Chart
import ChartThree from '@/components/ChartThree'; // Plan Breakdown Chart

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface SaaSDashboardData {
  metrics: {
    activeUsers: number;
    totalPlans: number;
    monthlyRevenue: number;
    uptimePercentage: number;
  };
  tasks: Task[];
}

const sampleData: SaaSDashboardData = {
  metrics: {
    activeUsers: 3421,
    totalPlans: 4,
    monthlyRevenue: 184950,
    uptimePercentage: 99.98,
  },
  tasks: [
    { id: '1', name: 'Fix billing webhook error', dueDate: '2025-06-18', dueTime: '11:00 AM' },
    { id: '2', name: 'Onboard Acme Inc.', dueDate: '2025-06-18', dueTime: '03:00 PM' },
    { id: '3', name: 'Deploy analytics microservice', dueDate: '2025-06-19', dueTime: '10:00 AM' },
  ],
};

export default function SaasDashboardClient() {
  const [data, setData] = useState<SaaSDashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const { activeUsers, totalPlans, monthlyRevenue, uptimePercentage } = data.metrics;

  const cards = [
    {
      title: 'Active Users',
      value: activeUsers,
      icon: UserGroupIcon,
      color: 'bg-sky-100 text-sky-800',
      link: '/admin/users',
    },
    {
      title: 'Plans',
      value: totalPlans,
      icon: ChartBarSquareIcon,
      color: 'bg-purple-100 text-purple-800',
      link: '/admin/plans',
    },
    {
      title: 'Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-100 text-green-800',
      link: '/admin/revenue',
    },
    {
      title: 'Uptime',
      value: `${uptimePercentage.toFixed(2)}%`,
      icon: ServerStackIcon,
      color: 'bg-orange-100 text-orange-800',
      link: '/admin/system',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">SaaS Platform Dashboard</h1>

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Growth</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Breakdown</h2>
          <ChartThree />
        </div>
      </div>

      {/* Task Panel */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today’s Tasks</h2>
          <Link href="/admin/tasks" className="text-sm text-sky-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <WrenchIcon className="w-5 h-5 text-purple-600" />
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

// Subscription churn & retention widgets

// User feedback & NPS tracker

// Feature request heatmap

// Billing status and failed payment recovery queue

// Multi-tenant analytics overview

// Let me know if you'd like:

// Multi-tenant mode

// Role-based user panels

// Dark mode toggle

// Billing + Stripe integration dashboard
