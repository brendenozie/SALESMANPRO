'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  UsersIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';
import { Session } from 'next-auth';

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

export interface DashboardData {
  metrics: {
    totalProperties: number;
    totalAgents: number;
    totalClients: number;
    revenueThisMonth: number;
    appointmentsToday: number;
  };
  tasks: Task[];
}

type Props = DashboardData & { session: Session };

const sampleData: DashboardData = {
  metrics: {
    totalProperties: 124,
    totalAgents: 12,
    totalClients: 350,
    revenueThisMonth: 120450,
    appointmentsToday: 8,
  },
  tasks: [
    { id: 't1', name: 'Inspect Property #102', dueDate: '2025-06-18', dueTime: '11:00 AM' },
    { id: 't2', name: 'Call new client Jane Doe', dueDate: '2025-06-18', dueTime: '02:00 PM' },
    { id: 't3', name: 'Team meeting', dueDate: '2025-06-19', dueTime: '09:00 AM' },
  ],
};

export default function RealEstateDashboardClient() {
  const [data, setData] = useState<DashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const {
    totalProperties,
    totalAgents,
    totalClients,
    revenueThisMonth,
    appointmentsToday,
  } = data.metrics;

  const cards = [
    {
      title: 'Properties',
      value: totalProperties,
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-100 text-indigo-700',
      link: '/admin/properties',
    },
    {
      title: 'Agents',
      value: totalAgents,
      icon: UsersIcon,
      color: 'bg-blue-100 text-blue-700',
      link: '/admin/agents',
    },
    {
      title: 'Clients',
      value: totalClients,
      icon: HomeIcon,
      color: 'bg-green-100 text-green-700',
      link: '/admin/clients',
    },
    {
      title: 'Revenue',
      value: `$${revenueThisMonth.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-100 text-yellow-700',
      link: '/admin/reports',
    },
    {
      title: 'Appointments',
      value: appointmentsToday,
      icon: CalendarDaysIcon,
      color: 'bg-pink-100 text-pink-700',
      link: '/admin/appointments',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Real Estate Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className={`group p-5 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition duration-200 bg-white hover:bg-gray-50`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-full p-2 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-700">{card.title}</span>
            </div>
            <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Sales</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Acquisition</h2>
          <ChartThree />
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Tasks</h2>
          <Link href="/admin/tasks" className="text-sm text-indigo-600 hover:underline">
            View All
          </Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="font-medium text-gray-700">{task.name}</div>
              <span className="text-sm text-gray-500">{task.dueDate} @ {task.dueTime}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
