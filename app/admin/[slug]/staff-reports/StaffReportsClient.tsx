"use client";

import React, { useEffect, useState } from "react";
import { 
  ChartPieIcon, 
  ArrowTrendingUpIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  SunIcon,
  MoonIcon,
  ArrowPathIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

interface DepartmentData {
  dept: string;
  val: number;
  raw: number;
  color?: string;
}

interface ReportMetrics {
  retentionRate: number;
  monthlyPayroll: number;
  attendanceRate?: number;
  diversityIndex?: number;
}

interface ReportData {
  metrics: ReportMetrics;
  departments: DepartmentData[];
}

interface StaffReportsClientProps {
  companyId: string;
}

const StaffReportsClient = ({ companyId }: StaffReportsClientProps) => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronize visual themes with systemic class configurations
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/reports?companyId=${companyId}`);
      const json = await res.json();
      setData(json.data || json);
    } catch (err) {
      console.error("Failed to fetch workforce analytics", err);
      toast.error("Failed to load HR reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [companyId]);

  const handleRefresh = async () => {
    setIsSyncing(true);
    await fetchAnalytics();
    setIsSyncing(false);
    toast.success("Workforce analytics synchronized");
  };

  const handleExport = () => {
    if (!data || !data.departments) {
      toast.error("No raw data available to export");
      return;
    }
    try {
      const headers = "Department,Cost,ValueMetric\n";
      const rows = data.departments
        .map((d) => `"${d.dept}",${d.raw || d.val},${d.val}`)
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `HR_Intelligence_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Institutional CSV dossier exported");
    } catch (error) {
      toast.error("Export operation failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] flex items-center justify-center transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <ArrowPathIcon className="h-10 w-10 text-cyan-600 dark:text-cyan-400 animate-spin stroke-[2]" />
          <p className="text-cyan-600 dark:text-cyan-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
            Aggregating Institutional Data...
          </p>
        </div>
      </div>
    );
  }

  // Fallback defaults if metrics are missing from response objects
  const retention = data?.metrics?.retentionRate ?? 91.4;
  const payroll = data?.metrics?.monthlyPayroll ? (data.metrics.monthlyPayroll / 1000).toFixed(1) : "142.5";
  const attendance = data?.metrics?.attendanceRate ?? 96.2;
  const diversity = data?.metrics?.diversityIndex ?? 0.78;

  // Use dynamic department data or load fallback structural departments
  const rawDeptList = data?.departments && data.departments.length > 0 
    ? data.departments 
    : [
        { dept: "Science", val: 95, raw: 95000 },
        { dept: "Mathematics", val: 70, raw: 70000 },
        { dept: "IT & CS", val: 85, raw: 85000 },
        { dept: "Administration", val: 60, raw: 60000 },
        { dept: "Arts & Lang", val: 45, raw: 45000 },
        { dept: "Sports Unit", val: 30, raw: 30000 }
      ];

  // Colors dictionary mapping fallback bars to simple styling arrays without gradients
  const colorMap = ["bg-cyan-500", "bg-blue-500", "bg-indigo-500", "bg-slate-400 dark:bg-slate-600", "bg-sky-400", "bg-cyan-600"];
  const formattedDepts = rawDeptList.map((item, index) => ({
    ...item,
    color: colorMap[index % colorMap.length]
  }));

  const maxVal = Math.max(...formattedDepts.map((d) => d.val), 1);

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
        
        {/* Top Control Rail */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Institutional Intelligence Reporting
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 text-slate-500 hover:text-slate-850 dark:hover:text-white transition-all shadow-sm"
              title="Refresh ledger state"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? "animate-spin text-cyan-500" : ""}`} />
            </button>
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all shadow-sm"
              aria-label="Toggle visual theme state"
            >
              {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button> */}
          </div>
        </div>

        {/* Header Hero Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Workforce Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              HR Analytics
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md font-medium">
              Analyze structural retention indexes, evaluate payroll overhead, and monitor interdepartmental allocation metrics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto shrink-0">
            <button 
              onClick={() => toast("Operating cycle configuration matches selected academic layout.")}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <CalendarIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Academic Year 2025-26
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white border border-transparent rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4 stroke-[2]" /> Export Data
            </button>
          </div>
        </header>

        {/* Dynamic Key Metrics KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Retention Rate", value: `${retention}%`, delta: "+2.1%", icon: UserGroupIcon, color: "text-emerald-600 dark:text-emerald-400", deltaColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" },
            { label: "Monthly Payroll", value: `$${payroll}k`, delta: "Nominal", icon: CurrencyDollarIcon, color: "text-cyan-600 dark:text-cyan-400", deltaColor: "text-slate-500 bg-slate-100 dark:bg-slate-800/40" },
            { label: "Avg Attendance", value: `${attendance}%`, delta: "-0.5%", icon: ChartPieIcon, color: "text-blue-600 dark:text-blue-400", deltaColor: "text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/25" },
            { label: "Diversity Index", value: diversity.toString(), delta: "+0.1", icon: DocumentChartBarIcon, color: "text-indigo-600 dark:text-indigo-400", deltaColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[9rem]">
              <div className="flex justify-between items-start">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${stat.deltaColor}`}>
                  {stat.delta}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider mt-4">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-0.5">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Structural Reporting Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Departmental Cost Distribution Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[25rem] shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-950 dark:text-white tracking-widest flex items-center gap-2">
                  <ArrowTrendingUpIcon className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
                  Departmental Allocation Analysis
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium">Distribution comparison across structural operating groups</p>
              </div>
              <button 
                onClick={() => toast("Full departmental ledger requested")} 
                className="text-[9px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-750 dark:hover:text-cyan-300 font-black uppercase tracking-widest transition-all"
              >
                View Detailed Ledger
              </button>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2.5 sm:gap-6 px-2 sm:px-4 mt-6">
              {formattedDepts.map((item, i) => {
                const percentage = (item.val / maxVal) * 100;
                return (
                  <div key={i} className="flex-grow flex flex-col items-center gap-3 group h-full justify-end">
                    <div className="w-full relative flex items-end h-full">
                      <div className="w-full bg-slate-100/50 dark:bg-slate-950/40 rounded-t-xl overflow-hidden h-full relative flex items-end border border-slate-200/20 dark:border-slate-850/40">
                        <div 
                          className={`w-full ${item.color} rounded-t-lg group-hover:brightness-105 dark:group-hover:brightness-125 transition-all relative`} 
                          style={{ height: `${percentage}%` }} 
                        />
                      </div>
                      
                      {/* Interactive hover indicator info boxes */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-155 z-10">
                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black px-2 py-1.5 rounded-lg whitespace-nowrap shadow-md">
                          Metric: {item.val}% (${(item.raw ? item.raw / 1000 : item.val * 1.5).toFixed(1)}k)
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight text-center truncate max-w-[4.5rem]">
                      {item.dept.slice(0, 5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demographics & System Diversity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[25rem] shadow-sm">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-950 dark:text-white tracking-widest border-b border-slate-100 dark:border-slate-850 pb-4">
                Staff Demographics
              </h3>
              
              <div className="space-y-6 mt-6">
                {/* Gender Balance Chart mapping */}
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase mb-2.5">
                    <span>Gender Diversity</span>
                    <span className="text-cyan-600 dark:text-cyan-400">54% F / 46% M</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850/50 rounded-full flex overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: "54%" }} />
                    <div className="h-full bg-blue-600" style={{ width: "46%" }} />
                  </div>
                </div>

                {/* Contract Types list */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                    Contract Composition
                  </p>
                  {[
                    { label: "Permanent Staffing", val: 78, color: "bg-emerald-500" },
                    { label: "Contractual Assignments", val: 15, color: "bg-amber-500" },
                    { label: "Visiting Instructors", val: 7, color: "bg-indigo-500" },
                  ].map((type, i) => (
                    <div key={i} className="flex items-center gap-3 py-1 border-b border-slate-100/50 dark:border-slate-850/30 last:border-0">
                      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${type.color}`} />
                      <span className="text-xs text-slate-650 dark:text-slate-400 font-semibold flex-grow">{type.label}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{type.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Highlight Footer */}
            <div className="mt-6 p-4 bg-cyan-50/50 dark:bg-cyan-950/10 border border-cyan-100 dark:border-cyan-900/30 rounded-2xl">
              <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed italic text-center font-medium">
                "Faculty diversity metrics are up by 12% since Q1, aligning seamlessly with scheduled inclusion plans."
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default StaffReportsClient;