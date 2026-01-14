"use client";

import React from "react";
import { 
  RectangleGroupIcon, 
  UserGroupIcon, 
  BeakerIcon, 
  CalculatorIcon, 
  ComputerDesktopIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  ChartPieIcon
} from "@heroicons/react/24/outline";

const DepartmentsClient = () => {
  const departments = [
    { id: 'DEPT-SCI', name: 'Science', head: 'Dr. Alistair Cook', staffCount: 12, budget: '92%', icon: BeakerIcon, color: 'text-emerald-400' },
    { id: 'DEPT-MAT', name: 'Mathematics', head: 'Sarah Jenkins', staffCount: 8, budget: '78%', icon: CalculatorIcon, color: 'text-blue-400' },
    { id: 'DEPT-IT', name: 'Information Tech', head: 'David Chen', staffCount: 5, budget: '95%', icon: ComputerDesktopIcon, color: 'text-indigo-400' },
    { id: 'DEPT-ADM', name: 'Administration', head: 'Marcus Vane', staffCount: 15, budget: '60%', icon: AcademicCapIcon, color: 'text-slate-400' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Organizational Units</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              School <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Departments.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-indigo-50 transition-all">
            <RectangleGroupIcon className="h-4 w-4" /> Create Department
          </button>
        </header>

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="group bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className={`h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center ${dept.color} group-hover:scale-110 transition-transform`}>
                  <dept.icon className="h-8 w-8" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-600">{dept.id}</span>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <UserGroupIcon className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-bold text-white">{dept.staffCount} Members</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-black text-white mb-1 group-hover:text-indigo-300 transition-colors">{dept.name}</h3>
                <p className="text-xs text-slate-500 font-medium tracking-wide">Head: <span className="text-slate-300 font-bold">{dept.head}</span></p>
              </div>

              {/* Budget Utilization Indicator */}
              <div className="mb-8">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                  <span>Resource Utilization</span>
                  <span>{dept.budget}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                    style={{ width: dept.budget }} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {dept.name[i]}
                    </div>
                  ))}
                  <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                    +{dept.staffCount - 3}
                  </div>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-400 hover:text-white transition-colors">
                  View Roster <ChevronRightIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default DepartmentsClient;