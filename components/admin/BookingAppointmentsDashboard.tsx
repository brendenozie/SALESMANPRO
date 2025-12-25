"use client";

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
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

// Dynamically import ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- FUNCTIONAL APEX CHART COMPONENTS ---

const VolumeLineChart: React.FC<{ data: any[] }> = ({ data }) => {
  const series = [{
    name: "Bookings",
    data: data?.map(d => d.value) || []
  }];

  const options: any = {
    chart: { 
      type: 'area', 
      toolbar: { show: false }, 
      sparklines: { enabled: false },
      background: 'transparent'
    },
    stroke: { curve: 'smooth', width: 3, colors: ['#6366f1'] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: data?.map(d => d.name) || [],
      labels: { style: { colors: '#94a3b8' } },
      axisBorder: { show: false },
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    grid: { borderColor: '#334155', strokeDashArray: 4 },
    theme: { mode: 'dark' },
    tooltip: { theme: 'dark' },
    colors: ['#6366f1']
  };

  return <Chart options={options} series={series} type="area" height={280} />;
};

const ConversionBarChart: React.FC<{ data: Record<string, number> | null }> = ({ data }) => {
  const categories = data ? Object.keys(data) : [];
  const values = data ? Object.values(data) : [];

  const series = [{
    name: "Conversion Rate (%)",
    data: values
  }];

  const options: any = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%',
        distributed: true,
      }
    },
    colors: ['#a855f7', '#8b5cf6', '#6366f1', '#4f46e5'],
    xaxis: {
      categories: categories,
      labels: { style: { colors: '#94a3b8' } },
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    grid: { show: false },
    legend: { show: false },
    tooltip: { theme: 'dark' }
  };

  return <Chart options={options} series={series} type="bar" height={280} />;
};

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
  change: string;
  trendColor: 'green' | 'red';
  accentColor: string;
};

type ChartData = {
    bookingVolume: { name: string; value: number }[];
    monthlyConversion: Record<string, number>;
}

type BookingDashboardData = {
  stats: {
    upcomingBookings: number;
    totalClients: number;
    completedSessions: number;
    hoursThisWeek: number;
  };
  appointments: Appointment[];
  charts: ChartData;
};


type Props = BookingDashboardData & {
  slug?: string;
};

export default function BookingAppointmentsDashboard({
  stats,
  appointments,
  charts,
}: Props): JSX.Element {

  const { slug: companyId } = useParams();

  const [loading, setLoading] = useState(true);
  // const [stats, setStats] = useState<StatCardData[]>([]);
  // const [appointments, setAppointments] = useState<Appointment[]>([]);
  // const [charts, setCharts] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statCards: StatCardData[] = [
  {
    id: 's1',
    label: 'Upcoming Bookings',
    value: stats.upcomingBookings,
    icon: <CalendarDaysIcon className="w-6 h-6" />,
    change: '+0%',
    trendColor: 'green',
    accentColor: 'border-indigo-500',
  },
  {
    id: 's2',
    label: 'Total Clients',
    value: stats.totalClients,
    icon: <UsersIcon className="w-6 h-6" />,
    change: '+0%',
    trendColor: 'green',
    accentColor: 'border-green-500',
  },
  {
    id: 's3',
    label: 'Completed Sessions',
    value: stats.completedSessions,
    icon: <ChartBarIcon className="w-6 h-6" />,
    change: '+0%',
    trendColor: 'green',
    accentColor: 'border-cyan-500',
  },
  {
    id: 's4',
    label: 'Hours This Week',
    value: stats.hoursThisWeek,
    icon: <ClockIcon className="w-6 h-6" />,
    change: '+0%',
    trendColor: 'red',
    accentColor: 'border-yellow-500',
  },
];


  // useEffect(() => {
  //   let mounted = true;
  //   const fetchDashboard = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const response = await fetch(`${apiBaseUrl}/admin/dashboard/booking/${companyId}`, { method: 'GET', credentials: 'include' });
  //       const result = await response.json();

  //       if (!response.ok || !result.success) {
  //         throw new Error(result.data?.message || 'Failed to fetch dashboard data');
  //       }

  //       if (mounted) {
  //         const { stats: apiStats, appointments: apiAppointments, charts: apiCharts } = result.data;

  //         const formattedStats: StatCardData[] = [
  //           { id: 's1', label: 'Upcoming Bookings', value: apiStats.upcomingBookings, icon: <CalendarDaysIcon className="w-6 h-6" />, change: '+12%', trendColor: 'green', accentColor: 'border-indigo-500' },
  //           { id: 's2', label: 'Total Clients', value: apiStats.totalClients, icon: <UsersIcon className="w-6 h-6" />, change: '+4%', trendColor: 'green', accentColor: 'border-green-500' },
  //           { id: 's3', label: 'Completed Sessions', value: apiStats.completedSessions, icon: <ChartBarIcon className="w-6 h-6" />, change: '+20%', trendColor: 'green', accentColor: 'border-cyan-500' },
  //           { id: 's4', label: 'Hours This Week', value: apiStats.hoursThisWeek, icon: <ClockIcon className="w-6 h-6" />, change: '-3%', trendColor: 'red', accentColor: 'border-yellow-500' },
  //         ];
          
  //         // setStats(formattedStats);
  //         // setAppointments(apiAppointments);
  //         // setCharts(apiCharts);
  //       }
  //     } catch (e: any) {
  //       if (mounted) setError(e.message);
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   };

  //   fetchDashboard();
  //   return () => { mounted = false; };
  // }, [companyId]);

  const getAppointmentProps = useCallback((type: AppointmentType) => {
    switch (type) {
      case 'Consultation': return { tag: 'bg-indigo-500', text: 'text-indigo-500', icon: '📝' };
      case 'Follow-up': return { tag: 'bg-green-500', text: 'text-green-500', icon: '✅' };
      case 'New Appointment': return { tag: 'bg-red-500', text: 'text-red-500', icon: '✨' };
      case 'Reschedule': return { tag: 'bg-yellow-500', text: 'text-yellow-500', icon: '🔁' };
      default: return { tag: 'bg-gray-500', text: 'text-gray-500', icon: '👤' };
    }
  }, []);

  // if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Loading Command Center...</div>;
  // if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <header className="mb-10 p-8 rounded-3xl shadow-2xl" style={{backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)'}}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white">Command Center</h1>
              <p className="mt-1 text-indigo-100 text-lg">Operational overview </p>
            </div>
            <div className="flex items-center gap-4">
              {/* <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                + New Booking
              </button> */}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((s) => (
            <div key={s.id} className={`bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border-t-4 ${s.accentColor}`}>
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">{s.label}</p>
                    <h3 className="text-3xl font-bold mt-1">{s.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>{s.icon}</div>
               </div>
               <div className={`mt-4 text-xs font-bold ${s.trendColor === 'green' ? 'text-green-500' : 'text-red-500'}`}>
                 {s.change} <span className="text-gray-400 font-normal">vs last month</span>
               </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-6">Booking Volume (7 Days)</h2>
              <VolumeLineChart data={charts?.bookingVolume || []} />
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-6">Conversion Analytics</h2>
              <ConversionBarChart data={charts?.monthlyConversion || null} />
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-indigo-500" /> Urgent Schedule
              </h2>
              <div className="space-y-4">
                {appointments.map(a => {
                  const props = getAppointmentProps(a.type);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-indigo-500">
                      <div>
                        <p className="font-bold">{a.name}</p>
                        <p className={`text-xs ${props.text}`}>{a.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black">{a.time}</p>
                        <p className="text-[10px] text-gray-500">{a.date}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}