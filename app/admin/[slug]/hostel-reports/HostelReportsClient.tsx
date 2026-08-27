"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  WrenchScrewdriverIcon, 
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
  InboxIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

interface WingData {
  label: string;
  val: number;
  color: string;
}

interface AnalyticsData {
  occupancy: string | number;
  revenue: string | number;
  mttr: string | number;
  visitors: string | number;
  wingData?: WingData[];
}

interface Props {
  schoolId: string;
}

const HostelReportsClient = ({ schoolId }: Props) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Synchronize structural layout theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/admin/hostel/analytics?companyId=${schoolId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json.data || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          toast.error("Error generating live intelligence reports");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  const handleExport = () => {
    if (!data) {
      toast.error("No active metrics data to compile");
      return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Occupancy,${data.occupancy || "N/A"}\n`
      + `MTTR,${data.mttr || "N/A"}\n`
      + `Visitors,${data.visitors || "N/A"}\n`
      + `Revenue Target,${data.revenue || "N/A"}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hostel_report_${schoolId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Report compiled and dispatched");
  };

  // Compile fallbacks for KPI widgets
  const kpis = useMemo(() => {
    if (!data) return [];
    return [
      { 
        label: "Avg Occupancy", 
        value: data.occupancy ?? "0%", 
        delta: "+2.1%", 
        icon: UsersIcon, 
        color: "text-indigo-650 dark:text-indigo-400",
        bgColor: "bg-indigo-50 dark:bg-indigo-950/20"
      },
      { 
        label: "Revenue Realized", 
        value: data.revenue ?? "KSh 0", 
        delta: "98%", 
        icon: CurrencyDollarIcon, 
        color: "text-emerald-650 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/20"
      },
      { 
        label: "MTTR (Repair Time)", 
        value: data.mttr ?? "0 hrs", 
        delta: "-12%", 
        icon: WrenchScrewdriverIcon, 
        color: "text-rose-650 dark:text-rose-400",
        bgColor: "bg-rose-50 dark:bg-rose-950/20"
      },
      { 
        label: "Visitor Volume", 
        value: data.visitors ?? "0", 
        delta: "Weekly", 
        icon: ChartBarIcon, 
        color: "text-blue-650 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950/20"
      },
    ];
  }, [data]);

  // Fallback layout when wing distribution list is omitted
  const activeWingData = useMemo(() => {
    return data?.wingData || [
      { label: "North Wing (Men)", val: 92, color: "bg-indigo-600 dark:bg-indigo-500" },
      { label: "South Wing (Women)", val: 88, color: "bg-violet-600 dark:bg-violet-500" },
      { label: "Executive Spaces", val: 45, color: "bg-slate-650 dark:bg-slate-500" },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] flex flex-col items-center justify-center p-8 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-indigo-600 dark:border-indigo-450 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500 animate-pulse">
            Calculating Intelligence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 p-4 md:p-8 lg:p-12 font-sans transition-colors duration-200">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: darkMode ? "#0f172a" : "#ffffff",
            color: darkMode ? "#f1f5f9" : "#0f172a",
            border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "1rem",
            fontSize: "12px",
            fontWeight: "bold"
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Actions Utilities Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Operational Metrics
            </span>
          </div>
          
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-all shadow-sm"
            aria-label="Toggle structural theme layout"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button> */}
        </div>

        {/* Master Action Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-indigo-650 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Data & Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Hostel Analytics
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm font-medium">
              Real-time audit performance, structural space allocation, and maintenance response timelines.
            </p>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <button className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all font-bold text-xs uppercase tracking-wide flex-1 lg:flex-none">
              <CalendarDaysIcon className="h-4 w-4" /> Last 30 Days
            </button>
            <button 
              onClick={handleExport}  
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex-1 lg:flex-none"
            >
              <ArrowDownTrayIcon className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </header>

        {/* Top-Level KPI Summary Cards */}
        {kpis.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((stat, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl group hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-all shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">{stat.delta}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-1.5">{stat.value}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <InboxIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-400">Failed to render active KPIs</p>
          </div>
        )}

        {/* Detailed Analysis Segment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Monthly Realization Dynamic Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                Monthly Fee Realization
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase">Target (Expected)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase">Realized (Collected)</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-3 md:gap-5 px-2">
              {[60, 45, 90, 75, 85, 95, 100].map((h, i) => (
                <div key={i} className="flex-grow flex flex-col items-center gap-3 group h-full justify-end">
                  <div className="w-full flex items-end gap-1 h-full max-w-[45px]">
                    {/* Expected Background representation bar */}
                    <div 
                      className="flex-grow bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-t-lg transition-all group-hover:bg-slate-200 dark:group-hover:bg-slate-800" 
                      style={{ height: "100%" }} 
                    />
                    {/* Realized Value presentation bar */}
                    <div 
                      className="flex-grow bg-emerald-500 rounded-t-lg" 
                      style={{ height: `${h}%` }} 
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 whitespace-nowrap">Week {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy Structural Breakdown Wing distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">
                Structural Space Distribution
              </h3>
              <div className="space-y-6">
                {activeWingData.map((wing, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-450 dark:text-slate-400 uppercase tracking-tight font-semibold text-[11px]">{wing.label}</span>
                      <span className="text-slate-900 dark:text-white">{wing.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${wing.color} rounded-full transition-all duration-1000`} 
                        style={{ width: `${wing.val}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/20 rounded-xl">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">Suggestion Note:</span> North Wing is currently operating near maximum limit. Space management suggests temporary bed reallocations ahead of the semester rush.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default HostelReportsClient;