"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';
import { Session } from 'next-auth';

// Sample data types
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

export default function RealEstateDashboardClient() {//props: Props
  const [data, setData] = useState<DashboardData>(sampleData);

  // In real app fetch data here
  useEffect(() => {
    setData(sampleData);
  }, []);

  const { totalProperties, totalAgents, totalClients, revenueThisMonth, appointmentsToday } = data.metrics;

  const cards = [
    { title: 'Properties', value: totalProperties, icon: BuildingOfficeIcon, bg: 'bg-indigo-50', link: '/admin/properties' },
    { title: 'Agents', value: totalAgents, icon: UsersIcon, bg: 'bg-blue-50', link: '/admin/agents' },
    { title: 'Clients', value: totalClients, icon: HomeIcon, bg: 'bg-green-50', link: '/admin/clients' },
    { title: 'Revenue', value: `$${revenueThisMonth.toLocaleString()}`, icon: CurrencyDollarIcon, bg: 'bg-yellow-50', link: '/admin/reports' },
    { title: 'Appointments', value: appointmentsToday, icon: CalendarDaysIcon, bg: 'bg-pink-50', link: '/admin/appointments' },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Real Estate Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => (
          <Link key={card.title} href={card.link} className={`${card.bg} p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105`}> 
            <div className="flex items-center mb-4">
              <card.icon className="w-8 h-8 text-gray-700" />
              <h2 className="ml-3 text-lg font-semibold text-gray-800">{card.title}</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Monthly Sales</h3>
          <ChartTwo />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Client Acquisition</h3>
          <ChartThree />
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Today's Tasks</h3>
          <Link href="/admin/tasks" className="text-indigo-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((t) => (
            <li key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <span>{t.name}</span>
              <span className="text-sm text-gray-500">{t.dueDate} @ {t.dueTime}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
