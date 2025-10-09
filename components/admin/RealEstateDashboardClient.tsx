'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Simulating Link component behavior with an anchor tag
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
} from '@heroicons/react/24/outline';

// --- MOCK COMPONENTS AND INTERFACES (for single file mandate) ---

// Mocking Next-Auth Session
interface Session {
    user: {
        name: string;
        email: string;
    }
}

// Mocking external chart components
const ChartTwo = () => (
    <div className="flex items-center justify-center h-full min-h-[250px] bg-gray-50 rounded-xl p-4 border border-dashed border-teal-200">
        <span className="text-teal-600 font-semibold text-sm">
            [Placeholder: Monthly Gross Sales Chart]
        </span>
    </div>
);

const ChartThree = () => (
    <div className="flex items-center justify-center h-full min-h-[250px] bg-gray-50 rounded-xl p-4 border border-dashed border-orange-200">
        <span className="text-orange-600 font-semibold text-sm">
            [Placeholder: Client Acquisition Funnel]
        </span>
    </div>
);

// Defined interfaces
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

type Props = DashboardData & { session: Session };

// Sample Data
const sampleData: DashboardData = {
  metrics: {
    totalProperties: 124,
    totalAgents: 12,
    totalClients: 350,
    revenueThisMonth: 120450,
    appointmentsToday: 8,
  },
  tasks: [
    { id: 't1', name: 'Inspect Property #102', dueDate: '11:00 AM', dueTime: '11:00 AM' },
    { id: 't2', name: 'Call new client Jane Doe', dueDate: '02:00 PM', dueTime: '02:00 PM' },
    { id: 't3', name: 'Team Strategy Session', dueDate: '09:00 AM', dueTime: '09:00 AM' },
  ],
};

// --- MAIN COMPONENT ---

export default function RealEstateDashboardClient() {
  const [data, setData] = useState<DashboardData>(sampleData);
  const session: Session = { // Mocking session data
    user: { name: "Lead Broker", email: "broker@agency.com" }
  };

  useEffect(() => {
    // Simulate data fetching delay
    const timer = setTimeout(() => setData(sampleData), 300);
    return () => clearTimeout(timer);
  }, []);

  const {
    totalProperties,
    totalAgents,
    totalClients,
    revenueThisMonth,
    appointmentsToday,
  } = data.metrics;

  const cards = [
    {
      title: 'Active Properties',
      value: totalProperties,
      icon: BuildingOfficeIcon,
      accent: 'text-teal-500 border-teal-500',
      link: '/admin/properties',
      description: 'Currently listed inventory.',
    },
    {
      title: 'Active Agents',
      value: totalAgents,
      icon: UsersIcon,
      accent: 'text-blue-500 border-blue-500',
      link: '/admin/agents',
      description: 'Team members online.',
    },
    {
      title: 'Total Clients',
      value: totalClients,
      icon: HomeIcon,
      accent: 'text-indigo-500 border-indigo-500',
      link: '/admin/clients',
      description: 'Acquired leads and buyers.',
    },
  ];
    
  // Component for visually appealing metric cards
  const MainMetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card }) => (
    <a
      key={card.title}
      href={card.link}
      className={`relative p-6 rounded-2xl bg-white shadow-lg transition duration-300 hover:shadow-xl transform group cursor-pointer border-b-4 ${card.accent.split(' ').slice(1, 2).join(' ')} border-opacity-70`}
    >
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
        
        {/* Main Header - Focus on Broker and Greeting */}
        <header className="mb-10 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border-l-8 border-teal-600">
          <p className="text-base text-gray-500">Welcome back, {session.user.name.split(' ')[0]}</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Broker Command <span className="text-teal-600">Center</span>
          </h1>
        </header>

        {/* --- Key Performance Indicators (KPIs) --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            
            {/* 1. Revenue Card (Elevated) */}
            <a
                href="/admin/reports"
                className="col-span-1 lg:col-span-2 p-6 rounded-2xl bg-teal-600 text-white shadow-2xl transition duration-300 hover:bg-teal-700 flex flex-col justify-between"
            >
                <div className="flex items-center justify-between mb-4">
                    <CurrencyDollarIcon className="w-10 h-10 text-white opacity-90" />
                    <span className="text-lg font-semibold uppercase opacity-90">Revenue This Month</span>
                </div>
                <h2 className="text-5xl sm:text-6xl font-black leading-tight">
                    ${revenueThisMonth.toLocaleString()}
                </h2>
                <p className="mt-2 text-sm opacity-80">Targeting Q3 closing goals. Click for full finance report.</p>
            </a>

            {/* 2. Appointments Card (Urgency) */}
            <a
                href="/admin/appointments"
                className="col-span-1 p-6 rounded-2xl bg-orange-500 text-white shadow-xl transition duration-300 hover:bg-orange-600 flex flex-col justify-between"
            >
                 <div className="flex items-center justify-between mb-4">
                    <CalendarDaysIcon className="w-10 h-10 text-white opacity-90" />
                    <span className="text-lg font-semibold uppercase opacity-90">Appointments Today</span>
                </div>
                <h2 className="text-5xl font-black leading-tight">
                    {appointmentsToday}
                </h2>
                <p className="mt-2 text-sm opacity-80">Number of showing and consultation bookings.</p>
            </a>

        </section>


        {/* --- Secondary Metrics and Actionables --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            
            {/* Secondary Metrics (Properties, Agents, Clients) - 2/3 width */}
            <section className="grid grid-cols-1 sm:grid-cols-3 lg:col-span-2 gap-6">
                {cards.map((card) => (
                    <MainMetricCard key={card.title} card={card} />
                ))}
            </section>
            
            {/* Today's Tasks (Action List) - 1/3 width */}
            <section className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-orange-500" /> Today's Focus
                    </h2>
                    <a href="/admin/tasks" className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center">
                        View All <ArrowRightIcon className="w-3 h-3 ml-1" />
                    </a>
                </div>
                <ul className="space-y-3">
                    {data.tasks.map((task) => (
                        <li
                            key={task.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-l-4 border-orange-300 hover:bg-orange-50 transition shadow-sm"
                        >
                            <div className="font-medium text-gray-800">{task.name}</div>
                            <span className="text-sm text-orange-600 font-semibold flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" /> {task.dueTime}
                            </span>
                        </li>
                    ))}
                </ul>
                {data.tasks.length === 0 && (
                     <div className="py-4 text-center text-gray-500 italic flex flex-col items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-teal-500" />
                        All systems clear. No urgent tasks.
                     </div>
                )}
            </section>
        </div>


        {/* --- Charts Section (Analytics) --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Monthly Sales Pipeline</h2>
                <ChartTwo />
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Client Acquisition Funnel</h2>
                <ChartThree />
            </div>
        </section>
      </div>
    </div>
  );
}
