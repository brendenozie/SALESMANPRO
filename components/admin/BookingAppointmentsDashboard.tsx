"use client";

import React, { useEffect, useState, useCallback } from 'react';
// We simulate Link/Router navigation behavior within the single component structure
import {
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon,
  PlusCircleIcon,
  CalendarIcon,
  ArrowTrendingUpIcon, 
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- MOCK CHART COMPONENTS (FOR SINGLE-FILE MANDATE) ---
// In a real app, these would take the chart data as props
const ChartTwo: React.FC<{data: any}> = ({data}) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-indigo-50/50 dark:bg-gray-800 rounded-lg p-4 border border-dashed border-indigo-200 dark:border-indigo-900">
    <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
      [Placeholder: Last 7 Days Line Chart]
    </span>
    <pre className="mt-2 text-xs text-indigo-500/80 dark:text-indigo-500/50 bg-white dark:bg-gray-900 p-2 rounded">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

const ChartThree: React.FC<{data: any}> = ({data}) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-purple-50/50 dark:bg-gray-800 rounded-lg p-4 border border-dashed border-purple-200 dark:border-purple-900">
    <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
      [Placeholder: Monthly Conversion Rate Chart]
    </span>
     <pre className="mt-2 text-xs text-purple-500/80 dark:text-purple-500/50 bg-white dark:bg-gray-900 p-2 rounded">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);


// --- TYPE DEFINITIONS ---
type AppointmentType = 'Consultation' | 'Follow-up' | 'New Appointment' | 'Reschedule';

type Appointment = {
  id: string;
  name: string;
  type: AppointmentType;
  time: string;
  date: string;
};

type StatCardData = {
  id: string;
  label: string;
  value: number | string;
  icon: JSX.Element;
  change: string; // e.g., "+12%" or "-3%"
  trendColor: 'green' | 'red';
  accentColor: string;
};

type ChartData = {
    bookingVolume: { name: string; value: number }[];
    monthlyConversion: Record<string, number>;
}

// --- DATA & API SIMULATION ---
// Assuming you get companyId from page props or a context
// const COMPANY_ID = "your-company-id"; // Replace with dynamic company ID

export default function BookingAppointmentsDashboard(): JSX.Element {
  const { slug: companyId } = useParams();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch data from the API ---
  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/dashboard/booking/${companyId}`, { method: 'GET', credentials: 'include' });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.data?.message || 'Failed to fetch dashboard data');
        }

        if (mounted) {
          const { stats: apiStats, appointments: apiAppointments, charts: apiCharts } = result.data;

          // Map API stats to the StatCardData structure
          const formattedStats: StatCardData[] = [
            { id: 's1', label: 'Upcoming Bookings', value: apiStats.upcomingBookings, icon: <CalendarDaysIcon className="w-6 h-6" />, change: '+12%', trendColor: 'green', accentColor: 'border-indigo-500' },
            { id: 's2', label: 'Total Clients', value: apiStats.totalClients, icon: <UsersIcon className="w-6 h-6" />, change: '+4%', trendColor: 'green', accentColor: 'border-green-500' },
            { id: 's3', label: 'Completed Sessions', value: apiStats.completedSessions, icon: <ChartBarIcon className="w-6 h-6" />, change: '+20%', trendColor: 'green', accentColor: 'border-cyan-500' },
            { id: 's4', label: 'Hours This Week', value: apiStats.hoursThisWeek, icon: <ClockIcon className="w-6 h-6" />, change: '-3%', trendColor: 'red', accentColor: 'border-yellow-500' },
          ];
          
          setStats(formattedStats);
          setAppointments(apiAppointments);
          setCharts(apiCharts);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => { mounted = false; };
  }, []);

  // --- Helper Function for Appointment Card Coloring ---
  const getAppointmentProps = useCallback((type: AppointmentType) => {
    switch (type) {
      case 'Consultation':
        return { tag: 'bg-indigo-500', text: 'text-indigo-500', icon: '📝' };
      case 'Follow-up':
        return { tag: 'bg-green-500', text: 'text-green-500', icon: '✅' };
      case 'New Appointment':
        return { tag: 'bg-red-500', text: 'text-red-500', icon: '✨' };
      case 'Reschedule':
        return { tag: 'bg-yellow-500', text: 'text-yellow-500', icon: '🔁' };
      default:
        return { tag: 'bg-gray-500', text: 'text-gray-500', icon: '👤' };
    }
  }, []);

  // --- Components for Visual Appeal ---

  // 1. Stat Card Component
  const StatCardComponent: React.FC<{ s: StatCardData }> = ({ s }) => (
    <div
      key={s.id}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition duration-300 hover:shadow-2xl hover:-translate-y-0.5 border-t-4 ${s.accentColor} dark:border-t-4 dark:shadow-indigo-900/10`}
      role="region"
      aria-label={s.label}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
          <div className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{s.value}</div>
        </div>
        <div 
          className="p-3 rounded-full text-white shadow-lg opacity-80"
          style={{ backgroundColor: s.accentColor.replace('border-', 'bg-') }}
        >
          {React.cloneElement(s.icon, { className: "w-6 h-6 text-white" })}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            s.trendColor === 'green' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          <ArrowTrendingUpIcon className={`w-4 h-4 ${s.trendColor === 'red' && 'rotate-180'}`} />
          {s.change}
          <span className="ml-1 text-gray-500 dark:text-gray-400 font-normal">vs last month</span>
        </span>
      </div>
    </div>
  );

  // 2. Appointment Card Component
  const AppointmentCard: React.FC<{ a: Appointment, props: ReturnType<typeof getAppointmentProps> }> = ({ a, props }) => (
    <div
      key={a.id}
      className={`group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md transition duration-200 hover:shadow-lg hover:border-r-4 ${props.tag.replace('bg-', 'border-r-')} cursor-pointer border border-gray-100 dark:border-gray-700`}
    >
      <div className="flex items-center gap-4">
        <div className={`text-xl p-3 rounded-lg flex-shrink-0 ${props.tag} text-white shadow-md`}>
          {props.icon}
        </div>
        <div>
          <div className="text-base font-semibold text-gray-900 dark:text-white">{a.name}</div>
          <div className={`text-sm font-medium ${props.text} mt-0.5`}>{a.type}</div>
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{a.date}</div>
          <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{a.time}</div>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
      </div>
    </div>
  );

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 animate-spin" /> Loading Command Center...
        </div>
      </div>
    );
  }
  
  if(error) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950/20">
        <div className="text-red-600 dark:text-red-400 text-center p-8">
            <h2 className="font-bold text-lg mb-2">Failed to load dashboard</h2>
            <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <header className="mb-10 p-6 rounded-3xl shadow-2xl" style={{backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)'}}>
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold leading-snug text-white">
                Welcome to the Command Center
              </h1>
              <p className="mt-1 text-indigo-200 text-lg">
                Your high-level overview of client activity and today's operational schedule.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="/appointments/new" className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 px-6 py-3 text-base font-semibold text-indigo-600 shadow-lg hover:shadow-xl hover:bg-gray-50 transition duration-300 transform hover:scale-[1.02]">
                <PlusCircleIcon className="w-5 h-5" />
                New Booking
              </a>
              <a href="/calendar" className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-indigo-200 hover:text-white hover:bg-white/10 transition-colors">
                <CalendarIcon className="w-5 h-5" />
                Full Calendar
              </a>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((s) => (
            <StatCardComponent key={s.id} s={s} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 space-y-8">
            <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-indigo-500" />
                  Today's Urgent Schedule
                </h2>
                <a href="/appointments" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 flex items-center">
                  <EyeIcon className="w-4 h-4 mr-1" /> View All
                </a>
              </div>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((a) => (
                    <AppointmentCard 
                        key={a.id} 
                        a={a} 
                        props={getAppointmentProps(a.type)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">No high-priority appointments scheduled.</div>
              )}
            </div>
            <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Jump To:</h3>
              <div className="grid grid-cols-1 gap-4">
                <a href="/clients" className="flex items-center justify-between rounded-xl bg-indigo-50 dark:bg-gray-800 p-4 text-base font-semibold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 transition-colors shadow-md">
                  Manage Clients
                  <UsersIcon className="w-5 h-5" />
                </a>
                <a href="/reports" className="flex items-center justify-between rounded-xl bg-purple-50 dark:bg-gray-800 p-4 text-base font-semibold text-purple-700 dark:text-purple-400 hover:bg-purple-100 transition-colors shadow-md">
                  Analyze Reports
                  <ChartBarIcon className="w-5 h-5" />
                </a>
                <a href="/settings" className="flex items-center justify-between rounded-xl bg-gray-100 dark:bg-gray-800 p-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors shadow-md">
                  Update Settings
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Booking Volume Trend</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</div>
              </div>
              <div className="min-h-[280px]">
                <ChartTwo data={charts?.bookingVolume} />
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Service Completion & Conversion</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">Monthly breakdown</div>
              </div>
              <div className="min-h-[280px]">
                <ChartThree data={charts?.monthlyConversion} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}