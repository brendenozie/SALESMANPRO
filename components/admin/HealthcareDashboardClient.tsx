'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo'; // Appointments Over Time
import ChartThree from '@/components/ChartThree'; // New Patients Trend

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface HealthcareDashboardData {
  metrics: {
    appointmentsToday: number;
    totalPatients: number;
    totalDoctors: number;
    revenueThisMonth: number;
  };
  tasks: Task[];
}

const sampleData: HealthcareDashboardData = {
  metrics: {
    appointmentsToday: 18,
    totalPatients: 1420,
    totalDoctors: 24,
    revenueThisMonth: 98450,
  },
  tasks: [
    { id: '1', name: 'Dr. Kim - Surgery Follow-up Call', dueDate: '2025-06-18', dueTime: '10:00 AM' },
    { id: '2', name: 'Email lab results to Patient #450', dueDate: '2025-06-18', dueTime: '12:30 PM' },
    { id: '3', name: 'Weekly Staff Meeting', dueDate: '2025-06-19', dueTime: '09:00 AM' },
  ],
};

export default function HealthcareDashboardClient() {
  const [data, setData] = useState<HealthcareDashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const { appointmentsToday, totalPatients, totalDoctors, revenueThisMonth } = data.metrics;

  const cards = [
    {
      title: 'Appointments Today',
      value: appointmentsToday,
      icon: CalendarDaysIcon,
      color: 'bg-blue-100 text-blue-800',
      link: '/admin/appointments',
    },
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: UserGroupIcon,
      color: 'bg-teal-100 text-teal-800',
      link: '/admin/patients',
    },
    {
      title: 'Doctors',
      value: totalDoctors,
      icon: UserIcon,
      color: 'bg-purple-100 text-purple-800',
      link: '/admin/doctors',
    },
    {
      title: 'Revenue',
      value: `$${revenueThisMonth.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-100 text-green-800',
      link: '/admin/revenue',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Healthcare Dashboard</h1>

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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointments Over Time</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">New Patient Growth</h2>
          <ChartThree />
        </div>
      </div>

      {/* Task Panel */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today’s Tasks</h2>
          <Link href="/admin/tasks" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-600" />
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
