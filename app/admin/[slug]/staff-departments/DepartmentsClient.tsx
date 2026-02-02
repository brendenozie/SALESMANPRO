"use client";

import React, { useState } from "react";
import { 
  RectangleGroupIcon, UserGroupIcon, BeakerIcon, CalculatorIcon, 
  ComputerDesktopIcon, AcademicCapIcon, ChevronRightIcon, BriefcaseIcon 
} from "@heroicons/react/24/outline";
import CreateDepartmentModal from "./CreateDepartmentModal";
import RosterDrawer from "./RosterDrawer";

// Helper to match icons to department names
const getDeptIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('sci')) return { icon: BeakerIcon, color: 'text-emerald-400' };
  if (lower.includes('math')) return { icon: CalculatorIcon, color: 'text-blue-400' };
  if (lower.includes('it') || lower.includes('tech')) return { icon: ComputerDesktopIcon, color: 'text-indigo-400' };
  if (lower.includes('admin')) return { icon: AcademicCapIcon, color: 'text-slate-400' };
  return { icon: BriefcaseIcon, color: 'text-orange-400' };
};

const DepartmentsClient = ({ initialDepartments, companyId }: { initialDepartments: any[], companyId: string }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRosterDept, setSelectedRosterDept] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Organizational Units</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Departments.</span>
            </h1>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-indigo-50 transition-all">
            <RectangleGroupIcon className="h-4 w-4" /> Create Department
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialDepartments && initialDepartments.length > 0 &&initialDepartments?.map((dept, index) => {
            const { icon: Icon, color } = getDeptIcon(dept.name);
            return (
              <div key={index} className="group bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all relative">
                <div className="flex justify-between items-start mb-8">
                  <div className={`h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <UserGroupIcon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-bold text-white">{dept.count} Members</span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{dept.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Department Head: <span className="text-slate-300 font-bold">{dept.head}</span>
                  </p>
                </div>

                {/* Progress bar (Simulated data as Budget isn't in schema yet) */}
                <div className="mb-8">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                    <span>Active Projects / Capacity</span>
                    <span>{Math.floor(Math.random() * 40) + 60}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: '75%' }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                  <div className="flex -space-x-3">
                    {dept.staff && dept.staff.map((s: any, i: number) => (
                      <div key={i} title={s.name} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
                        {s.image ? <img src={s.image} alt="" /> : s.name[0]}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setSelectedRosterDept(dept.name)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-400 hover:text-white transition-colors"
                  >
                    View Roster <ChevronRightIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateDepartmentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          companyId={companyId} 
          refreshData={() => window.location.reload()} // Simplified refresh
        />
        
      <RosterDrawer 
        isOpen={!!selectedRosterDept} 
        onClose={() => setSelectedRosterDept(null)} 
        departmentName={selectedRosterDept || ""}
        companyId={companyId}
      />
    </main>
  );
};

export default DepartmentsClient;