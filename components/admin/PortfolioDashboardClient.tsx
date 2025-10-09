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
} from '@heroicons/react/24/outline';

// --- MOCK CHART COMPONENTS (FOR SINGLE-FILE MANDATE) ---

const ChartTwo = () => (
  <div className="flex items-center justify-center h-full min-h-[220px] bg-gray-800/50 rounded-xl p-4 border border-dashed border-cyan-700">
    <span className="text-cyan-500 font-semibold text-sm">
      [Placeholder: Monthly Project Views Line Chart]
    </span>
  </div>
);

const ChartThree = () => (
  <div className="flex items-center justify-center h-full min-h-[220px] bg-gray-800/50 rounded-xl p-4 border border-dashed border-fuchsia-700">
    <span className="text-fuchsia-500 font-semibold text-sm">
      [Placeholder: Inquiries Trend Bar Chart]
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
    totalProjects: number;
    totalSkills: number;
    testimonials: number;
    inquiriesThisMonth: number;
    upcomingMeetings: number;
  };
  tasks: Task[];
}

// --- DATA & API SIMULATION ---

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

// --- MAIN COMPONENT ---

export default function PortfolioDashboardClient() {
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
    totalProjects,
    totalSkills,
    testimonials,
    inquiriesThisMonth,
    upcomingMeetings,
  } = data.metrics;

  const cards = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: BriefcaseIcon,
      accent: 'border-cyan-500 text-cyan-500',
      link: '/admin/projects',
      description: 'Your body of work.',
    },
    {
      title: 'Core Skills',
      value: totalSkills,
      icon: LightBulbIcon,
      accent: 'border-amber-500 text-amber-500',
      link: '/admin/skills',
      description: 'Defined competencies.',
    },
    {
      title: 'Client Testimonials',
      value: testimonials,
      icon: UserCircleIcon,
      accent: 'border-green-500 text-green-500',
      link: '/admin/testimonials',
      description: 'Positive feedback score.',
    },
    {
      title: 'Inquiries (MoM)',
      value: inquiriesThisMonth,
      icon: ChatBubbleLeftRightIcon,
      accent: 'border-fuchsia-500 text-fuchsia-500',
      link: '/admin/inquiries',
      description: 'Leads generated this month.',
    },
    {
      title: 'Upcoming Meetings',
      value: upcomingMeetings,
      icon: CalendarDaysIcon,
      accent: 'border-blue-500 text-blue-500',
      link: '/admin/calendar',
      description: 'Scheduled this week.',
    },
  ];

  // Component for visually appealing metric cards
  const MetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card }) => (
    <a
      key={card.title}
      href={card.link}
      className={`relative p-6 rounded-2xl bg-gray-800 border ${card.accent.replace('text-', 'border-')} shadow-xl transition duration-300 hover:shadow-2xl hover:scale-[1.02] transform group`}
    >
      {/* Title and Icon */}
      <div className="flex items-center mb-3">
        <card.icon className={`w-6 h-6 ${card.accent.replace('border-', 'text-')}`} />
        <h2 className="ml-3 text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{card.title}</h2>
      </div>
      
      {/* Value */}
      <p className="text-4xl font-extrabold text-white">{card.value}</p>
      
      {/* Description */}
      <p className="mt-2 text-xs text-gray-500">{card.description}</p>

      {/* Hover effect arrow */}
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

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Main Header and Greeting */}
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

        {/* Metrics Cards - Dynamic & High Contrast */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {cards.map((card) => (
            <MetricCard key={card.title} card={card} />
          ))}
        </section>

        {/* Main Content: Charts and Tasks */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Charts Section (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border-t-4 border-cyan-600">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BriefcaseIcon className="w-6 h-6 text-cyan-400" /> Monthly Project Views
              </h3>
              <div className="min-h-[300px]">
                <ChartTwo />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border-t-4 border-fuchsia-600">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-fuchsia-400" /> Inquiries Trend
              </h3>
              <div className="min-h-[300px]">
                <ChartThree />
              </div>
            </div>
          </div>

          {/* Today's Tasks (1/3 width) - Action Focus */}
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
