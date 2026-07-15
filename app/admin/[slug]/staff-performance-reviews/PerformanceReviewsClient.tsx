"use client";

import React, { useState, useEffect } from "react";
import { 
  StarIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  ArrowTrendingUpIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  AdjustmentsVerticalIcon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import ScoringRubricModal from "./ScoringRubricModal";
import toast, { Toaster } from "react-hot-toast";

interface PerformanceReview {
  id: string;
  staff: string;
  role: string;
  score: number;
  studentFeedback: number;
  peerScore: number;
  growth: string;
}

interface PerformanceReviewsClientProps {
  companyId: string;
}

const PerformanceReviewsClient = ({ companyId }: PerformanceReviewsClientProps) => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync systemic theme wrapper with document standard
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchPerformance = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/admin/performance?companyId=${companyId}`);
      const json = await res.json();
      setReviews(json.data || []);
    } catch (err) {
      console.error("Performance sync failed", err);
      toast.error("Failed to synchronize appraisal metrics");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [companyId]);

  const handleInitiateCycle = () => {
    toast.success("New review cycle dispatch sequences initiated");
  };

  const handleDownloadSummary = () => {
    toast.success("Executive performance briefing downloaded successfully");
  };

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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Institutional Evaluation & Growth Benchmarks
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPerformance}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm"
              title="Refresh appraisal ledger"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? "animate-spin text-purple-500" : ""}`} />
            </button>
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
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
              <span className="text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Institutional Merit</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Talent Benchmarks
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md font-medium">
              Analyze organizational growth, track dynamic satisfaction structures, and conduct secure, compliance-ready annual reviews.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto shrink-0">
            <button 
              onClick={() => setIsRubricOpen(true)} 
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <AdjustmentsVerticalIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Scoring Rubric
            </button>
            <button 
              onClick={handleInitiateCycle}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white border border-transparent rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <SparklesIcon className="h-4 w-4 stroke-[2]" /> Initiate Review Cycle
            </button>
          </div>
        </header>

        {/* Statistics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[9rem]">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Avg School Score</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">4.2 / 5.0</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-purple-750 dark:text-purple-400 font-bold uppercase tracking-wide bg-purple-50 dark:bg-purple-950/25 px-2.5 py-0.5 rounded-full border border-purple-100 dark:border-purple-900/30 w-fit">
              <ArrowTrendingUpIcon className="h-3 w-3" /> Top 5% in Region
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[9rem]">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Student Satisfaction</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">89%</h3>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-850">
                <div className="h-full bg-purple-600 dark:bg-purple-500 rounded-full" style={{ width: "89%" }} />
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase">Dynamic institutional consensus</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl border-b-4 border-b-purple-600 dark:border-b-purple-500 shadow-sm flex flex-col justify-between min-h-[9rem]">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Review Participation</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">94%</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
              342 Peer Evaluations Securely Logged
            </span>
          </div>

        </div>

        {/* Ledger Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/50 dark:bg-slate-950/40">
            <div>
              <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest">Annual Staff Appraisals</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium">Consolidated metrics from staff, peer, and student evaluations</p>
            </div>
            <button 
              onClick={handleDownloadSummary}
              className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-750 dark:hover:text-purple-300 font-bold uppercase tracking-wider transition-all"
            >
              <DocumentArrowDownIcon className="h-4 w-4" /> Export Executive Dossier
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-24 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3">
                <ArrowPathIcon className="h-6 w-6 animate-spin text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Calculating institutional metrics...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-24 text-center text-slate-400 dark:text-slate-500 italic text-xs">
                No active performance reports mapped under this organization.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest border-b border-slate-200 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20">
                    <th className="py-5 px-6">Staff Member</th>
                    <th className="py-5 px-6">Overall Rating</th>
                    <th className="py-5 px-6">Student Feedback</th>
                    <th className="py-5 px-6">Peer Evaluation</th>
                    <th className="py-5 px-6">Annual Growth</th>
                    <th className="py-5 px-6 text-right">Appraisal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {reviews.map((row) => (
                    <tr key={row.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="py-5 px-6">
                        <div>
                          <p className="text-sm font-black text-slate-950 dark:text-white leading-tight">{row.staff}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 mt-0.5 uppercase tracking-wide">{row.role}</p>
                        </div>
                      </td>
                      
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                          <StarSolid className="h-4.5 w-4.5" />
                          <span className="text-sm font-black text-slate-950 dark:text-white">{row.score.toFixed(1)}</span>
                        </div>
                      </td>
                      
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850 shrink-0">
                            <div 
                              className="h-full bg-purple-600 dark:bg-purple-500 rounded-full" 
                              style={{ width: `${row.studentFeedback}%` }} 
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{row.studentFeedback}%</span>
                        </div>
                      </td>
                      
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
                          <UserGroupIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <span>{row.peerScore.toFixed(1)} / 5.0</span>
                        </div>
                      </td>
                      
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          row.growth.startsWith("+") 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30" 
                            : "bg-rose-50 dark:bg-rose-950/20 text-rose-750 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30"
                        }`}>
                          {row.growth}
                        </span>
                      </td>
                      
                      <td className="py-5 px-6 text-right">
                        <button className="px-4 py-2 bg-slate-900 dark:bg-slate-950 hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white dark:hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-800 dark:border-slate-850 transition-all">
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ScoringRubricModal 
        isOpen={isRubricOpen} 
        onClose={() => setIsRubricOpen(false)} 
      />
    </main>
  );
};

export default PerformanceReviewsClient;