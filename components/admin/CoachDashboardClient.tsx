"use client";

import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChartBarSquareIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';
// Removed: import { useParams } from 'next/navigation';
// Removed: useCallback import

// Mocking the environment variable for standalone use
const apiBaseUrl = 'http://127.0.0.1:3000/api'; // Or process.env.NEXT_PUBLIC_API_URL

// --- INTERFACES ---
interface Session {
    user: { name: string; email: string; }
}

export interface CoachTask {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface CoachDashboardData {
  metrics: {
    activeClients: number;
    sessionsThisWeek: number;
    programSalesYTD: number;
    billedRevenueYTD: number;
    openLeads: number;
  };
  tasks: CoachTask[];
}

// Type definition for the Metric Card structure
export type MetricCard = {
    title: string;
    value: number;
    icon: React.ElementType;
    accent: string;
    link: string;
    description: string;
};

// --- MOCK CHART COMPONENTS ---
const ChartTwo = () => (
    <div className="flex items-center justify-center h-full min-h-[250px] bg-indigo-50 rounded-2xl p-4 border border-dashed border-indigo-300">
        <span className="text-indigo-700 font-semibold text-sm">[Placeholder: Quarterly Recurring Revenue (QRR) Trend]</span>
    </div>
);
const ChartThree = () => (
    <div className="flex items-center justify-center h-full min-h-[250px] bg-amber-50 rounded-2xl p-4 border border-dashed border-amber-300">
        <span className="text-amber-700 font-semibold text-sm">[Placeholder: Lead to Client Conversion Funnel]</span>
    </div>
);

// Reusable Metric Card Component (Moved outside to follow rules of hooks)
const MainMetricCard: React.FC<{ card: MetricCard }> = ({ card }) => (
    <a href={card.link} className={`relative p-6 rounded-2xl bg-white shadow-xl transition duration-300 hover:shadow-2xl transform hover:scale-[1.02] group cursor-pointer border-b-4 ${card.accent.split(' ')[1]} border-opacity-80`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-xl p-3 ${card.accent.replace('text-', 'bg-').replace('-500', '-100')}`}>
          <card.icon className={`w-8 h-8 ${card.accent.split(' ')[0]}`} />
        </div>
        <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-900 transition">{card.title}</span>
      </div>
      <p className="text-4xl font-extrabold text-gray-900 mt-1">{card.value.toLocaleString()}</p>
      <p className="mt-2 text-xs text-gray-500 italic">{card.description}</p>
    </a>
);


// --- MAIN COMPONENT ---
export default function CoachDashboardClient() {
  // FIX: Explicitly define coachId since Next.js useParams is not available
  const coachId = 'demo-coach-123';
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mocking session data for display purposes
  const session: Session = { user: { name: "Dr. Alex Taylor", email: "alex.taylor@growthcorp.com" } };

  // Mock Data Fetching Logic (Replace with actual API call)
  useEffect(() => {
    // Simulating API latency and fetching coach-specific data
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // --- MOCK API CALL START ---
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            const mockData: CoachDashboardData = {
                metrics: {
                    activeClients: 42,
                    sessionsThisWeek: 18,
                    programSalesYTD: 124,
                    billedRevenueYTD: 154780,
                    openLeads: 9,
                },
                tasks: [
                    { id: 't1', name: 'Prep QBR deck for Zenith Corp.', dueDate: '2025-10-21', dueTime: '10:00 AM', priority: 'High' },
                    { id: 't2', name: 'Follow up with 3 open leads.', dueDate: '2025-10-21', dueTime: '02:30 PM', priority: 'Medium' },
                    { id: 't3', name: 'Review Module 4 content draft.', dueDate: '2025-10-22', dueTime: '09:00 AM', priority: 'Medium' },
                ]
            };
            setData(mockData);
            // --- MOCK API CALL END ---

            // In a real app, the endpoint would be:
            // const response = await fetch(`${apiBaseUrl}/coach/dashboard/consulting?coachId=${coachId}`, { ... });

        } catch (err: any) {
            setError(err.message || "Failed to fetch dashboard data.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [coachId]);

  // --- Loading/Error States ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-indigo-600 flex flex-col items-center justify-center">
        <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl font-semibold">Loading Growth Command Center...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-red-50 text-red-600 flex flex-col items-center justify-center text-center p-4">
        <ExclamationCircleIcon className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Dashboard Unavailable</h2>
        <p>{error || "Could not connect to the growth center."}</p>
      </div>
    );
  }

  const { activeClients, sessionsThisWeek, programSalesYTD, billedRevenueYTD, openLeads } = data.metrics;

  const cards: MetricCard[] = [
    { title: 'Active Clients', value: activeClients, icon: UsersIcon, accent: 'text-indigo-500 border-indigo-500', link: '/coach/clients', description: 'Currently receiving 1:1 or program support.' },
    { title: 'Sessions This Week', value: sessionsThisWeek, icon: CalendarDaysIcon, accent: 'text-purple-500 border-purple-500', link: '/coach/schedule', description: 'Booked consultations and coaching calls.' },
    { title: 'Program Sales YTD', value: programSalesYTD, icon: BookOpenIcon, accent: 'text-amber-500 border-amber-500', link: '/coach/courses', description: 'Enrollments in all digital products.' },
  ];
    
  // Utility to determine task badge color
  const getPriorityClasses = (priority: CoachTask['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-400';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-400';
      case 'Low': return 'bg-green-100 text-green-700 border-green-400';
      default: return 'bg-gray-100 text-gray-700 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-10 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-l-8 border-indigo-600">
          <p className="text-base text-gray-500 font-medium">Hello, {session.user.name.split(' ')[0]}</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            Growth Command <span className="text-indigo-600">Center</span>
            <ChartBarSquareIcon className="w-10 h-10 text-indigo-500" />
          </h1>
        </header>

        {/* --- Primary Financial & Lead Metrics --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {/* YTD Revenue Card */}
            <a href="/coach/payments" className="col-span-1 lg:col-span-2 p-8 rounded-3xl bg-indigo-600 text-white shadow-2xl transition duration-300 hover:bg-indigo-700 flex flex-col justify-between transform hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-4">
                    <CurrencyDollarIcon className="w-10 h-10 text-white opacity-90" />
                    <span className="text-xl font-bold uppercase tracking-wider opacity-90">Billed Revenue YTD</span>
                </div>
                <h2 className="text-5xl sm:text-7xl font-black leading-tight">${billedRevenueYTD.toLocaleString()}</h2>
                <p className="mt-3 text-sm opacity-80 font-light">Track your annual financial progress and key milestones. Click for full finance reports.</p>
            </a>
            
            {/* Open Leads Card */}
            <a href="/coach/leads" className="col-span-1 p-8 rounded-3xl bg-amber-500 text-white shadow-2xl transition duration-300 hover:bg-amber-600 flex flex-col justify-between transform hover:scale-[1.01]">
                 <div className="flex items-center justify-between mb-4">
                    <BriefcaseIcon className="w-10 h-10 text-white opacity-90" />
                    <span className="text-xl font-bold uppercase tracking-wider opacity-90">Open Leads</span>
                </div>
                <h2 className="text-5xl font-black leading-tight">{openLeads}</h2>
                <p className="mt-3 text-sm opacity-80 font-light">Prospects currently in the sales pipeline and ready for outreach.</p>
            </a>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Three Main Metric Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 lg:col-span-2 gap-6">
                {cards.map((card) => <MainMetricCard key={card.title} card={card} />)}
            </section>
            
            {/* Action Items / Tasks */}
            <section className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><PuzzlePieceIcon className="w-6 h-6 text-amber-500" /> Today's Action Items</h2>
                    <a href="/coach/tasks" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">Manage All <ArrowRightIcon className="w-3 h-3 ml-1" /></a>
                </div>
                {data.tasks.length > 0 ? (
                    <ul className="space-y-4">
                        {data.tasks.map((task) => (
                            <li key={task.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-xl border-l-4 border-amber-400 hover:bg-amber-50 transition shadow-sm">
                                <div className="flex flex-col">
                                    <div className="font-medium text-gray-800">{task.name}</div>
                                    <span className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${getPriorityClasses(task.priority)} inline-block w-fit`}>{task.priority} Priority</span>
                                </div>
                                <span className="text-sm text-gray-500 font-medium flex items-center gap-1 shrink-0 ml-4"><ClockIcon className="w-4 h-4 text-amber-500" /> {task.dueTime}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="py-6 text-center text-gray-500 italic flex flex-col items-center gap-3">
                        <CheckCircleIcon className="w-7 h-7 text-indigo-500" />
                        <span className="font-semibold">All systems clear. Time for deep work!</span>
                    </div>
                )}
            </section>
        </div>

        {/* --- Charts Section --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2"><ChartBarSquareIcon className="w-5 h-5 text-indigo-500" /> Quarterly Revenue Trends</h2>
                <ChartTwo />
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2"><UsersIcon className="w-5 h-5 text-purple-500" /> Lead to Client Conversion</h2>
                <ChartThree />
            </div>
        </section>
      </div>
    </div>
  );
}
