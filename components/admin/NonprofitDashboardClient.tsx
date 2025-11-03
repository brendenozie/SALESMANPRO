"use client";

import React, { useEffect, useState, useCallback } from 'react';
// Simulating Link component behavior
import {
  GiftIcon,
  UsersIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  HeartIcon,
  BoltIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- MOCK CHART COMPONENTS (FOR SINGLE-FILE MANDATE) ---

const ChartTwo: React.FC<{ data: any }> = ({ data }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-orange-200">
    <span className="text-orange-600 font-semibold text-sm">
      [Placeholder: Monthly Donations Line Chart]
    </span>
    <pre className="mt-2 text-xs text-orange-500/80 bg-gray-50 p-2 rounded w-full text-left">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

const ChartThree: React.FC<{ data: any }> = ({ data }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-white rounded-xl p-4 border border-dashed border-blue-200">
    <span className="text-blue-600 font-semibold text-sm">
      [Placeholder: Volunteer Growth Bar Chart]
    </span>
     <pre className="mt-2 text-xs text-blue-500/80 bg-gray-50 p-2 rounded w-full text-left">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

// --- TYPE DEFINITIONS ---

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
  charts: {
    monthlyDonations: any;
    volunteerGrowth: any;
  }
}

// --- MAIN COMPONENT ---

export default function NonprofitDashboardClient() {
  const { slug: companyId } = useParams();
  const [data, setData] = useState<NonprofitDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/dashboard/nonprofit/${companyId}`, {
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
    { title: 'Total Donations', value: `$${data.metrics.totalDonations.toLocaleString()}`, icon: GiftIcon, color: 'text-orange-600 border-orange-400 bg-orange-50', link: '/admin/donations', description: 'Funds raised year-to-date.' },
    { title: 'Active Campaigns', value: data.metrics.activeCampaigns, icon: MegaphoneIcon, color: 'text-fuchsia-600 border-fuchsia-400 bg-fuchsia-50', link: '/admin/campaigns', description: 'Currently running projects.' },
    { title: 'Total Volunteers', value: data.metrics.totalVolunteers, icon: UsersIcon, color: 'text-indigo-600 border-indigo-400 bg-indigo-50', link: '/admin/volunteers', description: 'Our community of helpers.' },
    { title: 'Upcoming Events', value: data.metrics.upcomingEvents, icon: CalendarDaysIcon, color: 'text-green-600 border-green-400 bg-green-50', link: '/admin/events', description: 'Scheduled this quarter.' },
  ] : [];

  // Component for visually appealing metric cards
  const MetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card }) => (
    <a
      key={card.title}
      href={card.link}
      className={`relative p-6 rounded-2xl bg-white shadow-xl transition duration-300 hover:shadow-2xl hover:scale-[1.02] transform group cursor-pointer border-t-8 ${card.color.split(' ')[1]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-full p-3 ${card.color.split(' ')[2]}`}>
          <card.icon className={`w-7 h-7 ${card.color.split(' ')[0]}`} />
        </div>
        <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
      <p className="text-4xl font-extrabold text-gray-900 mt-1">{card.value}</p>
      <h2 className="mt-2 text-lg font-semibold text-gray-700">{card.title}</h2>
      <p className="mt-1 text-xs text-gray-500">{card.description}</p>
    </a>
  ), []);

  // Component for the Actionable Task List
  const TaskList: React.FC<{ tasks: Task[] }> = useCallback(({ tasks }) => (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
        <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <BoltIcon className="w-6 h-6 text-orange-500" /> Immediate Actions
        </h3>
        <a href="/admin/tasks" className="text-sm text-orange-600 font-semibold hover:text-orange-800 flex items-center">
          View All <ArrowRightIcon className="w-4 h-4 ml-1" />
        </a>
      </div>
      <ul className="space-y-4">
        {tasks.map((t) => (
          <li key={t.id} className="flex flex-col p-4 bg-gray-50 rounded-xl border-l-4 border-orange-400 hover:bg-orange-50/70 transition cursor-pointer shadow-sm">
            <span className="text-base font-semibold text-gray-800">{t.name}</span>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
              <span>{t.dueDate}</span>
              <ClockIcon className="w-4 h-4 text-gray-400 ml-2" />
              <span>{t.dueTime}</span>
            </div>
          </li>
        ))}
      </ul>
      {tasks.length === 0 && (
         <div className="py-6 text-center text-lg text-gray-500 flex items-center justify-center gap-2">
            <HeartIcon className="w-5 h-5 text-green-500" />
            Everything is up-to-date!
         </div>
      )}
    </div>
  ), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex items-center gap-3 text-orange-600">
          <RocketLaunchIcon className="w-6 h-6" />
          <span className="text-xl font-semibold">Loading Impact Console...</span>
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        <header className="mb-10 p-8 rounded-3xl shadow-xl" style={{ backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #030712 100%)' }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-orange-400 font-semibold mb-1">Empowering Change</p>
              <h1 className="text-5xl font-extrabold tracking-tight text-white">
                Non-Profit Command Center
              </h1>
              <p className="mt-2 text-indigo-200">Track donations, coordinate volunteers, and drive your mission forward.</p>
            </div>
            <a
              href="/admin/donate/new"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition transform hover:scale-105 shadow-lg shadow-orange-500/50"
            >
              <HeartIcon className="w-5 h-5" />
              Launch New Appeal
            </a>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <MetricCard key={card.title} card={card} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <GiftIcon className="w-6 h-6 text-orange-500" /> Monthly Donation Trend
              </h3>
              <div className="min-h-[300px]">
                <ChartTwo data={data.charts.monthlyDonations} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UsersIcon className="w-6 h-6 text-blue-500" /> Volunteer & Outreach Growth
              </h3>
              <div className="min-h-[300px]">
                <ChartThree data={data.charts.volunteerGrowth} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <TaskList tasks={data.tasks} />
          </div>
        </section>
      </div>
    </div>
  );
}