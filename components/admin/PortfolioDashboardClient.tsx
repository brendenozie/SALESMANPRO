"use client";

import React, { useState, useEffect, useCallback } from 'react';
// Simulating Link component behavior
import {
  BriefcaseIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- MOCK CHART COMPONENTS (FOR SINGLE-FILE MANDATE) ---

const ChartTwo: React.FC<{data: any}> = ({ data }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-gray-800/50 rounded-xl p-4 border border-dashed border-cyan-700">
    <span className="text-cyan-500 font-semibold text-sm">
      [Placeholder: Monthly Project Views Line Chart]
    </span>
     <pre className="mt-2 text-xs text-cyan-500/80 dark:text-cyan-500/50 bg-gray-900 p-2 rounded">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

const ChartThree: React.FC<{data: any}> = ({ data }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-gray-800/50 rounded-xl p-4 border border-dashed border-fuchsia-700">
    <span className="text-fuchsia-500 font-semibold text-sm">
      [Placeholder: Inquiries Trend Bar Chart]
    </span>
    <pre className="mt-2 text-xs text-fuchsia-500/80 dark:text-fuchsia-500/50 bg-gray-900 p-2 rounded">
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
    totalProjects: number;
    totalSkills: number;
    testimonials: number;
    inquiriesThisMonth: number;
    upcomingMeetings: number;
  };
  tasks: Task[];
  charts: {
    monthlyProjectViews: any;
    inquiriesTrend: any;
  }
}

// --- MAIN COMPONENT ---

export default function PortfolioDashboardClient() {
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
            const response = await fetch(`${apiBaseUrl}/admin/dashboard/portfolio/${companyId}`, {
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
        } catch(e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  const cards = data ? [
    { title: 'Total Projects', value: data.metrics.totalProjects, icon: BriefcaseIcon, accent: 'border-cyan-500 text-cyan-500', link: '/admin/projects', description: 'Your body of work.' },
    { title: 'Core Skills', value: data.metrics.totalSkills, icon: LightBulbIcon, accent: 'border-amber-500 text-amber-500', link: '/admin/skills', description: 'Defined competencies.' },
    { title: 'Client Testimonials', value: data.metrics.testimonials, icon: UserCircleIcon, accent: 'border-green-500 text-green-500', link: '/admin/testimonials', description: 'Positive feedback score.' },
    { title: 'Inquiries (MoM)', value: data.metrics.inquiriesThisMonth, icon: ChatBubbleLeftRightIcon, accent: 'border-fuchsia-500 text-fuchsia-500', link: '/admin/inquiries', description: 'Leads generated this month.'},
    { title: 'Upcoming Meetings', value: data.metrics.upcomingMeetings, icon: CalendarDaysIcon, accent: 'border-blue-500 text-blue-500', link: '/admin/calendar', description: 'Scheduled this week.' },
  ] : [];

  // Component for visually appealing metric cards
  const MetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card }) => (
    <a
      key={card.title}
      href={card.link}
      className={`relative p-6 rounded-2xl bg-gray-800 border ${card.accent.replace('text-', 'border-')} shadow-xl transition duration-300 hover:shadow-2xl hover:scale-[1.02] transform group`}
    >
      <div className="flex items-center mb-3">
        <card.icon className={`w-6 h-6 ${card.accent.replace('border-', 'text-')}`} />
        <h2 className="ml-3 text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{card.title}</h2>
      </div>
      <p className="text-4xl font-extrabold text-white">{card.value}</p>
      <p className="mt-2 text-xs text-gray-500">{card.description}</p>
      <ArrowRightIcon className={`absolute bottom-4 right-4 w-5 h-5 text-gray-600 group-hover:${card.accent.replace('border-', 'text-')} transition-all transform group-hover:translate-x-1 group-hover:scale-110`} />
    </a>
  ), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        <div className="animate-pulse flex items-center gap-3">
          <RocketLaunchIcon className="w-6 h-6 text-cyan-400" />
          <span className="text-xl font-semibold">Loading Personal Command Console...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-red-900/10 text-red-400">
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg">
            <ExclamationTriangleIcon className="w-10 h-10 mx-auto mb-4 text-red-500" />
            <h2 className="font-bold text-lg text-white mb-2">Could Not Load Dashboard</h2>
            <p className="text-sm text-gray-400">{error || "An unknown error occurred."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        <header className="mb-10 p-8 rounded-3xl" style={{ backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #030712 100%)' }}>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xl text-cyan-400 font-semibold mb-2">Portfolio Management System</p>
              <h1 className="text-5xl font-extrabold tracking-tighter text-white">
                Dashboard Overview
              </h1>
            </div>
            <a
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-600 text-white font-medium hover:bg-fuchsia-700 transition transform hover:scale-105 shadow-lg shadow-fuchsia-900/50"
            >
              <UserCircleIcon className="w-5 h-5" />
              Manage Profile
            </a>
          </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {cards.map((card) => (
            <MetricCard key={card.title} card={card} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border-t-4 border-cyan-600">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BriefcaseIcon className="w-6 h-6 text-cyan-400" /> Monthly Project Views
              </h3>
              <div className="min-h-[300px]">
                <ChartTwo data={data.charts.monthlyProjectViews} />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border-t-4 border-fuchsia-600">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-fuchsia-400" /> Inquiries Trend
              </h3>
              <div className="min-h-[300px]">
                <ChartThree data={data.charts.inquiriesTrend} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border-t-4 border-yellow-600 sticky top-4">
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-yellow-400" /> Urgent Tasks
                </h3>
                <a href="/admin/tasks" className="text-sm text-yellow-500 hover:text-yellow-400 hover:underline flex items-center">
                  View All
                </a>
              </div>
              
              <ul className="space-y-4">
                {data.tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-col p-4 bg-gray-700 rounded-xl border border-gray-600 hover:bg-gray-600 transition cursor-pointer"
                  >
                    <span className="text-base font-semibold text-white">{t.name}</span>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-400">
                      <CalendarDaysIcon className="w-4 h-4 text-cyan-400" />
                      <span>{t.dueDate}</span>
                      <ClockIcon className="w-4 h-4 text-fuchsia-400 ml-2" />
                      <span>{t.dueTime}</span>
                    </div>
                  </li>
                ))}
              </ul>
              
              {data.tasks.length === 0 && (
                 <div className="py-6 text-center text-gray-500">No urgent tasks due today. Focus on strategy!</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}