"use client";

import React, { useState } from "react";
import { 
  AcademicCapIcon, 
  DocumentCheckIcon, 
  ArrowDownTrayIcon, 
  PrinterIcon,
  CheckBadgeIcon,
  TrophyIcon,
  StarIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

const GradingReportsClient = () => {
  const [filter, setFilter] = useState("Grade 11-A");

  const students = [
    { id: 'STU-201', name: 'Aria Montgomery', gpa: '3.92', rank: '02', status: 'Finalized', attendance: '98%' },
    { id: 'STU-205', name: 'Liam Sterling', gpa: '3.45', rank: '12', status: 'Pending Review', attendance: '92%' },
    { id: 'STU-210', name: 'Sofia Chen', gpa: '4.00', rank: '01', status: 'Finalized', attendance: '100%' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-500 rounded-full" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Academic Certification</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Center.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <PrinterIcon className="h-4 w-4" /> Bulk Print Term 1
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-purple-900/40">
                <CheckBadgeIcon className="h-4 w-4 stroke-[2.5px]" /> Finalize All Grades
             </button>
          </div>
        </header>

        {/* Academic Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Class Average GPA</p>
             <h3 className="text-3xl font-black text-white mt-1">3.68</h3>
             <p className="mt-4 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">+0.2 vs Last Term</p>
             <AcademicCapIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 group-hover:text-purple-500/10 transition-colors" />
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grading Progress</p>
             <h3 className="text-3xl font-black text-white mt-1">84%</h3>
             <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[84%]" />
             </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Performer</p>
             <h3 className="text-3xl font-black text-white mt-1 italic">Sofia Chen</h3>
             <p className="mt-4 text-[10px] text-purple-400 font-bold uppercase tracking-widest">Perfect 4.0 Score</p>
          </div>
        </div>

        {/* Student Grading List */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden">
          <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
                {['Grade 11-A', 'Grade 11-B', 'Grade 12-A'].map((g) => (
                  <button 
                    key={g}
                    onClick={() => setFilter(g)}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${
                      filter === g ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
             </div>
             <div className="relative w-full md:w-80">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  className="w-full bg-black/40 border border-slate-800 rounded-xl py-2 pl-12 pr-4 text-xs outline-none focus:border-purple-500 transition-all"
                />
             </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                <th className="p-6">Student Detail</th>
                <th className="p-6">GPA Score</th>
                <th className="p-6">Class Rank</th>
                <th className="p-6">Attendance</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {students.map((stu) => (
                <tr key={stu.id} className="group hover:bg-purple-500/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                          {stu.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white leading-tight">{stu.name}</p>
                          <p className="text-[10px] font-mono text-slate-600 mt-0.5">{stu.id}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-white italic">{stu.gpa}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <TrophyIcon className={`h-4 w-4 ${parseInt(stu.rank) <= 3 ? 'text-amber-400' : 'text-slate-600'}`} />
                       <span className="text-xs font-bold text-slate-300">#{stu.rank}</span>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-slate-400 font-mono">{stu.attendance}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                      stu.status === 'Finalized' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {stu.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 bg-slate-800 hover:bg-purple-600 text-white rounded-lg transition-all" title="Edit Comments">
                          <PencilSquareIcon className="h-4 w-4" />
                       </button>
                       <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-white hover:text-black rounded-xl text-[10px] font-black uppercase transition-all shadow-lg">
                          <ArrowDownTrayIcon className="h-3.5 w-3.5" /> PDF
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default GradingReportsClient;