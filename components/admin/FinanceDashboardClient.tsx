'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BriefcaseIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';     // Revenue Over Time
import ChartThree from '@/components/ChartThree'; // Case Types Distribution

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
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
}

const sampleData: FinanceLegalDashboardData = {
  metrics: {
    totalClients: 58,
    activeContracts: 23,
    pendingInvoices: 11,
    revenueThisMonth: 38500,
    scheduledMeetings: 4,
  },
  tasks: [
    { id: '1', name: 'Client Meeting - Acme Corp.', dueDate: '2025-06-18', dueTime: '10:00 AM' },
    { id: '2', name: 'Review NDA for John Doe', dueDate: '2025-06-18', dueTime: '02:30 PM' },
    { id: '3', name: 'Follow up on Tax Filing', dueDate: '2025-06-19', dueTime: '11:00 AM' },
  ],
};

export default function FinanceLegalDashboardClient() {
  const [data, setData] = useState<FinanceLegalDashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const { totalClients, activeContracts, pendingInvoices, revenueThisMonth, scheduledMeetings } = data.metrics;

  const cards = [
    {
      title: 'Clients',
      value: totalClients,
      icon: UserGroupIcon,
      bg: 'bg-blue-50 text-blue-700',
      link: '/admin/clients',
    },
    {
      title: 'Contracts',
      value: activeContracts,
      icon: DocumentCheckIcon,
      bg: 'bg-green-50 text-green-700',
      link: '/admin/contracts',
    },
    {
      title: 'Invoices',
      value: pendingInvoices,
      icon: BriefcaseIcon,
      bg: 'bg-yellow-50 text-yellow-700',
      link: '/admin/invoices',
    },
    {
      title: 'Revenue',
      value: `$${revenueThisMonth.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      bg: 'bg-indigo-50 text-indigo-700',
      link: '/admin/revenue',
    },
    {
      title: 'Meetings',
      value: scheduledMeetings,
      icon: CalendarDaysIcon,
      bg: 'bg-red-50 text-red-700',
      link: '/admin/meetings',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Finance & Legal Dashboard</h1>

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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Growth</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Types Distribution</h2>
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
                <ScaleIcon className="w-5 h-5 text-indigo-600" />
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


// Ideal For:
// Law firms & legal practices

// Tax and audit consultancies

// Fintech startups

// Freelance legal or financial professionals

// Would you like:

// A calendar view for case deadlines?

// Document upload and status tracking?

// Payment integration widgets?

// Role-based access for legal assistants and accountants?