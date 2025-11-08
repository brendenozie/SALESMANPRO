"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BuildingOfficeIcon,
  UsersIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- INTERFACES ---
interface Session {
    user: { name: string; email: string; }
}

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

// --- MOCK CHART COMPONENTS ---
const ChartTwo = () => (
    <div className="flex items-center justify-center h-full min-h-[250px] bg-gray-50 rounded-xl p-4 border border-dashed border-teal-200">
        <span className="text-teal-600 font-semibold text-sm">[Placeholder: Monthly Gross Sales Chart]</span>
    </div>
);
const ChartThree = () => (
    <div className="flex items-center justify-center h-full min-h-[250px] bg-gray-50 rounded-xl p-4 border border-dashed border-orange-200">
        <span className="text-orange-600 font-semibold text-sm">[Placeholder: Client Acquisition Funnel]</span>
    </div>
);

// --- MAIN COMPONENT ---
export default function RealEstateDashboardClient() {
  const { slug : companyId } = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mocking session data for display purposes. Authentication is handled by the API.
  const session: Session = { user: { name: "", email: "bl@agency.com" } };

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiBaseUrl}/admin/dashboard/real-estate?companyId=${companyId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.data?.message || "Failed to fetch dashboard data.");
            }
            setData(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 text-teal-600 flex flex-col items-center justify-center">
        <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl font-semibold">Loading Broker Command Center...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-red-50 text-red-600 flex flex-col items-center justify-center text-center p-4">
        <ExclamationCircleIcon className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Dashboard Unavailable</h2>
        <p>{error || "Could not connect to the command center."}</p>
      </div>
    );
  }

  const { totalProperties, totalAgents, totalClients, revenueThisMonth, appointmentsToday } = data.metrics;

  const cards = [
    { title: 'Active Properties', value: totalProperties, icon: BuildingOfficeIcon, accent: 'text-teal-500 border-teal-500', link: '/admin/properties', description: 'Currently listed inventory.' },
    { title: 'Active Agents', value: totalAgents, icon: UsersIcon, accent: 'text-blue-500 border-blue-500', link: '/admin/agents', description: 'Team members online.' },
    { title: 'Total Clients', value: totalClients, icon: HomeIcon, accent: 'text-indigo-500 border-indigo-500', link: '/admin/clients', description: 'Acquired leads and buyers.' },
  ];
    
  const MainMetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card }) => (
    <a href={card.link} className={`relative p-6 rounded-2xl bg-white shadow-lg transition duration-300 hover:shadow-xl transform group cursor-pointer border-b-4 ${card.accent.split(' ')[1]} border-opacity-70`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-lg p-2 ${card.accent.replace('text-', 'bg-').replace('-500', '-100')}`}>
          <card.icon className={`w-8 h-8 ${card.accent.split(' ')[0]}`} />
        </div>
        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">{card.title}</span>
      </div>
      <p className="text-3xl font-extrabold text-gray-900 mt-1">{card.value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-gray-500">{card.description}</p>
    </a>
  ), []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-10 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border-l-8 border-teal-600">
          <p className="text-base text-gray-500">Welcome back, {session.user.name.split(' ')[0]}</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">Broker Command <span className="text-teal-600">Center</span></h1>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            <a href="/admin/reports" className="col-span-1 lg:col-span-2 p-6 rounded-2xl bg-teal-600 text-white shadow-2xl transition duration-300 hover:bg-teal-700 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4"><CurrencyDollarIcon className="w-10 h-10 text-white opacity-90" /><span className="text-lg font-semibold uppercase opacity-90">Revenue This Month</span></div>
                <h2 className="text-5xl sm:text-6xl font-black leading-tight">${revenueThisMonth.toLocaleString()}</h2>
                <p className="mt-2 text-sm opacity-80">Targeting Q4 closing goals. Click for full finance report.</p>
            </a>
            <a href="/admin/appointments" className="col-span-1 p-6 rounded-2xl bg-orange-500 text-white shadow-xl transition duration-300 hover:bg-orange-600 flex flex-col justify-between">
                 <div className="flex items-center justify-between mb-4"><CalendarDaysIcon className="w-10 h-10 text-white opacity-90" /><span className="text-lg font-semibold uppercase opacity-90">Appointments Today</span></div>
                <h2 className="text-5xl font-black leading-tight">{appointmentsToday}</h2>
                <p className="mt-2 text-sm opacity-80">Number of showing and consultation bookings.</p>
            </a>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <section className="grid grid-cols-1 sm:grid-cols-3 lg:col-span-2 gap-6">
                {cards.map((card) => <MainMetricCard key={card.title} card={card} />)}
            </section>
            <section className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BriefcaseIcon className="w-5 h-5 text-orange-500" /> Today's Focus</h2>
                    <a href="/admin/tasks" className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center">View All <ArrowRightIcon className="w-3 h-3 ml-1" /></a>
                </div>
                {data.tasks.length > 0 ? (
                    <ul className="space-y-3">
                        {data.tasks.map((task) => (
                            <li key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-l-4 border-orange-300 hover:bg-orange-50 transition shadow-sm">
                                <div className="font-medium text-gray-800">{task.name}</div>
                                <span className="text-sm text-orange-600 font-semibold flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {task.dueTime}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="py-4 text-center text-gray-500 italic flex flex-col items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-teal-500" />All systems clear. No urgent tasks.</div>
                )}
            </section>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg"><h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Monthly Sales Pipeline</h2><ChartTwo /></div>
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg"><h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Client Acquisition Funnel</h2><ChartThree /></div>
        </section>
      </div>
    </div>
  );
}