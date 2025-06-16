'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BriefcaseIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
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
    totalProjects: number;
    totalSkills: number;
    testimonials: number;
    inquiriesThisMonth: number;
    upcomingMeetings: number;
  };
  tasks: Task[];
}

type Props = DashboardData & { session: Session };

const sampleData: DashboardData = {
  metrics: {
    totalProjects: 24,
    totalSkills: 18,
    testimonials: 15,
    inquiriesThisMonth: 42,
    upcomingMeetings: 3,
  },
  tasks: [
    { id: 't1', name: 'Follow up with brand partner', dueDate: '2025-06-18', dueTime: '10:00 AM' },
    { id: 't2', name: 'Review new portfolio submissions', dueDate: '2025-06-18', dueTime: '1:00 PM' },
    { id: 't3', name: 'Update LinkedIn highlights', dueDate: '2025-06-19', dueTime: '4:00 PM' },
  ],
};

export default function PortfolioDashboardClient() {
  const [data, setData] = useState<DashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData); // Replace with real fetch logic
  }, []);

  const {
    totalProjects,
    totalSkills,
    testimonials,
    inquiriesThisMonth,
    upcomingMeetings,
  } = data.metrics;

  const cards = [
    {
      title: 'Projects',
      value: totalProjects,
      icon: BriefcaseIcon,
      bg: 'bg-indigo-50',
      link: '/admin/projects',
    },
    {
      title: 'Skills',
      value: totalSkills,
      icon: LightBulbIcon,
      bg: 'bg-yellow-50',
      link: '/admin/skills',
    },
    {
      title: 'Testimonials',
      value: testimonials,
      icon: UserCircleIcon,
      bg: 'bg-green-50',
      link: '/admin/testimonials',
    },
    {
      title: 'Inquiries',
      value: inquiriesThisMonth,
      icon: ChatBubbleLeftRightIcon,
      bg: 'bg-blue-50',
      link: '/admin/inquiries',
    },
    {
      title: 'Meetings',
      value: upcomingMeetings,
      icon: CalendarDaysIcon,
      bg: 'bg-pink-50',
      link: '/admin/calendar',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">My Portfolio Dashboard</h1>

      {/* Metrics Cards */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Monthly Project Views</h3>
          <ChartTwo />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Inquiries Trend</h3>
          <ChartThree />
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Today's Tasks</h3>
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
