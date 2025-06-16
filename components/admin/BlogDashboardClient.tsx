'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PencilSquareIcon,
  FolderOpenIcon,
  UserGroupIcon,
  EyeIcon,
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
    totalPosts: number;
    totalCategories: number;
    subscribers: number;
    monthlyViews: number;
    scheduledPosts: number;
  };
  tasks: Task[];
}

type Props = DashboardData & { session: Session };

const sampleData: DashboardData = {
  metrics: {
    totalPosts: 128,
    totalCategories: 12,
    subscribers: 5400,
    monthlyViews: 23450,
    scheduledPosts: 5,
  },
  tasks: [
    { id: 't1', name: 'Write post: "Top 10 SEO Tips"', dueDate: '2025-06-18', dueTime: '11:00 AM' },
    { id: 't2', name: 'Review guest post submission', dueDate: '2025-06-18', dueTime: '3:00 PM' },
    { id: 't3', name: 'Update featured image for blog #24', dueDate: '2025-06-19', dueTime: '10:00 AM' },
  ],
};

export default function BlogDashboardClient() {
  const [data, setData] = useState<DashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData); // Replace with real fetch logic later
  }, []);

  const {
    totalPosts,
    totalCategories,
    subscribers,
    monthlyViews,
    scheduledPosts,
  } = data.metrics;

  const cards = [
    {
      title: 'Total Posts',
      value: totalPosts,
      icon: PencilSquareIcon,
      bg: 'bg-indigo-50',
      link: '/admin/posts',
    },
    {
      title: 'Categories',
      value: totalCategories,
      icon: FolderOpenIcon,
      bg: 'bg-blue-50',
      link: '/admin/categories',
    },
    {
      title: 'Subscribers',
      value: subscribers.toLocaleString(),
      icon: UserGroupIcon,
      bg: 'bg-green-50',
      link: '/admin/subscribers',
    },
    {
      title: 'Monthly Views',
      value: monthlyViews.toLocaleString(),
      icon: EyeIcon,
      bg: 'bg-yellow-50',
      link: '/admin/analytics',
    },
    {
      title: 'Scheduled Posts',
      value: scheduledPosts,
      icon: CalendarDaysIcon,
      bg: 'bg-pink-50',
      link: '/admin/schedule',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Blog Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className={`${card.bg} p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105`}
          >
            <div className="flex items-center mb-4">
              <card.icon className="w-8 h-8 text-gray-700" />
              <h2 className="ml-3 text-lg font-semibold text-gray-800">{card.title}</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Traffic Overview</h3>
          <ChartTwo />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Engagement Metrics</h3>
          <ChartThree />
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Today's Editorial Tasks</h3>
          <Link href="/admin/tasks" className="text-indigo-600 hover:underline">
            View All
          </Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((t) => (
            <li
              key={t.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span>{t.name}</span>
              <span className="text-sm text-gray-500">
                {t.dueDate} @ {t.dueTime}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
