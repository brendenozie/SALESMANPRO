"use client";

import React, { useEffect, useState } from "react";
import { 
  BriefcaseIcon, 
  UserPlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import AddCandidateModal from "./AddCandidateModal";
import toast, { Toaster } from "react-hot-toast";

interface Candidate {
  id: string;
  name: string;
  position: string;
  score: string; // e.g., "85%" or "8.5/10"
  source: string;
  date: string;
  stage: string;
}

interface PipelineStats {
  activeVacancies: string | number;
  totalApplicants: string | number;
  interviewsToday: string | number;
}

interface RecruitmentClientProps {
  companyId: string;
}

const RecruitmentClient = ({ companyId }: RecruitmentClientProps) => {
  const [activeStage, setActiveStage] = useState("All");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/recruitment?companyId=${companyId}&stage=${activeStage}`);
      const json = await res.json();
      setCandidates(json.data || []);
      setStats(json.stats);
    } catch (err) {
      console.error("Failed to synchronize recruitment data", err);
      toast.error("Failed to retrieve candidate pipeline");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await fetchPipeline();
    setIsSyncing(false);
    toast.success("Recruitment metrics synchronized");
  };

  useEffect(() => {
    fetchPipeline();
  }, [activeStage, companyId]);

  const handleNextStep = async (id: string, currentStage: string) => {
    const stages = ["Applied", "Screening", "Interview", "Offer Sent", "Onboarding"];
    const currentIndex = stages.indexOf(currentStage);
    
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      try {
        const res = await fetch(`/api/admin/recruitment`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId: id, nextStage })
        });
        
        if (res.ok) {
          toast.success(`Candidate advanced to ${nextStage}`);
          fetchPipeline(); // Refresh data
        } else {
          throw new Error("Failed to advance candidate");
        }
      } catch (err) {
        toast.error("Could not transition candidate stage");
      }
    } else {
      toast.error("Candidate is already at the final stage");
    }
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Talent Sourcing & Acquisition Pipeline
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 text-slate-500 hover:text-slate-850 dark:hover:text-white transition-all shadow-sm"
              title="Sync active applications"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? "animate-spin text-indigo-500" : ""}`} />
            </button>
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
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
              <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Talent Acquisition</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Growth Pipeline
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md font-medium">
              Manage open vacancies, evaluate incoming portfolios, and move active candidates through automated qualification phases.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto shrink-0">
            <button 
              onClick={() => toast("Vacancy management view activated")}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <BriefcaseIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Manage Vacancies
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)} 
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <UserPlusIcon className="h-4 w-4 stroke-[2]" /> Add Candidate
            </button>
          </div>
        </header>

        {/* Pipeline Analytics Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Active Vacancies", value: stats?.activeVacancies || "0", icon: BriefcaseIcon, color: "text-indigo-600 dark:text-indigo-400" },
            { label: "Total Applicants", value: stats?.totalApplicants || "0", icon: UserGroupIcon, color: "text-blue-600 dark:text-blue-400" },
            { label: "Interviews Today", value: stats?.interviewsToday || "0", icon: ClockIcon, color: "text-amber-600 dark:text-amber-500" },
            { label: "Conversion Rate", value: "12%", icon: CheckCircleIcon, color: "text-emerald-600 dark:text-emerald-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[8.5rem]">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider mt-2">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-0.5">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Stage Filter Tab Bar */}
        <div className="flex overflow-x-auto gap-2.5 pb-2 no-scrollbar border-b border-slate-200 dark:border-slate-850">
          {["All", "Applied", "Screening", "Interview", "Offer Sent", "Onboarding"].map((stage) => (
            <button 
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                activeStage === stage 
                  ? "bg-indigo-650 border-transparent text-white shadow-sm" 
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-850 dark:hover:text-slate-350 hover:border-slate-300 dark:hover:border-slate-800"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        {/* Dynamic Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-24 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3">
              <ArrowPathIcon className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Syncing candidate records...</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-20 text-center text-slate-400 dark:text-slate-500 text-xs italic shadow-sm">
              No candidates found under the "{activeStage}" stage constraints.
            </div>
          ) : (
            candidates.map((candidate) => (
              <div 
                key={candidate.id} 
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-md dark:hover:border-slate-750 transition-all flex flex-col justify-between min-h-[16.5rem] shadow-sm"
              >
                <div>
                  {/* Top Block */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {candidate.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 mt-0.5 uppercase tracking-wide">
                        {candidate.position}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-[9px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                      #{candidate.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  {/* Operational Score & Progress indicators */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Evaluation Level</span>
                      <span className="text-slate-850 dark:text-slate-100 font-black">{candidate.score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/30 dark:border-slate-850">
                      <div 
                        className="h-full bg-indigo-650 dark:bg-indigo-500 rounded-full" 
                        style={{ width: candidate.score.includes("%") ? candidate.score : `${parseFloat(candidate.score) * 10}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100/50 dark:border-slate-850/40">
                      <span>Ref: {candidate.source}</span>
                      <span>Log: {candidate.date}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-850 mt-auto">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                    candidate.stage === "Onboarding" ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/55 dark:border-emerald-900/35 text-emerald-700 dark:text-emerald-450" :
                    candidate.stage === "Offer Sent" ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/55 dark:border-blue-900/35 text-blue-750 dark:text-blue-450" :
                    "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/55 dark:border-amber-900/35 text-amber-700 dark:text-amber-450"
                  }`}>
                    {candidate.stage}
                  </span>
                  
                  <button 
                    onClick={() => handleNextStep(candidate.id, candidate.stage)} 
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 dark:hover:text-indigo-300 tracking-wider transition-all"
                  >
                    Next Step <ArrowRightIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <AddCandidateModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        companyId={companyId}
        onSuccess={fetchPipeline}
      />
    </main>
  );
};

export default RecruitmentClient;