"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarIcon, CheckCircleIcon, XCircleIcon, 
  ChatBubbleLeftRightIcon, UserIcon, ArrowPathIcon, 
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";
import PolicySettingsModal from "./PolicySettingsModal";
import PostLeaveModal from "./PostLeaveModal";
import LeaveCalendarView from "./LeaveCalendarView";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";


const LeaveManagementClient = ({ companyId, initialRequests }: any) => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [requests, setRequests] = useState(initialRequests || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarData, setCalendarData] = useState([]);
  
  const [conflicts, setConflicts] = useState<Record<string, string[]>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch calendar data when switching modes
  const toggleView = async () => {
    if (viewMode === "list") {
      const res = await fetch(`/api/admin/leave/calendar?companyId=${companyId}`);
      const json = await res.json();
      setCalendarData(json.data);
      setViewMode("calendar");
    } else {
      setViewMode("list");
    }
  };  

  // Fetch data when tab changes
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      const res = await fetch(`/api/admin/leave?companyId=${companyId}&status=${activeTab}`);
      const json = await res.json();
      setRequests(json.data || []);
      setIsLoading(false);
    };
    fetchRequests();
  }, [activeTab, companyId]);

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    const res = await fetch("/api/admin/leave", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status: newStatus }),
    });

    if (res.ok) {
      // Optimistically update UI or refresh
      setRequests(requests.filter((r: any) => r.id !== requestId));
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    const res = await fetch(`/api/admin/leave?companyId=${companyId}&status=${activeTab}`);
    const json = await res.json();
    setRequests(json.data || []);
    setIsLoading(false);
  }

  useEffect(() => {
      fetch(`/api/admin/leave/conflicts?companyId=${companyId}`)
        .then(res => res.json())
        .then(data => setConflicts(data.conflicts));
    }, [currentMonth, companyId]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-violet-500 rounded-full" />
              <span className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em]">Workforce Continuity</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Leave <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Governance.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button onClick={() => setIsPolicyModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <CalendarIcon className="h-4 w-4" /> Policy Settings
             </button>
             <button onClick={() => setIsPostModalOpen(true)} className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-violet-900/40">
                Post Leave Request
             </button>
          </div>
        </header>

        {/* Continuity & Availability KPIs (Now Dynamic) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-[2.5rem] mt-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldExclamationIcon className="h-5 w-5 text-rose-500" />
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Upcoming Continuity Risks</h4>
            </div>
            <ul className="space-y-3">
              {Object.entries((conflicts && conflicts.length > 0 && conflicts) || []).slice(0, 3).map(([date, depts]) => (
                <li key={date} className="flex justify-between items-center text-[10px]">
                  <span className="font-mono text-slate-400">{format(new Date(date), 'MMM dd')}</span>
                  <span className="font-bold text-rose-400">{depts.join(", ")} Critical</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Currently on Leave</p>
             <h3 className="text-3xl font-black text-white mt-1">12 Staff</h3>
             <p className="mt-4 text-[10px] text-violet-400 font-bold uppercase">Dynamic Metric</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-l-4 border-l-amber-500">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Approvals</p>
             <h3 className="text-3xl font-black text-amber-500 mt-1">{requests.length} Requests</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium">Action Required</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Continuity Risk</p>
             <h3 className="text-3xl font-black text-emerald-500 mt-1">Low</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium italic">Safety checks enabled</p>
          </div>
        </div>

        {/* Requests Filter */}
        <div className="flex gap-6 mb-8 border-b border-slate-800 pb-4">
           {['All', 'Pending', 'Approved', 'Declined'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-violet-400' : 'text-slate-600 hover:text-slate-300'}`}
             >
               {tab}
             </button>
           ))}
           {isLoading && <ArrowPathIcon className="h-4 w-4 animate-spin text-slate-500" />}
        </div>

        <div className="flex justify-end mb-4">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1">
            <button 
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              List
            </button>
            <button 
              onClick={toggleView}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'calendar' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Leave Request List */}
        {viewMode === "list" ? (
          <div className="space-y-4">
            {requests.map((req: any) => (
              <div key={req.id} className="group bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-900/40 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  <div className="flex items-center gap-6 lg:w-1/4">
                    <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-violet-400">
                      <UserIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-md font-bold text-white italic">{req.user?.name}</h4>
                      <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">{req.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Duration</p>
                        <p className="text-sm font-black text-slate-200">{req.daysRequested} Days</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Starts On</p>
                        <p className="text-sm font-black text-slate-200">{new Date(req.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Backup Assigned</p>
                        <p className="text-sm font-bold text-indigo-400">{req.backupStaff?.user?.name || 'None'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                    <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    </button>
                    {req.status === 'PENDING' ? (
                      <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(req.id, 'DECLINED')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase transition-all"
                          >
                            <XCircleIcon className="h-4 w-4" /> Decline
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                          >
                            <CheckCircleIcon className="h-4 w-4" /> Approve
                          </button>
                      </div>
                    ) : (
                      <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                          <CheckCircleIcon className="h-4 w-4" /> {req.status}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
            {requests.length === 0 && !isLoading && (
              <div className="text-center py-20 text-slate-600 italic text-sm">No leave requests found for this category.</div>
            )}
          </div>
        ) : (
          <LeaveCalendarView events={calendarData} companyId={companyId} />
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
        onSuccess={refreshData} // Ensure this triggers your data refetch
      />
    </main>
  );
};

export default LeaveManagementClient;