"use client";

import React from "react";
import { 
  StarIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  ArrowTrendingUpIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  AdjustmentsVerticalIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

const PerformanceReviewsClient = () => {
  const reviews = [
    { id: 'PERF-101', staff: 'Dr. Alistair Cook', role: 'Senior Lecturer', score: 4.8, studentFeedback: 96, peerScore: 4.5, growth: '+12%', status: 'Excellent' },
    { id: 'PERF-205', staff: 'Sarah Jenkins', role: 'Dept Head', score: 4.2, studentFeedback: 88, peerScore: 4.0, growth: '+5%', status: 'Stable' },
    { id: 'PERF-312', staff: 'Robert Fox', role: 'Lab Assistant', score: 3.5, studentFeedback: 72, peerScore: 3.8, growth: '-2%', status: 'Needs Review' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-500 rounded-full" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Institutional Merit</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Talent <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Benchmarks.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <AdjustmentsVerticalIcon className="h-4 w-4" /> Scoring Rubric
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-purple-900/40">
                <SparklesIcon className="h-4 w-4" /> Initiate Review Cycle
             </button>
          </div>
        </header>

        {/* Global Merit Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg School Score</p>
            <h3 className="text-3xl font-black text-white mt-1">4.2 / 5.0</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-purple-400 font-bold">
              <ArrowTrendingUpIcon className="h-3 w-3" /> Top 5% in Region
            </div>
          </div>
          
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Satisfaction</p>
            <h3 className="text-3xl font-black text-white mt-1">89%</h3>
            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[89%]" />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-b-4 border-b-purple-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Review Participation</p>
            <h3 className="text-3xl font-black text-white mt-1">94%</h3>
            <p className="mt-4 text-[10px] text-slate-500 font-medium italic">342 Peer Evaluations Received</p>
          </div>
        </div>

        {/* Performance Leaderboard/List */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Annual Staff Appraisals</h3>
            <button className="text-xs text-slate-500 hover:text-white underline underline-offset-4">Download Executive Summary</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Staff Member</th>
                  <th className="p-6">Overall Rating</th>
                  <th className="p-6">Student Feedback</th>
                  <th className="p-6">Peer Evaluation</th>
                  <th className="p-6">Annual Growth</th>
                  <th className="p-6 text-right">Appraisal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {reviews.map((row) => (
                  <tr key={row.id} className="group hover:bg-purple-500/[0.02] transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white italic">{row.staff}</p>
                      <p className="text-[10px] font-mono text-slate-600">{row.role}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-1 text-purple-400">
                        <StarSolid className="h-4 w-4" />
                        <span className="text-sm font-black text-white">{row.score}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${row.studentFeedback}%` }} />
                        </div>
                        <span className="text-xs font-mono text-slate-400">{row.studentFeedback}%</span>
                      </div>
                    </td>
                    <td className="p-6 text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="h-4 w-4 text-slate-600" /> {row.peerScore} / 5.0
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] font-black ${row.growth.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {row.growth}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="px-4 py-2 bg-slate-800 hover:bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase transition-all">
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PerformanceReviewsClient;