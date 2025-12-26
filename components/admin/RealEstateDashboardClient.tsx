"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  BuildingOfficeIcon,
  UsersIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

// Dynamic import for ApexCharts to prevent SSR errors
const Chart = dynamic(() => import("react-apexcharts"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-50 animate-pulse rounded-xl" />
});

/* -------------------- TYPES -------------------- */
interface Session {
    user: { name: string; email: string; }
}

export interface Task {
  id: string;
  name: string;
  dueTime: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface RealEstateDashboardData {
  metrics: {
    totalProperties: number;
    totalAgents: number;
    totalClients: number;
    revenueThisMonth: number;
    appointmentsToday: number;
  };
  tasks: Task[];
  salesData: ChartData[];
  acquisitionData: ChartData[];
}

type Props = RealEstateDashboardData & {
  slug?: string;
};

/* -------------------- COMPONENT -------------------- */

export default function RealEstateDashboardClient({
  metrics,
  tasks,
  salesData = [],
  acquisitionData = [],
  slug: companyId,
}: Props) {
  
  const session: Session = { user: { name: "", email: "bl@agency.com" } };

  // 1. Sales Pipeline Config (Area Chart)
  const salesChartConfig = {
    series: [{
      name: "Revenue",
      data: salesData.map(d => d.value)
    }],
    options: {
      chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
      colors: ["#0d9488"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] }
      },
      xaxis: {
        categories: salesData.map(d => d.name),
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { labels: { formatter: (val: number) => `$${(val / 1000).toFixed(0)}k` } },
      grid: { borderColor: "#f1f1f1" },
      tooltip: { theme: "light" }
    } as any
  };

  // 2. Acquisition Funnel Config (Bar Chart)
  const funnelChartConfig = {
    series: [{
      name: "Total",
      data: acquisitionData.map(d => d.value)
    }],
    options: {
      chart: { type: "bar", toolbar: { show: false } },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: true,
          distributed: true, // Different colors per bar
          barHeight: "60%",
        }
      },
      colors: ["#0d9488", "#14b8a6", "#2dd4bf", "#99f6e4"],
      dataLabels: { enabled: true, formatter: (val: any) => val.toLocaleString() },
      xaxis: {
        categories: acquisitionData.map(d => d.name),
      },
      legend: { show: false },
      grid: { show: false }
    } as any
  };

  const cards = useMemo(() => [
    { title: "Active Properties", value: metrics.totalProperties, icon: BuildingOfficeIcon, accent: "teal", link: "/admin/properties" },
    { title: "Active Agents", value: metrics.totalAgents, icon: UsersIcon, accent: "blue", link: "/admin/agents" },
    { title: "Total Clients", value: metrics.totalClients, icon: HomeIcon, accent: "indigo", link: "/admin/clients" },
  ], [metrics]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="mb-10 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border-l-8 border-teal-600">
          <p className="text-base text-gray-500">Welcome back, {session.user.name.split(' ')[0]}</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">Command <span className="text-teal-600">Center</span></h1>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            <a href="/admin/reports" className="col-span-1 lg:col-span-2 p-6 rounded-2xl bg-teal-600 text-white shadow-2xl transition duration-300 hover:bg-teal-700 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4"><CurrencyDollarIcon className="w-10 h-10 text-white opacity-90" /><span className="text-lg font-semibold uppercase opacity-90">Revenue This Month</span></div>
                <h2 className="text-5xl sm:text-6xl font-black leading-tight">${metrics.revenueThisMonth.toLocaleString()}</h2>
                <p className="mt-2 text-sm opacity-80">Targeting Q4 closing goals. Click for full finance report.</p>
            </a>
            <a href="/admin/appointments" className="col-span-1 p-6 rounded-2xl bg-orange-500 text-white shadow-xl transition duration-300 hover:bg-orange-600 flex flex-col justify-between">
                 <div className="flex items-center justify-between mb-4"><CalendarDaysIcon className="w-10 h-10 text-white opacity-90" /><span className="text-lg font-semibold uppercase opacity-90">Appointments Today</span></div>
                <h2 className="text-5xl font-black leading-tight">{metrics.appointmentsToday}</h2>
                <p className="mt-2 text-sm opacity-80">Number of showing and consultation bookings.</p>
            </a>
        </section>
        
        {/* HEADER */}
        {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Broker <span className="text-teal-600">Command</span>
            </h1>
            <p className="text-gray-500">Overview for {companyId || "Primary Office"}</p>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-white border rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-50">Export Report</button>
             <button className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-teal-700">Add Property</button>
          </div>
        </div> */}

        {/* TOP STATS */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-teal-600 rounded-3xl p-8 text-white flex justify-between items-center shadow-xl shadow-teal-900/10">
            <div>
              <p className="text-teal-100 text-sm font-medium uppercase tracking-wider">Monthly Revenue</p>
              <h2 className="text-5xl font-black mt-1">${metrics.revenueThisMonth.toLocaleString()}</h2>
            </div>
            <CurrencyDollarIcon className="w-20 h-20 text-teal-500/50" />
          </div>
          <div className="bg-orange-500 rounded-3xl p-8 text-white shadow-xl shadow-orange-900/10">
            <p className="text-orange-100 text-sm font-medium uppercase tracking-wider">Appointments</p>
            <h2 className="text-5xl font-black mt-1">{metrics.appointmentsToday}</h2>
            <p className="text-orange-100 text-sm mt-2 flex items-center gap-1"><ClockIcon className="w-4 h-4"/> Next: 2:00 PM</p>
          </div>
        </div> */}

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* STAT CARDS & SALES CHART */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div key={card.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-${card.accent}-50 text-${card.accent}-600`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6">Revenue Growth</h3>
              <Chart options={salesChartConfig.options} series={salesChartConfig.series} type="area" height={300} />
            </div>
          </div>

          {/* SIDEBAR: TASKS & FUNNEL */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-orange-500" /> Focus Today
                </h3>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {tasks.length} Left
                </span>
              </div>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-xl border-l-4 border-orange-400 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">{task.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{task.dueTime}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6">Lead Pipeline</h3>
              <Chart options={funnelChartConfig.options} series={funnelChartConfig.series} type="bar" height={250} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}