"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { format, parseISO } from "date-fns";
import { 
  CheckBadgeIcon, 
  ClockIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  PresentationChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/solid";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

// --- Types & Constants ---
type Target = {
  id: string;
  salesAgent: { name: string };
  product: { name: string };
  targetValue: number;
  achievedValue: number;
  status: "Achieved" | "Pending" | "Failed";
  startDate: string;
  endDate: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";


interface TargetsProps {
  companyId: string;
}


const TargetsClient: React.FC<TargetsProps> = ({ companyId }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/admin/targets?companyId=${companyId}`);
        const result = await response.json();
        
        setTargets(result.data || []);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  // Compute High-Level Stats
  const stats = useMemo(() => {
    const totalTarget = targets.reduce((acc, t) => acc + t.targetValue, 0);
    const totalAchieved = targets.reduce((acc, t) => acc + t.achievedValue, 0);
    const avgProgress = targets.length ? (totalAchieved / totalTarget) * 100 : 0;
    return { totalTarget, totalAchieved, avgProgress };
  }, [targets]);

  const chartData = {
    labels: targets.map((t) => t.salesAgent.name),
    datasets: [
      {
        label: "Achieved",
        data: targets.map((t) => t.achievedValue),
        backgroundColor: "rgba(99, 102, 241, 0.8)", // Indigo
        borderRadius: 6,
      },
      {
        label: "Target",
        data: targets.map((t) => t.targetValue),
        backgroundColor: "rgba(226, 232, 240, 0.8)", // Slate
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <ArrowPathIcon className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Loading Performance Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Performance Dashboard</h1>
            <p className="text-slate-500 mt-1">Track and manage sales targets across your team.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Export PDF
            </button>
            <button className="px-4 py-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-200 text-sm font-semibold text-white hover:bg-indigo-700 transition">
              Set New Target
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Volume" value={`$${stats.totalTarget.toLocaleString()}`} icon={<CurrencyDollarIcon className="w-6 h-6 text-indigo-600"/>} color="bg-indigo-50" />
          <StatCard title="Total Achieved" value={`$${stats.totalAchieved.toLocaleString()}`} icon={<PresentationChartBarIcon className="w-6 h-6 text-emerald-600"/>} color="bg-emerald-50" />
          <StatCard title="Avg. Completion" value={`${stats.avgProgress.toFixed(1)}%`} icon={<UserGroupIcon className="w-6 h-6 text-amber-600"/>} color="bg-amber-50" />
        </div>

        {/* Chart Section */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800">Agent Comparison</h2>
            <select className="text-sm border-none bg-slate-100 rounded-md focus:ring-0">
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[350px]">
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { border: { display: false }, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
              }} 
            />
          </div>
        </section>

        {/* Targets Grid */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Detailed Targets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {targets.map((target) => (
            <TargetCard key={target.id} target={target} />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition hover:shadow-md">
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const TargetCard = ({ target }: { target: any }) => {
  const progress = (target.achievedValue / target.targetValue) * 100;
  
  // Format based on TargetType from schema
  const formatValue = (val: number) => {
    return target.targetType === "COST" || target.targetType === "REVENUE"
      ? `$${val.toLocaleString()}`
      : `${val.toLocaleString()} Units`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:border-indigo-200 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {target.salesAgent.name}
          </h3>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {target.product.name}
          </p>
        </div>
        <StatusBadge status={target.status} />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">
            {target.targetType} Progress
          </span>
          <span className="font-bold text-slate-900">{progress.toFixed(0)}%</span>
        </div>
        
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              progress >= 100 ? "bg-emerald-500" : progress >= 50 ? "bg-indigo-500" : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Target Goal</p>
            <p className="text-sm font-bold text-slate-700">{formatValue(target.targetValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Achieved</p>
            <p className="text-sm font-bold text-emerald-600">{formatValue(target.achievedValue)}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-400">
          <ClockIcon className="w-4 h-4" />
          <p className="text-[11px] font-bold">Expires {format(parseISO(target.endDate), "MMM dd, yyyy")}</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Achieved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Failed: "bg-rose-50 text-rose-700 border-rose-100",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
};

export default TargetsClient;