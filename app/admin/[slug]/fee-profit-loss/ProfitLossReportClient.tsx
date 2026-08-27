"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ScaleIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CircleStackIcon,
  BriefcaseIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import { TrendChart } from "./TrendChart";

interface Props {
  companyId: string;
  initialData: any;
}

const ProfitLossReportClient = ({ companyId, initialData }: Props) => {
  const [data, setData] = useState<any>(initialData || {});
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const res = await fetch("/api/admin/reports/profit-loss/trend?companyId=" + encodeURIComponent(companyId));
        const result = await res.json();
        setTrend(result);
      } catch (err) {
        console.error("Trend load failed", err);
      }
    };
    fetchTrend();
  }, [companyId]);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const res = await fetch("/api/admin/reports/profit-loss?companyId=" + encodeURIComponent(companyId));
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Report load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center text-slate-500 dark:text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">
          Calculating Fiscal Position...
        </div>
      </div>
    );
  }

  // Safe defaults for map lists
  const incomeBreakdown = data.incomeBreakdown || [];
  const expenseBreakdown = data.expenseBreakdown || [];
  const netSurplus = data.netSurplus ?? 0;
  const totalIncome = data.totalIncome ?? 0;
  const totalExpenses = data.totalExpenses ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 md:p-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-8 bg-amber-500 rounded-full" />
              <span className="text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                Fiscal Intelligence
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              P&L <span className="text-amber-500">Statement</span>
            </h1>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors shadow-sm">
              <CalendarIcon className="h-4 w-4" /> Fiscal Year 2026
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm">
              <DocumentArrowDownIcon className="h-4 w-4" /> Export for Board
            </button>
          </div>
        </header>

        {/* The Big Picture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-8 rounded-2xl relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Total Net Surplus</p>
              <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black ${netSurplus >= 0 ? 'text-slate-950 dark:text-white' : 'text-rose-600 dark:text-rose-500'}`}>
                ${netSurplus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-2 mt-5 font-semibold text-xs">
                {netSurplus >= 0 ? (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ArrowTrendingUpIcon className="h-4 w-4" /> 
                    <span>Operational Efficiency Optimized</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                    <ArrowTrendingDownIcon className="h-4 w-4" /> 
                    <span>Spending Exceeds Baseline Targets</span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none hidden sm:block">
              <ScaleIcon className="h-32 w-32 text-amber-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-8 rounded-2xl flex flex-col justify-center gap-5 shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Income</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${totalIncome.toLocaleString()}</p>
            </div>
            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Expenses</p>
              <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">(${totalExpenses.toLocaleString()})</p>
            </div>
          </div>
        </div>

        {/* Detailed Reconciliation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Revenue Sources */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-widest mb-8 flex items-center gap-2">
              <CircleStackIcon className="h-4 w-4 text-emerald-500" /> Revenue Sources
            </h3>
            <div className="space-y-6">
              {incomeBreakdown.length === 0 ? (
                <p className="text-xs italic text-slate-400 dark:text-slate-500">No income streams logged.</p>
              ) : (
                incomeBreakdown.map((item: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <span>{item.label}</span>
                      <span>${item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${item.percent}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Operational Outflow */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-widest mb-8 flex items-center gap-2">
              <BriefcaseIcon className="h-4 w-4 text-rose-500" /> Operational Outflow
            </h3>
            <div className="space-y-6">
              {expenseBreakdown.length === 0 ? (
                <p className="text-xs italic text-slate-400 dark:text-slate-500">No expenses logged.</p>
              ) : (
                expenseBreakdown.map((item: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <span>{item.label}</span>
                      <span>${item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                        style={{ width: `${item.percent}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* 6-Month Performance Trend Section */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-widest flex items-center gap-2">
              <PresentationChartLineIcon className="h-4 w-4 text-amber-500" /> 6-Month Performance Trend
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Expenses
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {trend.length > 0 ? (
              <TrendChart data={trend} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs italic">
                Analyzing historical performance trendlines...
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
};

export default ProfitLossReportClient;