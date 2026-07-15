"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ClockIcon, 
  ShieldCheckIcon, 
  PhoneArrowUpRightIcon,
  CalendarDaysIcon, 
  IdentificationIcon, 
  ChatBubbleLeftEllipsisIcon,
  SunIcon,
  MoonIcon,
  UserGroupIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import OnboardStaffModal from "./OnboardStaffModal";

interface StaffMember {
  id: string;
  name: string;
  role: "WARDEN" | "CLEANER" | string;
  staffId: string;
  isOnDuty: boolean;
  shiftLabel: string;
  phoneNumber: string;
  user?: {
    email?: string;
  };
}

interface Props {
  initialStaff: StaffMember[];
  schoolId: string;
}

const HostelStaffClient = ({ initialStaff = [], schoolId }: Props) => {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Synchronize layout styling variables across document tree
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Optimistic Toggle Handler
  const toggleDuty = async (dbId: string, currentIsOnDuty: boolean) => {
    const newStatus = !currentIsOnDuty;
    
    // Save state for potential rollback
    const previousStaffState = [...staff];
    
    // Perform snappy UI switch immediately
    setStaff(prev => prev.map(s => s.id === dbId ? { ...s, isOnDuty: newStatus } : s));

    try {
      const res = await fetch(`/api/admin/hostel/staff/${dbId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isOnDuty: newStatus }),
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error("Server communication fault");

      const updatedMember = await res.json();
      toast.success(`${updatedMember.name || "Staff member"} is now ${newStatus ? "On-Duty" : "Off-Duty"}`);
    } catch (err) {
      // Revert if API request fails
      setStaff(previousStaffState);
      toast.error("Status synchronization failed. Please try again.");
    }
  };

  // Memoized stats to prevent redundant recalculation
  const stats = useMemo(() => {
    const wardensOnDuty = staff.filter(s => s.role === "WARDEN" && s.isOnDuty).length;
    const cleanersOnDuty = staff.filter(s => s.role === "CLEANER" && s.isOnDuty).length;
    const totalWardens = staff.filter(s => s.role === "WARDEN").length;
    return {
      wardens: wardensOnDuty,
      cleaners: cleanersOnDuty,
      totalWardens,
    };
  }, [staff]);

  // Helper to extract clean initials from staff name
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";
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
        
        {/* Top Dark/Light Mode Utility Action Bar */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Operations Control
            </span>
          </div>
          
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-violet-500 transition-all shadow-sm"
            aria-label="Toggle structural theme layout"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button> */}
        </div>

        {/* Master Control Header Panel */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-violet-600 dark:text-violet-500 text-[10px] font-black uppercase tracking-[0.2em]">Personnel & Operations</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Duty Roster
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm font-medium">
              Manage shift handovers, check-in structural wardens on duty, and onboard cleaning personnel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <button className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all font-bold text-xs uppercase tracking-wide">
              <CalendarDaysIcon className="h-4 w-4" /> 
              Manage Schedule
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm"
            >
              <IdentificationIcon className="h-4 w-4" /> 
              Onboard Staff
            </button>
          </div>
        </header>

        {/* Dynamic Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest">Warden Presence</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{stats.wardens} / {stats.totalWardens}</h3>
              </div>
              <ShieldCheckIcon className={`h-8 w-8 ${stats.wardens > 0 ? "text-emerald-500" : "text-rose-500"} opacity-40`} />
            </div>
            <p className={`text-[10px] font-bold mt-5 uppercase tracking-wider ${stats.wardens > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {stats.wardens > 0 ? "• Minimum Safety Threshold Met" : "• Safety Warning: No Wardens On-Duty"}
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest">Active Cleaners</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{stats.cleaners} Staff</h3>
              </div>
              <SparklesIcon className="h-8 w-8 text-indigo-500 opacity-40" />
            </div>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-5 uppercase tracking-wider">
              Currently patrolling sanitation zones
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-sm border-b-4 border-b-violet-500/50">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest">System Handover</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">Live Sync</h3>
              </div>
              <UserGroupIcon className="h-8 w-8 text-violet-500 opacity-40" />
            </div>
            <p className="text-[10px] text-violet-650 dark:text-violet-400 font-black mt-5 uppercase tracking-wider animate-pulse">
              Tracking {staff.length} Active Personnel
            </p>
          </div>
        </div>

        {/* Staff Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div 
              key={member.id} 
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-350 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {/* Initial Avatar generation */}
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-sm">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-white leading-snug">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black text-violet-600 dark:text-violet-450 uppercase tracking-widest">
                        {member.role}
                      </span>
                      <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-550">
                        #{member.staffId}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Duty Toggle Pill Button */}
                <button 
                  onClick={() => toggleDuty(member.id, member.isOnDuty)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                    member.isOnDuty 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
                      : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 hover:border-slate-350 dark:hover:border-slate-750"
                  }`}
                  aria-label="Toggle Active Roster Presence"
                >
                  {member.isOnDuty ? "On Duty" : "Off Duty"}
                </button>
              </div>

              {/* Information Blocks */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/40">
                  <ClockIcon className="h-4 w-4 text-slate-400" />
                  <p className="text-xs text-slate-750 dark:text-slate-350 font-medium">{member.shiftLabel || "No designated shift"}</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/40">
                  <PhoneArrowUpRightIcon className="h-4 w-4 text-slate-400" />
                  <p className="text-xs font-mono text-slate-750 dark:text-slate-350 font-medium">{member.phoneNumber || "No contact info"}</p>
                </div>
              </div>
              
              {/* Profile Context Relations & Action Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4 gap-2">
                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate max-w-[50%]">
                  Account: <span className="text-slate-500 dark:text-slate-400 font-normal">{member.user?.email || "No profile link"}</span>
                </div>
                
                <div className="flex gap-1.5 shrink-0">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-violet-50 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-900/30 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all">
                    <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5" /> 
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}

          {staff.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <p className="text-sm font-bold text-slate-400 dark:text-slate-600">No staff members currently onboarded</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <OnboardStaffModal 
          schoolId={schoolId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newMember: any) => {
            setStaff((prev: StaffMember[]) => [
              ...prev,
              {
                id: newMember.id || String(Date.now()),
                name: newMember.name,
                role: newMember.role || "STAFF",
                staffId: newMember.staffId || "N/A",
                isOnDuty: false,
                shiftLabel: newMember.shiftLabel || "General Shift",
                phoneNumber: newMember.phoneNumber || "",
                user: newMember.user
              }
            ]);
            setIsModalOpen(false);
          }}
        />
      )}
    </main>
  );
};

export default HostelStaffClient;