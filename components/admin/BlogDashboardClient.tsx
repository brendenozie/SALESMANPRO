"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import {
  PencilSquareIcon,
  FolderOpenIcon,
  UserGroupIcon,
  EyeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// Prevent SSR issues with ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */



export interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

export interface DashboardData {
  metrics: {
    totalPosts: number;
    totalCategories: number;
    subscribers: number;
    monthlyViews: number;
    scheduledPosts: number;
  };
  tasks: Task[];
  charts: {
    trafficOverview: {
      labels: string[];
      values: number[];
    };
    engagementMetrics: {
      labels: string[];
      likes: number[];
      comments: number[];
    };
  };
}

type Props = DashboardData & {
  slug?: string;
};

/* -------------------------------------------------------------------------- */
/*                              CHART COMPONENTS                              */
/* -------------------------------------------------------------------------- */


const TrafficChart: React.FC<{ labels: string[]; values: number[] }> = ({
  labels,
  values,
}) => {
  const series = [{ name: "Page Views", data: values }];

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#0d9488"],
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0.1 },
    },
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    xaxis: { categories: labels },
    grid: { borderColor: "#f1f5f9" },
  };

  return <Chart options={options} series={series} type="area" height={300} />;
};


const EngagementChart: React.FC<{
  labels: string[];
  likes: number[];
  comments: number[];
}> = ({ labels, likes, comments }) => {
  const series = [
    { name: "Likes", data: likes },
    { name: "Comments", data: comments },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar", // ✅ now properly typed
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "40%",
      },
    },
    colors: ["#0ea5e9", "#f43f5e"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: labels,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    grid: {
      borderColor: "#f1f5f9",
    },
  };

  return <Chart options={options} series={series} type="bar" height={300} />;
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function BlogDashboardClient({
  metrics,
  tasks,
  charts,
}: Props) {
  const cards = [
    {
      title: "Library",
      value: metrics.totalPosts,
      icon: PencilSquareIcon,
      accent: "text-teal-600",
    },
    {
      title: "Taxonomy",
      value: metrics.totalCategories,
      icon: FolderOpenIcon,
      accent: "text-blue-600",
    },
    {
      title: "Audience",
      value: metrics.subscribers.toLocaleString(),
      icon: UserGroupIcon,
      accent: "text-indigo-600",
    },
    {
      title: "Reach",
      value: metrics.monthlyViews.toLocaleString(),
      icon: EyeIcon,
      accent: "text-amber-600",
    },
    {
      title: "Pipeline",
      value: metrics.scheduledPosts,
      icon: CalendarDaysIcon,
      accent: "text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFF] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900">
              Editorial <span className="text-teal-600">Console</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Manage content velocity and audience growth.
            </p>
          </div>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:bg-teal-700 transition flex items-center gap-2">
            <PencilSquareIcon className="w-5 h-5" /> New Masterpiece
          </button>
        </header>

        {/* Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-opacity-10 ${card.accent.replace(
                  "text-",
                  "bg-"
                )} ${card.accent}`}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {card.value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {card.title}
              </p>
            </div>
          ))}
        </section>

        {/* Charts + Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <EyeIcon className="w-6 h-6 text-teal-500" />
                Readers over Time
              </h3>
              <TrafficChart
                labels={charts.trafficOverview.labels}
                values={charts.trafficOverview.values}
              />
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6 text-sky-500" />
                Interaction Density
              </h3>
              <EngagementChart
                labels={charts.engagementMetrics.labels}
                likes={charts.engagementMetrics.likes}
                comments={charts.engagementMetrics.comments}
              />
            </div>
          </div>

          {/* Tasks */}
          <aside className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Editorial Queue</h3>
                <CheckIcon className="w-6 h-6 text-teal-400" />
              </div>

              <div className="space-y-4">
                {tasks.length === 0 && (
                  <p className="text-slate-400 italic text-sm">
                    Queue is empty.
                  </p>
                )}

                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <p className="font-bold text-sm">{task.name}</p>
                    <div className="flex items-center text-[10px] font-bold text-teal-400 uppercase">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {task.dueTime} • {task.dueDate}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition">
                View Full Calendar
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
