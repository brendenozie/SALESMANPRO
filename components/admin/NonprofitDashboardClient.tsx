"use client";

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
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

// Dynamically import ApexCharts to ensure it only runs on the client
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- FUNCTIONAL APEX CHART COMPONENTS ---

const DonationTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  const series = [{
    name: "Donations ($)",
    data: data?.map(d => d.amount || d.value) || []
  }];

  const options: any = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
      dropShadow: { enabled: true, top: 3, left: 2, blur: 4, opacity: 0.1 }
    },
    colors: ['#ea580c'], // orange-600
    stroke: { curve: 'smooth', width: 4 },
    markers: { size: 4, colors: ['#ea580c'], strokeWidth: 2, hover: { size: 7 } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    xaxis: {
      categories: data?.map(d => d.month || d.name) || [],
      labels: { style: { colors: '#64748b', fontWeight: 500 } },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: { 
        style: { colors: '#64748b' },
        formatter: (val: number) => `$${val.toLocaleString()}`
      }
    },
    tooltip: { theme: 'light', y: { formatter: (val: number) => `$${val.toLocaleString()}` } }
  };

  return <Chart options={options} series={series} type="line" height={300} />;
};

const VolunteerGrowthChart: React.FC<{ data: any[] }> = ({ data }) => {
  const series = [{
    name: "New Volunteers",
    data: data?.map(d => d.count || d.value) || []
  }];

  const options: any = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '60%',
        distributed: true,
        dataLabels: { position: 'top' }
      }
    },
    colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'], // blues
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { fontSize: '12px', colors: ["#334155"] }
    },
    xaxis: {
      categories: data?.map(d => d.period || d.name) || [],
      labels: { style: { colors: '#64748b' } },
      axisBorder: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    legend: { show: false },
    tooltip: { theme: 'light' }
  };

  return <Chart options={options} series={series} type="bar" height={300} />;
};

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
    monthlyDonations: any[];
    volunteerGrowth: any[];
  }
}

// --- MAIN COMPONENT ---

export default function NonprofitDashboardClient() {
  const { slug: companyId } = useParams();
  const [data, setData] = useState<NonprofitDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/dashboard/nonprofit/${companyId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.data?.message || 'Failed to fetch');
        setData(result.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [companyId]);

  const cards = data ? [
    { title: 'Total Donations', value: `$${data.metrics.totalDonations.toLocaleString()}`, icon: GiftIcon, color: 'text-orange-600 border-orange-400 bg-orange-50', link: '/admin/donations', description: 'Funds raised year-to-date.' },
    { title: 'Active Campaigns', value: data.metrics.activeCampaigns, icon: MegaphoneIcon, color: 'text-fuchsia-600 border-fuchsia-400 bg-fuchsia-50', link: '/admin/campaigns', description: 'Currently running projects.' },
    { title: 'Total Volunteers', value: data.metrics.totalVolunteers, icon: UsersIcon, color: 'text-indigo-600 border-indigo-400 bg-indigo-50', link: '/admin/volunteers', description: 'Our community of helpers.' },
    { title: 'Upcoming Events', value: data.metrics.upcomingEvents, icon: CalendarDaysIcon, color: 'text-green-600 border-green-400 bg-green-50', link: '/admin/events', description: 'Scheduled this quarter.' },
  ] : [];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-orange-600 font-bold">
       <RocketLaunchIcon className="w-6 h-6 animate-bounce mr-2" /> Loading Impact Console...
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      <ExclamationTriangleIcon className="w-10 h-10 mr-2" /> {error || "Error loading dashboard"}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        <header className="mb-10 p-8 rounded-3xl shadow-xl" style={{ backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #030712 100%)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-xl text-orange-400 font-semibold mb-1">Empowering Change</p>
              <h1 className="text-5xl font-extrabold tracking-tight text-white">Impact Command Center</h1>
              <p className="mt-2 text-indigo-200">Coordination hub for {companyId}</p>
            </div>
            <button className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2">
              <HeartIcon className="w-5 h-5" /> Launch New Appeal
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <div key={card.title} className={`p-6 rounded-2xl bg-white shadow-md border-t-8 ${card.color.split(' ')[1]} transition hover:scale-[1.02]`}>
              <div className={`w-12 h-12 rounded-full ${card.color.split(' ')[2]} flex items-center justify-center mb-4`}>
                <card.icon className={`w-6 h-6 ${card.color.split(' ')[0]}`} />
              </div>
              <p className="text-3xl font-black text-gray-900">{card.value}</p>
              <h2 className="font-bold text-gray-600">{card.title}</h2>
              <p className="text-xs text-gray-400 mt-1">{card.description}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <GiftIcon className="w-6 h-6 text-orange-500" /> Donation Trajectory
              </h3>
              <DonationTrendChart data={data.charts.monthlyDonations} />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UsersIcon className="w-6 h-6 text-blue-500" /> Volunteer Enrollment
              </h3>
              <VolunteerGrowthChart data={data.charts.volunteerGrowth} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BoltIcon className="w-6 h-6 text-orange-500" /> Urgent Tasks
              </h3>
              <div className="space-y-4">
                {data.tasks.map(t => (
                  <div key={t.id} className="p-4 bg-gray-50 rounded-xl border-l-4 border-orange-500 hover:bg-orange-50 transition">
                    <p className="font-bold text-gray-800">{t.name}</p>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{t.dueDate}</span>
                      <span>{t.dueTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}