"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  GlobeAltIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ChartBarIcon,
  TicketIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

// Dynamic import for ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- APEX CHART COMPONENTS ---

const BookingTrendsChart: React.FC<{ data: any }> = ({ data }) => {
  const series = [{
    name: "Bookings",
    data: data?.values || [45, 52, 38, 65, 48, 82, 70]
  }];

  const options: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#0ea5e9'], // sky-500
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: { labels: { style: { colors: '#64748b' } } },
    grid: { borderColor: '#f1f5f9' },
    tooltip: { theme: 'light' }
  };

  return <Chart options={options} series={series} type="area" height={250} />;
};

const DestinationRevenueChart: React.FC<{ data: any }> = ({ data }) => {
  const series = [{
    name: "Revenue",
    data: data?.values || [12000, 18500, 9800, 15000, 21000]
  }];

  const options: any = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 6, horizontal: true, barHeight: '60%', distributed: true }
    },
    colors: ['#0284c7', '#059669', '#d97706', '#7c3aed', '#db2777'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.labels || ['Bali', 'Paris', 'Tokyo', 'Rome', 'New York'],
      labels: { 
        style: { colors: '#64748b' },
        formatter: (val: number) => `$${val / 1000}k`
      }
    },
    yaxis: { labels: { style: { colors: '#64748b', fontWeight: 600 } } },
    grid: { show: false },
    tooltip: { theme: 'light', y: { formatter: (val: number) => `$${val.toLocaleString()}` } },
    legend: { show: false }
  };

  return <Chart options={options} series={series} type="bar" height={250} />;
};

// --- TYPE DEFINITIONS ---
interface UpcomingTour {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface TourStat {
    totalDestinations: number;
    totalBookings: number;
    monthlyRevenue: number;
    activeTourGuides: number;
    upcomingTours: number;
}

interface TravelDashboardData {
    stats: TourStat;
    tours: UpcomingTour[];
    charts: {
        bookingTrends: any;
        revenueByDestination: any;
    }
}

// --- METRIC CARD COMPONENT ---
const MetricCard: React.FC<any> = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay }}
    >
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')} bg-opacity-10 ${color} mb-3`}>
            <Icon className="w-6 h-6" />
        </div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{title}</p>
    </motion.div>
);

// --- MAIN DASHBOARD COMPONENT ---
export default function TravelDashboard() {
  const { slug: companyId } = useParams();
  const [data, setData] = useState<TravelDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/admin/dashboard/travel/${companyId}`);
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error("API Error");
            setData(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [companyId]);
  
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-sky-600">
      <ArrowPathIcon className="w-10 h-10 animate-spin mb-4" />
      <span className="font-bold tracking-widest uppercase">Global Operations Sync...</span>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold">
      <ExclamationCircleIcon className="w-8 h-8 mr-2" /> Error Loading Travel Data
    </div>
  );

  const statsCards = [
    { title: 'Destinations', value: data.stats.totalDestinations, icon: GlobeAltIcon, color: 'text-sky-600' },
    { title: 'Bookings', value: data.stats.totalBookings, icon: TicketIcon, color: 'text-green-600' },
    { title: 'Revenue', value: `$${(data.stats.monthlyRevenue / 1000).toFixed(1)}k`, icon: CurrencyDollarIcon, color: 'text-yellow-600' },
    { title: 'Guides', value: data.stats.activeTourGuides, icon: UsersIcon, color: 'text-indigo-600' },
    { title: 'Tours', value: data.stats.upcomingTours, icon: CalendarDaysIcon, color: 'text-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        <motion.header className="mb-12 flex justify-between items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Travel Hub <span className="text-sky-500">Explorer</span></h1>
            <p className="text-slate-500 font-medium">Monitoring global routes and expedition logistics</p>
          </div>
          <button className="bg-sky-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition">
            Create New Tour
          </button>
        </motion.header>

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {statsCards.map((card, i) => (
            <MetricCard key={i} {...card} delay={i * 0.1} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6 text-slate-800">
                    <ChartBarIcon className="w-6 h-6 text-sky-500" />
                    <h3 className="text-xl font-black">Booking Velocity</h3>
                </div>
                <BookingTrendsChart data={data.charts?.bookingTrends} />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6 text-slate-800">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-black">Regional Revenue</h3>
                </div>
                <DestinationRevenueChart data={data.charts?.revenueByDestination} />
            </div>
        </section>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <MapPinIcon className="w-7 h-7 text-pink-500" /> Expedition Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.tours.map((tour) => (
                    <div key={tour.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-300 transition group cursor-pointer">
                        <p className="text-xs font-black text-sky-600 mb-1 uppercase tracking-widest">{tour.location}</p>
                        <p className="font-bold text-slate-800 group-hover:text-sky-700">{tour.title}</p>
                        <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                            <span>Departure</span>
                            <span className="text-slate-900">{tour.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}