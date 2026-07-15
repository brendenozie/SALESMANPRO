"use client";

import React, { useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ChartBarIcon, 
  ArrowDownTrayIcon, 
  CalendarIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ArrowUpRightIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

// Mock Data representing different database views for report periods
const PERIOD_DATA: Record<string, {
  kpis: Array<{ label: string; value: string; trend: string; icon: any; color: string; isPositive: boolean }>;
  categories: Array<{ name: string; count: number }>;
  trending: Array<{ name: string; count: number; growth: string }>;
  utilization: number[];
}> = {
  "Last 30 Days": {
    kpis: [
      { label: 'Circulation Rate', value: '78.4%', trend: '+4.2%', icon: ArrowTrendingUpIcon, color: 'text-emerald-400', isPositive: true },
      { label: 'Avg. Lending Time', value: '12 Days', trend: '-2 Days', icon: ChartBarIcon, color: 'text-indigo-400', isPositive: true },
      { label: 'Revenue Collected', value: '$2,450', trend: '+18%', icon: PresentationChartLineIcon, color: 'text-cyan-400', isPositive: true },
      { label: 'New Members', value: '142', trend: '+12%', icon: DocumentTextIcon, color: 'text-indigo-400', isPositive: true },
    ],
    categories: [
      { name: 'Fiction', count: 890 },
      { name: 'Technology', count: 452 },
      { name: 'Philosophy', count: 284 },
      { name: 'History', count: 198 },
    ],
    trending: [
      { name: 'Technology', count: 452, growth: '+12%' },
      { name: 'Philosophy', count: 284, growth: '+5%' },
      { name: 'Fiction', count: 890, growth: '+18%' },
    ],
    utilization: [40, 70, 45, 90, 65, 80, 55, 95, 75, 85]
  },
  "Quarterly": {
    kpis: [
      { label: 'Circulation Rate', value: '82.1%', trend: '+6.8%', icon: ArrowTrendingUpIcon, color: 'text-emerald-400', isPositive: true },
      { label: 'Avg. Lending Time', value: '10 Days', trend: '-4 Days', icon: ChartBarIcon, color: 'text-indigo-400', isPositive: true },
      { label: 'Revenue Collected', value: '$8,120', trend: '+22%', icon: PresentationChartLineIcon, color: 'text-cyan-400', isPositive: true },
      { label: 'New Members', value: '498', trend: '+15%', icon: DocumentTextIcon, color: 'text-indigo-400', isPositive: true },
    ],
    categories: [
      { name: 'Fiction', count: 2450 },
      { name: 'Technology', count: 1380 },
      { name: 'Philosophy', count: 820 },
      { name: 'History', count: 640 },
    ],
    trending: [
      { name: 'Technology', count: 1380, growth: '+24%' },
      { name: 'Philosophy', count: 820, growth: '+8%' },
      { name: 'Fiction', count: 2450, growth: '+20%' },
    ],
    utilization: [60, 55, 75, 80, 95, 70, 85, 90, 80, 95]
  },
  "Year to Date": {
    kpis: [
      { label: 'Circulation Rate', value: '85.7%', trend: '+9.1%', icon: ArrowTrendingUpIcon, color: 'text-emerald-400', isPositive: true },
      { label: 'Avg. Lending Time', value: '9 Days', trend: '-5 Days', icon: ChartBarIcon, color: 'text-indigo-400', isPositive: true },
      { label: 'Revenue Collected', value: '$24,980', trend: '+35%', icon: PresentationChartLineIcon, color: 'text-cyan-400', isPositive: true },
      { label: 'New Members', value: '1,240', trend: '+28%', icon: DocumentTextIcon, color: 'text-indigo-400', isPositive: true },
    ],
    categories: [
      { name: 'Fiction', count: 9120 },
      { name: 'Technology', count: 5410 },
      { name: 'Philosophy', count: 3110 },
      { name: 'History', count: 2490 },
    ],
    trending: [
      { name: 'Technology', count: 5410, growth: '+41%' },
      { name: 'Philosophy', count: 3110, growth: '+15%' },
      { name: 'Fiction', count: 9120, growth: '+32%' },
    ],
    utilization: [75, 80, 85, 70, 90, 85, 95, 80, 90, 99]
  }
};

interface LibraryReportingClientProps {
  initialStats?: any;
  schoolId?: string;
}

const LibraryReportingClient = ({ initialStats, schoolId }: LibraryReportingClientProps) => {
  const [reportRange, setReportRange] = useState<string>("Last 30 Days");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Fallback to initialStats structure if provided, otherwise resolve period-specific data state
  const currentData = useMemo(() => {
    if (initialStats && reportRange === "Last 30 Days") {
      return {
        ...PERIOD_DATA["Last 30 Days"],
        ...initialStats
      };
    }
    return PERIOD_DATA[reportRange] || PERIOD_DATA["Last 30 Days"];
  }, [initialStats, reportRange]);

  // Dynamically compute safe percentages based on maximum items for progress scales
  const maxCategoryCount = useMemo(() => {
    if (!currentData?.categories?.length) return 1;
    return Math.max(...currentData.categories.map((c: any) => c.count));
  }, [currentData]);

  const maxTrendingCount = useMemo(() => {
    if (!currentData?.trending?.length) return 1;
    return Math.max(...currentData.trending.map((c: any) => c.count));
  }, [currentData]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading("Structuring analytics export...");

    try {
      // Simulating minor network or PDF building delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Executive PDF report downloaded successfully!", {
        id: loadingToast,
      });
    } catch (error) {
      toast.error("Failed to generate PDF. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const triggerAuditAction = (moduleName: string) => {
    toast.success(`Opening ${moduleName} workspace...`);
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Analytics Glow Decoration */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Data Insights</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Analytics.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-grow xl:w-48">
               <CalendarIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
               <select 
                 value={reportRange}
                 onChange={(e) => setReportRange(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-10 text-xs appearance-none focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer"
               >
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Year to Date">Year to Date</option>
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                   <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                 </svg>
               </div>
            </div>
            
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {isExporting ? "Generating..." : "Export PDF"}
            </button>
          </div>
        </header>

        {/* High-Level KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {currentData.kpis.map((kpi: any, i: number) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${kpi.color}`}>
                  {kpi.trend}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <h2 className="text-2xl font-black text-white mt-1 tracking-tight">{kpi.value}</h2>
            </div>
          ))}
        </div>

        {/* Core Layout Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Module 1: Popular Categories */}
          <div className="lg:col-span-1 bg-slate-900/20 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6">Popular Categories</h3>
            <div className="space-y-6">
              {currentData?.categories?.map((cat: any, i: number) => {
                const percentage = Math.round((cat.count / maxCategoryCount) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300 font-medium">{cat.name}</span>
                      <span className="text-indigo-400 font-bold">{cat.count.toLocaleString()} items</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Module 2: Resource Utilization (Interactive Bar Chart) */}
          <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white">Resource Utilization</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active</span>
                </div>
             </div>
             
             {/* Dynamic Bar Chart */}
             <div className="h-48 w-full flex items-end gap-2 px-2">
               {currentData.utilization.map((val: number, i: number) => (
                 <div 
                   key={i} 
                   className="flex-grow bg-indigo-500/20 hover:bg-indigo-500/60 rounded-t-lg transition-all cursor-pointer relative group"
                   style={{ height: `${val}%` }}
                 >
                   {/* Centered Tooltip Popover */}
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      Week {i + 1}: {val}%
                   </div>
                 </div>
               ))}
             </div>
             <div className="flex justify-between mt-4 px-2">
               <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Week 01</span>
               <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Week 10</span>
             </div>
          </div>
        </div>

        {/* Secondary Dashboard Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Module 3: Trending Categories */}
          <div className="lg:col-span-1 bg-slate-900/20 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6">Trending Categories</h3>
            <div className="space-y-6">
              {currentData.trending.map((cat: any, i: number) => {
                const percentage = Math.round((cat.count / maxTrendingCount) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium text-slate-300">{cat.name}</span>
                      <span className="text-xs text-indigo-400 font-bold">{cat.growth}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => triggerAuditAction("Detailed Breakdown")}
              className="mt-10 w-full py-4 border border-dashed border-slate-700 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-white hover:border-slate-500 hover:bg-slate-900/40 transition-all active:scale-95"
            >
              View Detailed Breakdown
            </button>
          </div>

          {/* Module 4: System Actions & Forecasting */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div 
                 onClick={() => triggerAuditAction("Fine Forecast")}
                 className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-slate-800/40 hover:border-slate-700 transition-all active:scale-98"
               >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:bg-amber-500/20 transition-all">
                      <FunnelIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-200">Fine Forecast</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Project expected arrears</p>
                    </div>
                  </div>
                  <ArrowUpRightIcon className="h-4 w-4 text-slate-600 group-hover:text-white transition-all" />
               </div>

               <div 
                 onClick={() => triggerAuditAction("Inventory Audit")}
                 className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-slate-800/40 hover:border-slate-700 transition-all active:scale-98"
               >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:bg-cyan-500/20 transition-all">
                      <ChartBarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-200">Inventory Audit</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Discrepancy validation checklist</p>
                    </div>
                  </div>
                  <ArrowUpRightIcon className="h-4 w-4 text-slate-600 group-hover:text-white transition-all" />
               </div>
            </div>

            {/* Micro-insight callout strip */}
            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl flex items-start gap-4">
               <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-indigo-500 shrink-0" />
               <div>
                  <p className="text-xs font-semibold text-slate-200">System Recommendation</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Based on current trends, we recommend re-allocating physical shelving space from **Philosophy** to **Fiction** before the next academic quarter to balance density.
                  </p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default LibraryReportingClient;