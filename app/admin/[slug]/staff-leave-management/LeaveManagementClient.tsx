"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon, 
  ArrowPathIcon, 
  ShieldExclamationIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  ClockIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import PolicySettingsModal from "./PolicySettingsModal";
import PostLeaveModal from "./PostLeaveModal";
import LeaveCalendarView from "./LeaveCalendarView";

interface LeaveRequest {
  id: string;
  user?: {
    name?: string;
  };
  type: string;
  daysRequested: number;
  startDate: string;
  backupStaff?: {
    user?: {
      name?: string;
    };
  };
  status: "PENDING" | "APPROVED" | "DECLINED" | string;
}

interface LeaveManagementClientProps {
  companyId: string;
  initialRequests?: LeaveRequest[];
  initialStaff?: any[];
}

const LeaveManagementClient = ({ companyId, initialRequests, initialStaff }: LeaveManagementClientProps) => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarData, setCalendarData] = useState([]);
  const [staff, setStaff] = useState(initialStaff || []);
  const [darkMode, setDarkMode] = useState(false);
  
  const [conflicts, setConflicts] = useState<Record<string, string[]>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sync systemic theme wrapper with document standard
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Fetch calendar data when switching modes
  const toggleView = async () => {
    if (viewMode === "list") {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/leave/calendar?companyId=${companyId}`);
        if (!res.ok) throw new Error("Connection failure");
        const json = await res.json();
        setCalendarData(json.data);
        setViewMode("calendar");
      } catch (err) {
        toast.error("Failed to compile central calendar data");
      } finally {
        setIsLoading(false);
      }
    } else {
      setViewMode("list");
    }
  };  

  // Fetch data when tab changes
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/leave?companyId=${companyId}&status=${activeTab}`);
        const json = await res.json();
        setRequests(json.data || []);
      } catch (err) {
        console.error("Error fetching requests", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [activeTab, companyId]);

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: newStatus }),
      });

      if (res.ok) {
        setRequests(requests.filter((r) => r.id !== requestId));
        toast.success(`Request successfully marked as ${newStatus.toLowerCase()}`);
      } else {
        throw new Error("API rejection");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/leave?companyId=${companyId}&status=${activeTab}`);
      const json = await res.json();
      setRequests(json.data || []);
      toast.success("Governance metrics synchronized");
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch(`/api/admin/leave/conflicts?companyId=${companyId}`)
      .then((res) => res.json())
      .then((data) => setConflicts(data.conflicts || {}))
      .catch((err) => console.error("Conflict verification failed", err));
  }, [currentMonth, companyId]);

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
        
        {/* Top Operational Bar */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Operations & Schedule Risk Management
            </span>
          </div>
          
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-all shadow-sm"
            aria-label="Toggle structural light/dark themes"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button> */}
        </div>

        {/* Dynamic Header Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-[0.2em]">Workforce Governance</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Leave & Continuity
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm font-medium">
              Oversee departmental coverage maps, allocate backup staff models, and authorize leave pipelines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto shrink-0">
            <button 
              onClick={() => setIsPolicyModalOpen(true)} 
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <CalendarIcon className="h-4 w-4 text-violet-500" /> Policy Settings
            </button>
            <button 
              onClick={() => setIsPostModalOpen(true)} 
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white border border-transparent rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm shadow-violet-650/10"
            >
              <PlusIcon className="h-4 w-4 stroke-[3]" /> Post Leave Request
            </button>
          </div>
        </header>

        {/* Dynamic Risk & Capacity Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          
          {/* Active Schedule Threat Deck */}
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/40 p-5 rounded-3xl border-l-4 border-l-rose-500 shadow-sm flex flex-col justify-between min-h-[9rem]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-450">
                <ShieldExclamationIcon className="h-4.5 w-4.5" />
                <h4 className="text-[10px] font-black uppercase tracking-wider">Continuity Risks</h4>
              </div>
              
              <ul className="space-y-1.5 max-h-16 overflow-y-auto">
                {Object.keys(conflicts).length === 0 ? (
                  <li className="text-[10px] text-slate-400 dark:text-slate-550 italic">No operational bottlenecks detected</li>
                ) : (
                  Object.entries(conflicts).slice(0, 2).map(([date, depts]) => (
                    <li key={date} className="flex justify-between items-center text-[10px] border-b border-slate-100 dark:border-slate-850 pb-1">
                      <span className="font-bold text-slate-600 dark:text-slate-400">{format(new Date(date), "MMM dd")}</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 truncate max-w-[80px]">{depts.join(", ")}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Active Leave Count */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[9rem]">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Currently Out</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">12 Staff</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-violet-750 dark:text-violet-400 font-bold uppercase tracking-wide bg-violet-50/50 dark:bg-violet-950/20 px-2.5 py-0.5 rounded-full border border-violet-100 dark:border-violet-900/30 w-fit">
              <UserGroupIcon className="h-3 w-3" /> Active Coverage Validated
            </span>
          </div>

          {/* Pending Action Required */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl border-l-4 border-l-amber-500 shadow-sm flex flex-col justify-between min-h-[9rem]">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Pending Approvals</p>
              <h3 className="text-3xl font-black text-amber-550 dark:text-amber-500 mt-1">{requests.length} Requests</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wide bg-amber-50/50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-150 dark:border-amber-900/30 w-fit">
              <ClockIcon className="h-3 w-3" /> Action Recommended
            </span>
          </div>

          {/* Total Pipeline Security Level */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[9rem]">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Governance Risk</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-500 mt-1">Nominal</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 dark:text-emerald-450 font-bold uppercase tracking-wide bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 w-fit">
              Safety Checks Active
            </span>
          </div>

        </div>

        {/* View Layout Selector and Filter Bars */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-4">
          
          {/* Status Tabs */}
          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
            {["All", "Pending", "Approved", "Declined"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-black uppercase tracking-widest transition-all pb-1.5 border-b-2 ${
                  activeTab === tab 
                    ? "text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400" 
                    : "text-slate-400 dark:text-slate-550 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
            {isLoading && <ArrowPathIcon className="h-4 w-4 animate-spin text-slate-400 self-center" />}
          </div>

          {/* Layout Mode Toggles */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 self-start md:self-auto">
            <button 
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                viewMode === "list" 
                  ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-200/50 dark:border-slate-800" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
              }`}
            >
              List View
            </button>
            <button 
              onClick={toggleView}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                viewMode === "calendar" 
                  ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-200/50 dark:border-slate-800" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Central Display Layer */}
        {viewMode === "list" ? (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-20 text-center text-slate-400 dark:text-slate-500 text-xs italic shadow-sm">
                No leave logs recorded for this category parameters.
              </div>
            ) : (
              requests.map((req: LeaveRequest) => (
                <div 
                  key={req.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-md dark:hover:border-slate-750 transition-all shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Member Profile block */}
                    <div className="flex items-center gap-4 lg:w-1/4">
                      <div className="h-12 w-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-950 dark:text-white leading-snug">{req.user?.name || "Anonymous Member"}</h4>
                        <span className="text-[8px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-50/50 dark:bg-violet-950/20 px-2 py-0.5 rounded border border-violet-100 dark:border-violet-900/30">
                          {req.type}
                        </span>
                      </div>
                    </div>

                    {/* Operational Details Map */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-12 flex-1">
                      <div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-550 uppercase font-black tracking-wider">Duration</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-250 mt-0.5">{req.daysRequested} Days</p>
                      </div>
                      
                      <div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-550 uppercase font-black tracking-wider">Start Target</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-250 mt-0.5">
                          {new Date(req.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>

                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[9px] text-slate-400 dark:text-slate-550 uppercase font-black tracking-wider">Backup Assignee</p>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate max-w-[140px]">
                          {req.backupStaff?.user?.name || "Unassigned"}
                        </p>
                      </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center gap-3 lg:ml-auto">
                      <button className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-850 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-xl transition-all">
                        <ChatBubbleLeftRightIcon className="h-4.5 w-4.5" />
                      </button>

                      {req.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(req.id, "DECLINED")}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-200/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-450 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            <XCircleIcon className="h-4 w-4" /> Decline
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            <CheckCircleIcon className="h-4 w-4" /> Approve
                          </button>
                        </div>
                      ) : (
                        <div className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${
                          req.status === "APPROVED" 
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-450" 
                            : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-450"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${req.status === "APPROVED" ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {req.status}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <LeaveCalendarView events={calendarData} companyId={companyId} />
          </div>
        )}
      </div>

      <PolicySettingsModal 
        isOpen={isPolicyModalOpen} 
        onClose={() => setIsPolicyModalOpen(false)} 
        companyId={companyId}
      />

      <PostLeaveModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        companyId={companyId}
        onSuccess={refreshData}
      />
    </main>
  );
};

export default LeaveManagementClient;