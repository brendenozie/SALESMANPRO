'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FilmIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo'; // Viewer Trends
import ChartThree from '@/components/ChartThree'; // Category Breakdown

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface MediaDashboardData {
  metrics: {
    totalVideos: number;
    totalArticles: number;
    activeSubscribers: number;
    revenueThisMonth: number;
    premieresScheduled: number;
  };
  tasks: Task[];
}

const sampleData: MediaDashboardData = {
  metrics: {
    totalVideos: 215,
    totalArticles: 130,
    activeSubscribers: 4120,
    revenueThisMonth: 98500,
    premieresScheduled: 3,
  },
  tasks: [
    { id: '1', name: 'Edit Episode 4 of "Cinema Scope"', dueDate: '2025-06-18', dueTime: '12:00 PM' },
    { id: '2', name: 'Review draft for "Behind The Beat"', dueDate: '2025-06-18', dueTime: '03:30 PM' },
    { id: '3', name: 'Schedule live Q&A session', dueDate: '2025-06-19', dueTime: '10:00 AM' },
  ],
};

export default function MediaDashboardClient() {
  const [data, setData] = useState<MediaDashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const { totalVideos, totalArticles, activeSubscribers, revenueThisMonth, premieresScheduled } = data.metrics;

  const cards = [
    {
      title: 'Videos',
      value: totalVideos,
      icon: FilmIcon,
      bg: 'bg-indigo-100 text-indigo-800',
      link: '/admin/videos',
    },
    {
      title: 'Articles',
      value: totalArticles,
      icon: DocumentTextIcon,
      bg: 'bg-pink-100 text-pink-800',
      link: '/admin/articles',
    },
    {
      title: 'Subscribers',
      value: activeSubscribers,
      icon: UserGroupIcon,
      bg: 'bg-green-100 text-green-800',
      link: '/admin/subscribers',
    },
    {
      title: 'Revenue',
      value: `$${revenueThisMonth.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      bg: 'bg-yellow-100 text-yellow-800',
      link: '/admin/revenue',
    },
    {
      title: 'Premieres',
      value: premieresScheduled,
      icon: PlayCircleIcon,
      bg: 'bg-red-100 text-red-800',
      link: '/admin/premieres',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Media & Entertainment Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className="group bg-white p-5 rounded-2xl border border-gray-200 shadow hover:shadow-md transition hover:bg-gray-50"
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
        <div className="bg-white border p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Viewer Trends</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <ChartThree />
        </div>
      </div>

      {/* Editorial Tasks */}
      <div className="bg-white border p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today’s Editorial Tasks</h2>
          <Link href="/admin/tasks" className="text-sm text-indigo-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarDaysIcon className="w-5 h-5 text-indigo-600" />
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


// Perfect For:
// Streaming platforms (Netflix-style)

// Podcast networks

// Online publications and magazines

// Music content portals

// YouTube-style CMS dashboards

// Let me know if you want a:

// Dark theme toggle

// Role-specific user views (Editor, Producer, Admin)

// Content scheduling calendar

// Premium content tracker

// Or package all dashboards into a unified admin system.