"use client";

import React, { useState } from "react";
import { 
  BriefcaseIcon, 
  UserPlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

const RecruitmentClient = () => {
  const [activeStage, setActiveStage] = useState("All");

  const candidates = [
    { id: 'APP-102', name: 'Dr. Julian Thorne', position: 'Physics Head', stage: 'Interview', score: '92%', source: 'LinkedIn', date: 'Jan 12' },
    { id: 'APP-105', name: 'Amara Okafor', position: 'Primary Tutor', stage: 'Offer Sent', score: '88%', source: 'Referral', date: 'Jan 14' },
    { id: 'APP-108', name: 'Thomas Wright', position: 'IT Specialist', stage: 'Onboarding', score: '95%', source: 'Direct', date: 'Jan 05' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Talent Acquisition</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Growth <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Pipeline.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <BriefcaseIcon className="h-4 w-4" /> Manage Vacancies
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-indigo-900/40">
                <UserPlusIcon className="h-4 w-4" /> Add Candidate
             </button>
          </div>
        </header>

        {/* Pipeline Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Active Vacancies', value: '06', icon: BriefcaseIcon, color: 'text-indigo-400' },
            { label: 'Total Applicants', value: '124', icon: UserGroupIcon, color: 'text-blue-400' },
            { label: 'Interviews Today', value: '03', icon: ClockIcon, color: 'text-amber-400' },
            { label: 'Conversion Rate', value: '12%', icon: CheckCircleIcon, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem]">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Pipeline Stages Tab */}
        <div className="flex overflow-x-auto gap-4 mb-8 no-scrollbar">
           {['All', 'Applied', 'Screening', 'Interview', 'Offer Sent', 'Onboarding'].map((stage) => (
             <button 
               key={stage}
               onClick={() => setActiveStage(stage)}
               className={`flex-shrink-0 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                 activeStage === stage ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-600'
               }`}
             >
               {stage}
             </button>
           ))}
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="group bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-indigo-500/[0.03] hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{candidate.name}</h3>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{candidate.position}</p>
                 </div>
                 <div className="px-3 py-1 bg-black/40 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-500">
                    {candidate.id}
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Interview Score</span>
                    <span className="text-white font-black">{candidate.score}</span>
                 </div>
                 <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: candidate.score }} />
                 </div>
                 <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-600">Source: {candidate.source}</span>
                    <span className="text-slate-600">Applied: {candidate.date}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                 <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${
                    candidate.stage === 'Onboarding' ? 'bg-emerald-500/10 text-emerald-400' :
                    candidate.stage === 'Offer Sent' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-amber-500/10 text-amber-400'
                 }`}>
                    {candidate.stage}
                 </span>
                 <button className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-400 hover:text-white transition-all">
                    Next Step <ArrowRightIcon className="h-3 w-3" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default RecruitmentClient;