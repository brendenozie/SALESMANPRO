"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  RectangleGroupIcon, 
  UserGroupIcon, 
  BeakerIcon, 
  CalculatorIcon, 
  ComputerDesktopIcon, 
  AcademicCapIcon, 
  ChevronRightIcon, 
  BriefcaseIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  SparklesIcon,
  InboxIcon
} from "@heroicons/react/24/outline";
import CreateDepartmentModal from "./CreateDepartmentModal";
import RosterDrawer from "./RosterDrawer";

// Define strong typings
interface Staff {
  name: string;
  image?: string;
}

interface Department {
  id?: string;
  name: string;
  count: number;
  head: string;
  staff?: Staff[];
  capacityPercentage?: number; // Pre-calculated or fell-back cleanly
}

interface Props {
  initialDepartments: Department[];
  companyId: string;
}

// Map beautiful clean styling and solid iconography per department
const getDeptIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("sci")) {
    return { icon: BeakerIcon, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-950/20" };
  }
  if (lower.includes("math")) {
    return { icon: CalculatorIcon, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/20" };
  }
  if (lower.includes("it") || lower.includes("tech") || lower.includes("code")) {
    return { icon: ComputerDesktopIcon, color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-950/20" };
  }
  if (lower.includes("admin")) {
    return { icon: AcademicCapIcon, color: "text-slate-600 dark:text-slate-400", bgColor: "bg-slate-100 dark:bg-slate-800/50" };
  }
  return { icon: BriefcaseIcon, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-950/20" };
};

const DepartmentsClient = ({ initialDepartments = [], companyId }: Props) => {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRosterDept, setSelectedRosterDept] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync systemic design token state with DOM
  useEffect(() => {
    setMounted(true);
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Static capacities list to avoid Next.js hydration mismatches from Math.random()
  const stableDepartments = useMemo(() => {
    return departments.map((dept, index) => ({
      ...dept,
      capacityPercentage: dept.capacityPercentage ?? (70 + (index * 7) % 25), // Deterministic seed mapping
    }));
  }, [departments]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 p-4 md:p-8 lg:p-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Control and Global Mode Actions Utility Bar */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Department Operations
            </span>
          </div>
          
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-all shadow-sm"
            aria-label="Toggle structural dark/light layouts"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button> */}
        </div>

        {/* Master Control Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-indigo-650 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Organizational Units</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Departments
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm font-medium">
              Monitor active staff volumes, manage structural headers, and view live operational shift rosters.
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm w-full sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 stroke-[3]" /> Create Department
          </button>
        </header>

        {/* Grid Directory layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stableDepartments.map((dept, index) => {
            const { icon: Icon, color, bgColor } = getDeptIcon(dept.name);
            return (
              <div 
                key={index} 
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 hover:border-slate-350 dark:hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Card Info block */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgColor}`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-lg">
                      <UserGroupIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {dept.count} Members
                      </span>
                    </div>
                  </div>

                  {/* Identification and Lead Names */}
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-1">
                      Department Lead: <span className="text-slate-850 dark:text-slate-300 font-black">{dept.head || "Not Assigned"}</span>
                    </p>
                  </div>

                  {/* Simulated Metrics Indicators */}
                  <div className="mb-8">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                      <span>Active Capacity Realization</span>
                      <span>{mounted ? `${dept.capacityPercentage}%` : "75%"}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: mounted ? `${dept.capacityPercentage}%` : "75%" }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Team Avatars and Actions Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-850">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {dept.staff && dept.staff.length > 0 ? (
                      dept.staff.slice(0, 5).map((s, i) => (
                        <div 
                          key={i} 
                          title={s.name} 
                          className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase overflow-hidden shrink-0"
                        >
                          {s.image ? (
                            <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
                          ) : (
                            s.name ? s.name[0] : "S"
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-650 italic">No staff assigned</span>
                    )}
                    {dept.staff && dept.staff.length > 5 && (
                      <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-500 shrink-0">
                        +{dept.staff.length - 5}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedRosterDept(dept.name)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:text-indigo-550 dark:hover:text-indigo-300 transition-colors"
                  >
                    View Roster <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>
            );
          })}

          {stableDepartments.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <InboxIcon className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">No active departments registered</p>
            </div>
          )}
        </div>
      </div>

      <CreateDepartmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        companyId={companyId} 
        refreshData={() => window.location.reload()}
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