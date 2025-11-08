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
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- MOCK CHART COMPONENTS (FOR SINGLE-FILE MANDATE) ---

const ChartTwo: React.FC<{ data: any }> = ({ data }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-teal-200">
    <span className="text-teal-600 font-semibold text-sm">
      [Placeholder: Traffic Overview Line Chart]
    </span>
     <pre className="mt-2 text-xs text-teal-500/80 bg-gray-50 p-2 rounded w-full text-left">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

const ChartThree: React.FC<{ data: any }> = ({ data }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-sky-200">
    <span className="text-sky-600 font-semibold text-sm">
      [Placeholder: Engagement Metrics Bar Chart]
    </span>
    <pre className="mt-2 text-xs text-sky-500/80 bg-gray-50 p-2 rounded w-full text-left">
      {JSON.stringify(data, null, 2)}
    </pre>
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
  charts: {
    trafficOverview: any;
    engagementMetrics: any;
  }
}

// --- MAIN COMPONENT ---

export default function BlogDashboardClient() {
  const { slug: companyId } = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/dashboard/blog/${companyId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Credentials': 'include',
          },
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.data?.message || 'Failed to fetch dashboard data');
        }
        setData(result.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const cards = data ? [
    { title: 'Total Posts', value: data.metrics.totalPosts, icon: PencilSquareIcon, accent: 'text-teal-600 bg-teal-50 border-teal-500', link: '/admin/posts', description: 'Your published library.' },
    { title: 'Categories', value: data.metrics.totalCategories, icon: FolderOpenIcon, accent: 'text-blue-600 bg-blue-50 border-blue-500', link: '/admin/categories', description: 'Content organization.' },
    { title: 'Subscribers', value: data.metrics.subscribers.toLocaleString(), icon: UserGroupIcon, accent: 'text-green-600 bg-green-50 border-green-500', link: '/admin/subscribers', description: 'Total readership growth.' },
    { title: 'Monthly Views', value: data.metrics.monthlyViews.toLocaleString(), icon: EyeIcon, accent: 'text-yellow-600 bg-yellow-50 border-yellow-500', link: '/admin/analytics', description: 'This month’s traffic.' },
    { title: 'Scheduled Posts', value: data.metrics.scheduledPosts, icon: CalendarDaysIcon, accent: 'text-pink-600 bg-pink-50 border-pink-500', link: '/admin/schedule', description: 'Ready to go live.' },
  ] : [];

  // Component for visually appealing metric cards
  const MetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card }) => (
    <a
      key={card.title}
      href={card.link}
      className={`relative p-6 rounded-2xl bg-white shadow-xl transition duration-300 hover:shadow-2xl hover:ring-2 hover:ring-offset-2 ${card.accent.replace('text-', 'ring-').replace('bg-', 'ring-')} transform group cursor-pointer border-b-4 ${card.accent.split(' ')[2]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-500">{card.title}</h2>
        <card.icon className={`w-5 h-5 ${card.accent.split(' ')[0]}`} />
      </div>
      <p className="text-4xl font-extrabold text-gray-900 mt-1">{card.value}</p>
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

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
            <ExclamationTriangleIcon className="w-10 h-10 mx-auto mb-4 text-red-500" />
            <h2 className="font-bold text-lg text-gray-800 mb-2">Could Not Load Dashboard</h2>
            <p className="text-sm text-gray-500">{error || "An unknown error occurred."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
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

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {cards.map((card) => (
            <MetricCard key={card.title} card={card} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <EyeIcon className="w-6 h-6 text-teal-500" /> Traffic Overview (Views)
              </h3>
              <div className="min-h-[300px]">
                <ChartTwo data={data.charts.trafficOverview} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6 text-sky-500" /> Engagement & Subscribers
              </h3>
              <div className="min-h-[300px]">
                <ChartThree data={data.charts.engagementMetrics} />
              </div>
            </div>
          </div>

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