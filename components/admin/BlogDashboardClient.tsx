"use client";

import React, { useState, useEffect, useCallback } from 'react';
// Simulating Link component behavior
import {
  PencilSquareIcon,
  FolderOpenIcon,
  UserGroupIcon,
  EyeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

// --- MOCK CHART COMPONENTS (FOR SINGLE-FILE MANDATE) ---

const ChartTwo = () => (
  <div className="flex items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-teal-200">
    <span className="text-teal-600 font-semibold text-sm">
      [Placeholder: Traffic Overview Line Chart]
    </span>
  </div>
);

const ChartThree = () => (
  <div className="flex items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-sky-200">
    <span className="text-sky-600 font-semibold text-sm">
      [Placeholder: Engagement Metrics Bar Chart]
    </span>
  </div>
);

// --- TYPE DEFINITIONS ---

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

// --- DATA & API SIMULATION ---

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

// --- MAIN COMPONENT ---

export default function BlogDashboardClient() {
  const [data, setData] = useState<DashboardData>(sampleData);
  const [loading, setLoading] = useState(true);

  // Simulate data fetch
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600)); 
      setData(sampleData);
      setLoading(false);
    };
    loadData();
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
      accent: 'text-teal-600 bg-teal-50',
      link: '/admin/posts',
      description: 'Your published library.',
    },
    {
      title: 'Categories',
      value: totalCategories,
      icon: FolderOpenIcon,
      accent: 'text-blue-600 bg-blue-50',
      link: '/admin/categories',
      description: 'How your content is organized.',
    },
    {
      title: 'Subscribers',
      value: subscribers.toLocaleString(),
      icon: UserGroupIcon,
      accent: 'text-green-600 bg-green-50',
      link: '/admin/subscribers',
      description: 'Total readership growth.',
    },
    {
      title: 'Monthly Views',
      value: monthlyViews.toLocaleString(),
      icon: EyeIcon,
      accent: 'text-yellow-600 bg-yellow-50',
      link: '/admin/analytics',
      description: 'This month’s traffic.',
    },
    {
      title: 'Scheduled Posts',
      value: scheduledPosts,
      icon: CalendarDaysIcon,
      accent: 'text-pink-600 bg-pink-50',
      link: '/admin/schedule',
      description: 'Ready to go live.',
    },
  ];

  // Component for visually appealing metric cards
  const MetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card }) => (
    <a
      key={card.title}
      href={card.link}
      className={`relative p-6 rounded-2xl bg-white shadow-xl transition duration-300 hover:shadow-2xl hover:ring-2 hover:ring-offset-2 ${card.accent.replace('text-', 'ring-')} transform group cursor-pointer border-b-4 ${card.accent.replace('bg-', 'border-')}`}
    >
      <div className="flex items-center justify-between mb-2">
        {/* Title and Icon */}
        <h2 className="text-sm font-medium text-gray-500">{card.title}</h2>
        <card.icon className={`w-5 h-5 ${card.accent.replace('bg-', 'text-')}`} />
      </div>
      
      {/* Value */}
      <p className="text-4xl font-extrabold text-gray-900 mt-1">{card.value}</p>
      
      {/* Description */}
      <p className="mt-2 text-xs text-gray-400">{card.description}</p>
    </a>
  ), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-bounce flex items-center gap-3 text-teal-600">
          <RocketLaunchIcon className="w-6 h-6" />
          <span className="text-xl font-semibold">Loading Editorial Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Main Header and Action Button */}
        <header className="mb-10 flex justify-between items-center">
          <div>
            <p className="text-xl text-teal-600 font-semibold mb-1">Welcome to the Writer's Hub</p>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
              Blog Dashboard
            </h1>
          </div>
          <a
            href="/admin/posts/new"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition transform hover:scale-105 shadow-lg shadow-teal-500/50"
          >
            <PencilSquareIcon className="w-5 h-5" />
            Create New Post
          </a>
        </header>

        {/* Metrics Cards - Clean, Bordered Style */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {cards.map((card) => (
            <MetricCard key={card.title} card={card} />
          ))}
        </section>

        {/* Main Content: Charts and Tasks */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Charts Section (2/3 width) - Data Insights */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <EyeIcon className="w-6 h-6 text-teal-500" /> Traffic Overview (Views)
              </h3>
              <div className="min-h-[300px]">
                <ChartTwo />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6 text-sky-500" /> Engagement & Subscribers
              </h3>
              <div className="min-h-[300px]">
                <ChartThree />
              </div>
            </div>
          </div>

          {/* Today's Tasks (1/3 width) - Editorial Focus */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-4">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                  <CheckIcon className="w-6 h-6 text-orange-500" /> Editorial Tasks
                </h3>
                <a href="/admin/tasks" className="text-sm text-teal-600 hover:text-teal-800 flex items-center">
                  View All <ArrowRightIcon className="w-4 h-4 ml-1" />
                </a>
              </div>
              
              <ul className="space-y-3">
                {data.tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <span className="text-base font-semibold text-gray-800">{t.name}</span>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <CalendarDaysIcon className="w-4 h-4 text-orange-400" />
                      <span>{t.dueDate}</span>
                      <ClockIcon className="w-4 h-4 text-orange-400 ml-2" />
                      <span>{t.dueTime}</span>
                    </div>
                  </li>
                ))}
              </ul>
              
              {data.tasks.length === 0 && (
                 <div className="py-6 text-center text-gray-500">Nothing due today. Enjoy the calm!</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
