"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  WrenchIcon, 
  LightBulbIcon, 
  BeakerIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  SunIcon,
  MoonIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import FileRequestModal from "./FileRequestModal";

interface Props {
  initialTickets: any[];
  rooms: any[];
  schoolId: string;
}

const MaintenancePageClient = ({ initialTickets, rooms, schoolId }: Props) => {
  const [tickets, setTickets] = useState(initialTickets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all tickets");
  const [darkMode, setDarkMode] = useState(false);

  // Sync state with HTML class list for seamless light/dark mode transitions
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Category Icon Helper with explicit fallback safety
  const getIcon = (category: string) => {
    const iconClass = "h-5 w-5";
    switch (category?.toUpperCase()) {
      case "PLUMBING": 
        return <BeakerIcon className={iconClass} />;
      case "ELECTRICAL": 
        return <LightBulbIcon className={iconClass} />;
      case "STRUCTURAL": 
        return <WrenchIcon className={iconClass} />;
      default: 
        return <WrenchIcon className={iconClass} />;
    }
  };

  // Memoized Filtering Logic for performance
  const filteredTickets = useMemo(() => {
    if (filter === "all tickets") return tickets;
    if (filter === "active") return tickets.filter((t: any) => t.status !== "COMPLETED");
    if (filter === "high priority") return tickets.filter((t: any) => t.priority === "HIGH");
    if (filter === "completed") return tickets.filter((t: any) => t.status === "COMPLETED");
    return tickets;
  }, [tickets, filter]);

  // Network State mutation: PATCH update
  const updateStatus = async (ticketId: string, newStatus: string) => {
    const promise = fetch(`/api/admin/hostel/maintenance/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
      headers: { "Content-Type": "application/json" }
    });

    toast.promise(promise, {
      loading: `Transitioning ticket to ${newStatus.replace("_", " ")}...`,
      success: (res) => {
        if (!res.ok) throw new Error("Failed validation check");
        setTickets((prev: any) => 
          prev.map((t: any) => t.dbId === ticketId ? { ...t, status: newStatus } : t)
        );
        return `Ticket status updated to ${newStatus.replace("_", " ")}`;
      },
      error: "Could not update status. Please try again."
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 p-4 md:p-8 lg:p-12 font-sans transition-colors duration-200 selection:bg-orange-600 selection:text-white">
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Operations Center
            </span>
          </div>
          
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-all shadow-sm"
            aria-label="Toggle structural theme layout"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button> */}
        </div>

        {/* Master Control Header Panel */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">Facility Upkeep</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Service Tickets
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm font-medium">
              Monitor, categorize, and complete building maintenance issues, facility renovations, and safety check requests.
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm shadow-orange-950/10"
          >
            <PlusIcon className="h-4 w-4 stroke-[3px]" />
            File New Request
          </button>
        </header>

        {/* Interactive Filters Grid Layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Filter Registry</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "All Tickets", value: "all tickets" },
              { label: "Active", value: "active" },
              { label: "High Priority", value: "high priority" },
              { label: "Completed", value: "completed" }
            ].map((tab) => (
              <button 
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  filter === tab.value 
                    ? "bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 border-slate-950 dark:border-slate-100" 
                    : "bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Structured Ticket Directory List */}
        <div className="space-y-3.5">
          {filteredTickets.map((tkt: any) => {
            const isHigh = tkt.priority === "HIGH";
            const isMed = tkt.priority === "MEDIUM";
            
            // Priority structural indicator colors (Strictly Solid)
            const borderIndicatorColor = isHigh 
              ? "border-rose-500" 
              : isMed 
                ? "border-amber-500" 
                : "border-blue-500";

            return (
              <div 
                key={tkt.dbId} 
                className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 border-l-4 ${borderIndicatorColor} transition-all hover:bg-slate-50/50 dark:hover:bg-slate-950/10 shadow-sm`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  
                  {/* Service Ticket Context and Details */}
                  <div className="flex items-start gap-4 w-full lg:w-3/4">
                    <div className="h-12 w-12 bg-slate-100 dark:bg-slate-950 text-orange-600 dark:text-orange-500 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0">
                      {getIcon(tkt.category)}
                    </div>
                    
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-550 tracking-wider">
                          #{tkt.id}
                        </span>
                        <span className="h-1 w-1 bg-slate-350 dark:bg-slate-700 rounded-full" />
                        <span className="text-[10px] font-bold text-orange-650 dark:text-orange-500 uppercase tracking-wider">
                          Room {tkt.room}
                        </span>
                        <span className="h-1 w-1 bg-slate-350 dark:bg-slate-700 rounded-full" />
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                          isHigh 
                            ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40" 
                            : isMed 
                              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40" 
                              : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40"
                        }`}>
                          {tkt.priority} Priority
                        </span>
                      </div>
                      
                      <h4 className="text-base font-bold text-slate-950 dark:text-white leading-tight">
                        {tkt.issue}
                      </h4>
                      
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        Reported by: <span className="text-slate-550 dark:text-slate-450">{tkt.reportedBy?.name || "Resident"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t border-slate-100 dark:border-slate-850 pt-4 lg:pt-0 lg:border-none">
                    <div className={`px-3 py-1.5 rounded-lg border text-[8px] font-bold uppercase tracking-wider ${
                      tkt.status === "IN_PROGRESS" 
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400" 
                        : tkt.status === "PENDING" 
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400" 
                          : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {tkt.status.replace("_", " ")}
                    </div>
                    
                    {tkt.status !== "COMPLETED" && (
                      <button 
                        onClick={() => updateStatus(tkt.dbId, "COMPLETED")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]">
              <p className="text-sm font-bold text-slate-400 dark:text-slate-655">No service tickets matching this filter</p>
            </div>
          )}
        </div> 
      </div>

      {isModalOpen && (
        <FileRequestModal 
          rooms={rooms} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newTkt: any) => {
            setTickets([newTkt, ...tickets]);
            setIsModalOpen(false);
          }}
        />
      )}
    </main>
  );
};

export default MaintenancePageClient;