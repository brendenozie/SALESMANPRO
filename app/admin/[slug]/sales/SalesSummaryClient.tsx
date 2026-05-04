"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  ScriptableContext
} from "chart.js";
import { format, parseISO } from "date-fns";
import { 
  PresentationChartLineIcon, 
  CalendarDaysIcon, 
  ArrowTrendingUpIcon, 
  BanknotesIcon,
  TagIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

export type Sale = {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  totalAmount: number;
  region: string;
  date: string;
};

interface ClientProps {
  initialSales: Sale[];
}

const SalesSummaryClient: React.FC<ClientProps> = ({ initialSales }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const filteredSales = useMemo(() => {
    if (!startDate || !endDate) return initialSales;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return initialSales.filter((sale) => {
      const saleDate = parseISO(sale.date);
      return saleDate >= start && saleDate <= end;
    });
  }, [startDate, endDate, initialSales]);

  const stats = useMemo(() => ({
    totalSales: filteredSales.length,
    revenue: filteredSales.reduce((sum, s) => sum + s.totalAmount, 0),
    avgOrder: filteredSales.length ? filteredSales.reduce((sum, s) => sum + s.totalAmount, 0) / filteredSales.length : 0,
    topRegion: [...new Set(filteredSales.map(s => s.region))].sort((a,b) => 
      filteredSales.filter(v => v.region === b).length - filteredSales.filter(v => v.region === a).length
    )[0] || "N/A"
  }), [filteredSales]);

  const lineChartData = useMemo(() => {
    // Group sales by date and sum revenue
    const dailyRevenue: Record<string, number> = {};
    
    filteredSales.forEach(sale => {
      const day = format(parseISO(sale.date), "MMM dd");
      dailyRevenue[day] = (dailyRevenue[day] || 0) + sale.totalAmount;
    });

    const sortedLabels = Object.keys(dailyRevenue).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: sortedLabels,
      datasets: [
        {
          label: "Daily Revenue",
          data: sortedLabels.map(label => dailyRevenue[label]),
          fill: true,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          pointRadius: 4,
        },
      ],
    };
  }, [filteredSales]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <span className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <PresentationChartLineIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </span>
              Sales <span className="text-indigo-600 dark:text-indigo-400">Intelligence</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Data-driven performance insights at a glance.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-slate-800">
              <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold focus:ring-0 text-slate-600 dark:text-slate-300"
              />
            </div>
            <div className="flex items-center gap-2 px-3">
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold focus:ring-0 text-slate-600 dark:text-slate-300"
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <HighlightCard title="Gross Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={BanknotesIcon} trend="+12.5%" color="emerald" />
          <HighlightCard title="Total Orders" value={stats.totalSales} icon={ArrowTrendingUpIcon} trend="+4.2%" color="indigo" />
          <HighlightCard title="Avg. Ticket" value={`$${stats.avgOrder.toFixed(2)}`} icon={TagIcon} color="amber" />
          <HighlightCard title="Top Region" value={stats.topRegion} icon={MapPinIcon} color="purple" />
        </div>

        {/* Main Chart Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue Stream</h2>
              <span className="px-4 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase">Live Trend</span>
            </div>
            <div className="h-[350px] w-full">
              <Line 
                data={lineChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { 
                      grid: { display: true, color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8', font: { weight: 'bold' } }
                    },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: 'bold' } } }
                  }
                }} 
              />
            </div>
          </div>

          {/* Side Performance List */}
          <div className="bg-slate-900 dark:bg-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-xl font-black uppercase mb-6 tracking-tight">Recent Activity</h2>
              <div className="space-y-6">
                {filteredSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center group/item cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover/item:bg-white/20 transition-colors">
                        <span className="text-xs font-black">{sale.productName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate w-32">{sale.productName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{sale.region}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-emerald-400">+${sale.totalAmount}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black transition-all border border-white/10 uppercase tracking-widest">
                Export Full Report
              </button>
            </div>
            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-indigo-500/20 blur-3xl rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const HighlightCard = ({ title, value, icon: Icon, trend, color }: any) => {
  const themes: any = {
    emerald: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
    amber: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-600 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg hover:-translate-y-1 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${themes[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{trend}</span>}
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
    </div>
  );
};

export default SalesSummaryClient;