"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic'; // Required for ApexCharts in Next.js
import type { ApexOptions } from 'apexcharts';
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

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";

// --- APEX CHART COMPONENTS ---

const ProjectViewsChart: React.FC<{ data: { month: string; views: number }[] }> = ({ data }) => {
  const series = [{ name: "Project Views", data: data.map(d => d.views) }];

  const options: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
    colors: ['#06b6d4'],
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: data.map(d => d.month),
      labels: { style: { colors: '#9ca3af' } }
    },
    tooltip: { theme: 'dark' }
  };

  return <Chart options={options} series={series} type="area" height={300} />;
};


const InquiriesTrendChart: React.FC<{ data: { month: string; count: number }[] }> = ({ data }) => {
  const series = [{ name: "Inquiries", data: data.map(d => d.count) }];

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    colors: ['#d946ef'],
    xaxis: {
      categories: data.map(d => d.month),
      labels: { style: { colors: '#9ca3af' } }
    },
    tooltip: { theme: 'dark' }
  };

  return <Chart options={options} series={series} type="bar" height={300} />;
};



// --- TYPE DEFINITIONS ---

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

export interface PortfolioDashboardData {
  metrics: {
    totalProjects: number;
    totalSkills: number;
    testimonials: number;
    inquiriesThisMonth: number;
    upcomingMeetings: number;
  };
  tasks: Task[];
  charts: {
    monthlyProjectViews: { month: string; views: number }[];
    inquiriesTrend: { month: string; count: number }[];
  };
}


// --- MAIN COMPONENT ---

type Props = PortfolioDashboardData & {
  slug?: string;
};

export default function PortfolioDashboardClient({
  metrics,
  tasks,
  charts,
  slug: companyId,
}: Props) {

  // 
  // const { slug: companyId } = useParams();


  // const cards = [
  //   { title: 'Total Projects', value: metrics.totalProjects, icon: BriefcaseIcon, accent: 'border-cyan-500 text-cyan-500' },
  //   { title: 'Core Skills', value: metrics.totalSkills, icon: LightBulbIcon, accent: 'border-amber-500 text-amber-500' },
  //   { title: 'Client Testimonials', value: metrics.testimonials, icon: UserCircleIcon, accent: 'border-green-500 text-green-500' },
  //   { title: 'Inquiries (MoM)', value: metrics.inquiriesThisMonth, icon: ChatBubbleLeftRightIcon, accent: 'border-fuchsia-500 text-fuchsia-500' },
  //   { title: 'Upcoming Meetings', value: metrics.upcomingMeetings, icon: CalendarDaysIcon, accent: 'border-blue-500 text-blue-500' },
  // ];

  const cards = [
    { title: 'Total Projects', value: metrics.totalProjects, icon: BriefcaseIcon, accent: 'border-cyan-500 text-cyan-500', link: `/admin/${companyId}/projects`, description: 'Your body of work.' },
    { title: 'Core Skills', value: metrics.totalSkills, icon: LightBulbIcon, accent: 'border-amber-500 text-amber-500', link: `/admin/${companyId}/skills`, description: 'Defined competencies.' },
    { title: 'Client Testimonials', value: metrics.testimonials, icon: UserCircleIcon, accent: 'border-green-500 text-green-500', link: `/admin/${companyId}/testimonials`, description: 'Positive feedback score.' },
    { title: 'Inquiries (MoM)', value: metrics.inquiriesThisMonth, icon: ChatBubbleLeftRightIcon, accent: 'border-fuchsia-500 text-fuchsia-500', link: `/admin/${companyId}/inquiries`, description: 'Leads generated this month.'},
    { title: 'Upcoming Meetings', value: metrics.upcomingMeetings, icon: CalendarDaysIcon, accent: 'border-blue-500 text-blue-500', link: `/admin/${companyId}/calendar`, description: 'Scheduled this week.' },
  ];


  // Component for visually appealing metric cards
  const MetricCard: React.FC<{ card: (typeof cards)[0] }> = useCallback(({ card, }) => (
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

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
  //       <div className="animate-pulse flex items-center gap-3">
  //         <RocketLaunchIcon className="w-6 h-6 text-cyan-400" />
  //         <span className="text-xl font-semibold">Loading Personal Command Console...</span>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error || !data) {
  //    return (
  //     <div className="min-h-screen flex items-center justify-center bg-red-900/10 text-red-400">
  //       <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg">
  //           <ExclamationTriangleIcon className="w-10 h-10 mx-auto mb-4 text-red-500" />
  //           <h2 className="font-bold text-lg text-white mb-2">Could Not Load Dashboard</h2>
  //           <p className="text-sm text-gray-400">{error || "An unknown error occurred."}</p>
  //       </div>
  //     </div>
  //   );
  // }

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
              href={`/admin/${companyId}/settings`}
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
            {/* <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border-t-4 border-cyan-600">
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
            </div> */}
            {/* Functional Apex Area Chart */}
            <div className="bg-gray-800 p-6 rounded-2xl border-t-4 border-cyan-600">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BriefcaseIcon className="w-6 h-6 text-cyan-400" /> Project Engagement
              </h3>
              <ProjectViewsChart data={charts.monthlyProjectViews} />
            </div>

            {/* Functional Apex Bar Chart */}
            <div className="bg-gray-800 p-6 rounded-2xl border-t-4 border-fuchsia-600">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-fuchsia-400" /> Inquiries Trend
              </h3>
              <InquiriesTrendChart data={charts.inquiriesTrend} />
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
                {tasks.map((t) => (
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
              
              {tasks.length === 0 && (
                 <div className="py-6 text-center text-gray-500">No urgent tasks due today. Focus on strategy!</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}