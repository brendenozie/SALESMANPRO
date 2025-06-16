'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GiftIcon,
  UsersIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface NonprofitDashboardData {
  metrics: {
    totalDonations: number;
    activeCampaigns: number;
    totalVolunteers: number;
    upcomingEvents: number;
  };
  tasks: Task[];
}

const sampleData: NonprofitDashboardData = {
  metrics: {
    totalDonations: 78650,
    activeCampaigns: 5,
    totalVolunteers: 92,
    upcomingEvents: 3,
  },
  tasks: [
    { id: '1', name: 'Call new volunteer: Emily', dueDate: '2025-06-18', dueTime: '10:00 AM' },
    { id: '2', name: 'Review Campaign Proposal: CleanWater4All', dueDate: '2025-06-18', dueTime: '2:00 PM' },
    { id: '3', name: 'Follow-up on Saturday’s food drive', dueDate: '2025-06-19', dueTime: '4:00 PM' },
  ],
};

export default function NonprofitDashboardClient() {
  const [data, setData] = useState<NonprofitDashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const { totalDonations, activeCampaigns, totalVolunteers, upcomingEvents } = data.metrics;

  const cards = [
    {
      title: 'Donations',
      value: `$${totalDonations.toLocaleString()}`,
      icon: GiftIcon,
      color: 'bg-teal-100 text-teal-700',
      link: '/admin/donations',
    },
    {
      title: 'Campaigns',
      value: activeCampaigns,
      icon: MegaphoneIcon,
      color: 'bg-yellow-100 text-yellow-700',
      link: '/admin/campaigns',
    },
    {
      title: 'Volunteers',
      value: totalVolunteers,
      icon: UsersIcon,
      color: 'bg-indigo-100 text-indigo-700',
      link: '/admin/volunteers',
    },
    {
      title: 'Events',
      value: upcomingEvents,
      icon: CalendarDaysIcon,
      color: 'bg-pink-100 text-pink-700',
      link: '/admin/events',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Nonprofit Admin Dashboard</h1>

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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Donations</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Volunteer Growth</h2>
          <ChartThree />
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Admin Tasks</h2>
          <Link href="/admin/tasks" className="text-sm text-teal-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <ClipboardDocumentListIcon className="w-5 h-5 text-teal-600" />
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
