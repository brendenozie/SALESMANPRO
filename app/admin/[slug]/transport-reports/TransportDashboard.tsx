"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  SignalIcon, 
  ExclamationCircleIcon, 
  BoltIcon,
  ClockIcon, 
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface DashboardProps {
  initialData?: {
    metrics?: {
      activeBuses: string;
      onTimeRate: string;
      avgFuel: string;
      safetyIncidents: string;
      healthRate: string;
    };
    alerts?: Array<{ bus: string; issue: string }>;
    efficiencyData?: number[];
  };
  schoolId: string;
}

const TransportDashboard = ({ initialData, schoolId }: DashboardProps) => {
  // Theme State
  // const [darkMode, setDarkMode] = useState<boolean>(true);

  // Dynamic Clock State
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Core Data State (with defensive fallbacks)
  const [alerts, setAlerts] = useState<Array<{ bus: string; issue: string }>>(
    Array.isArray(initialData?.alerts) ? initialData.alerts : []
  );

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Synchronize Dark Mode Class
  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  // }, [darkMode]);

  // Handle Dynamic Clock Tick
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper for metrics fallback
  const metrics = initialData?.metrics || {
    activeBuses: "14/16",
    onTimeRate: "94.2%",
    avgFuel: "6.8",
    safetyIncidents: "0",
    healthRate: "98.5%"
  };

  const efficiencyData = initialData?.efficiencyData || [65, 80, 45, 90, 70, 85, 95];

  // Action: Acknowledge Alert
  const handleAcknowledgeAlert = (index: number, bus: string) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
    toast.success(`Alert for ${bus} has been acknowledged & routed to maintenance.`);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Decorative Blur Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/5 blur-[150px] rounded-full -z-10 animate-pulse pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Data Sync Active</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fleet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">Command Center.</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            {/* Live Clock Card */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-slate-700 dark:text-slate-300">
              <ClockIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 animate-spin-slow" />
              <span className="text-sm font-mono font-bold tracking-tight">
                {currentTime ? format(currentTime, 'MMM dd, yyyy | hh:mm:ss aa') : 'Syncing clock...'}
              </span>
            </div>

            {/* Light/Dark Toggle */}
            {/* <button 
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Theme Mode"
              className="p-4 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-2xl transition-all shadow-sm"
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>*/}
          </div>
        </header>

        {/* Top Tier Metrics Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Fleet', value: metrics.activeBuses, sub: 'Units currently dispatched', color: 'text-blue-600 dark:text-blue-400' },
            { label: 'On-Time Perf.', value: metrics.onTimeRate, sub: 'Daily trip accuracy', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Avg Fuel Economy', value: `${metrics.avgFuel} km/L`, sub: 'Fleet-wide average', color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Safety Incidents', value: metrics.safetyIncidents, sub: 'Last 30 Days', color: 'text-indigo-600 dark:text-indigo-400' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 p-6 rounded-3xl hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h2 className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-600 mt-1 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Detailed Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Alerts Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 dark:bg-slate-900/20 dark:border-slate-800 rounded-[2rem] p-6 h-full flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <ExclamationCircleIcon className="h-5 w-5 text-rose-500" />
                    Critical Status
                  </h3>
                  <span className={`px-2 py-1 text-[10px] font-black rounded transition-all duration-300 ${
                    alerts.length > 0 
                      ? "bg-rose-500/10 text-rose-500 animate-pulse" 
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}>
                    {alerts.length} ACTIVE
                  </span>
                </div>
                
                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                  {alerts.map((alert, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleAcknowledgeAlert(i, alert.bus)}
                      title="Click to Acknowledge Alert"
                      className="p-4 bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-500/30 rounded-2xl flex items-center justify-between group cursor-pointer transition-all hover:bg-slate-100/50 dark:hover:bg-slate-950/40"
                    >
                      <div>
                        <p className="text-xs font-black text-slate-800 dark:text-white">{alert.bus}</p>
                        <p className="text-[10px] text-rose-500 dark:text-rose-400 uppercase font-bold">{alert.issue}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <SignalIcon className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-rose-500 transition-colors" />
                        <span className="hidden group-hover:inline-flex text-[9px] font-black tracking-wider uppercase text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                          Ack
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {alerts.length === 0 && (
                    <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
                      <ShieldCheckIcon className="h-10 w-10 text-emerald-500" />
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold italic">All fleet units operating within normal safe parameters</p>
                    </div>
                  )}
                </div>
              </div>

              {alerts.length > 0 && (
                <p className="text-[9px] text-slate-400 dark:text-slate-500 italic mt-4 text-center">
                  💡 Click on an active alert card to acknowledge it
                </p>
              )}
            </div>
          </div>

          {/* Efficiency & Health Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200 dark:bg-slate-900/20 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Utilization Trends</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">7-Day Fuel & Distance Correlation</p>
            </div>

            {/* Dynamic Graph Section with Interactive Tooltips */}
            <div className="relative h-48 w-full mt-10 flex items-end justify-between gap-3 px-2">
              {efficiencyData.map((h, i) => (
                <div 
                  key={i} 
                  className="relative flex-grow group flex flex-col items-center"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Floating Value Tooltip */}
                  <div className={`absolute -top-10 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-lg shadow-md transition-all duration-300 pointer-events-none ${
                    hoveredBar === i ? "opacity-100 scale-100 -translate-y-1" : "opacity-0 scale-95 translate-y-2"
                  }`}>
                    {h}% Efficiency
                  </div>

                  {/* Graph Bar */}
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer ${
                      hoveredBar === i 
                        ? "bg-gradient-to-t from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 brightness-110" 
                        : "bg-gradient-to-t from-blue-600/80 to-indigo-400/80 dark:from-blue-600/40 dark:to-indigo-400/30"
                    }`} 
                    style={{ height: `${h}%` }}
                  />
                  <p className={`mt-3 text-[10px] font-bold italic font-mono transition-colors ${
                    hoveredBar === i ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400 dark:text-slate-600"
                  }`}>
                    D-{i+1}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Meta-Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-2xl">
                <div className="p-3 bg-emerald-500/10 rounded-xl shrink-0">
                  <ShieldCheckIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Fleet Health</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{metrics.healthRate} Operational</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-2xl">
                <div className="p-3 bg-amber-500/10 rounded-xl shrink-0">
                  <BoltIcon className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Energy Index</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Optimal Range Achieved</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default TransportDashboard;