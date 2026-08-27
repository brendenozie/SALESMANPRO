"use client";

import React, { useState, useEffect } from "react";
import { 
  ClockIcon, 
  MapPinIcon, 
  CheckCircleIcon, 
  FingerPrintIcon,
  ArrowPathIcon, 
  ArrowUpRightIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import ManualClockModal from "./ManualClockModal";

interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
  total: number;
}

interface AttendanceLog {
  id: string;
  user?: {
    name?: string;
  };
  method: "BIOMETRIC" | "MANUAL" | "GPS" | string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "PRESENT" | "LATE" | "ABSENT" | string;
}

interface StaffAttendanceClientProps {
  initialData: {
    logs?: AttendanceLog[];
    stats?: AttendanceStats;
  };
  initialStaff: any[];
  schoolId: string;
}

const StaffAttendanceClient = ({ initialData, initialStaff, schoolId }: StaffAttendanceClientProps) => {
  const [view, setView] = useState("Daily");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [logs, setLogs] = useState<AttendanceLog[]>(initialData?.logs || []);
  const [stats, setStats] = useState<AttendanceStats>(
    initialData?.stats || { present: 0, late: 0, absent: 0, total: 0 }
  );
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Sync systemic theme wrapper with document standard
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/attendance?companyId=${schoolId}`);
      if (!res.ok) throw new Error("Connection error");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setStats(data.stats);
        toast.success("Attendance intelligence feed updated");
      }
    } catch (err) {
      toast.error("Failed to sync live presence data");
      console.error("Refresh failed", err);
    } finally {
      setRefreshing(false);
    }
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
        
        {/* Actions Utilities Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Biometric & Attendance Operations
            </span>
          </div>
          
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-lime-500 dark:hover:text-lime-400 transition-all shadow-sm"
            aria-label="Toggle structural light/dark themes"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button> */}
        </div>

        {/* Header Action Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lime-600 dark:text-lime-400 text-[10px] font-black uppercase tracking-[0.2em]">Presence & Tracking</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Attendance Intelligence
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm font-medium">
              Analyze biometric hardware logs, record overrides, and view live terminal status maps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            {/* View switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
              {["Daily", "Weekly", "Monthly"].map((period) => (
                <button 
                  key={period}
                  onClick={() => setView(period)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    view === period 
                      ? "bg-white dark:bg-slate-900 text-lime-600 dark:text-lime-400 shadow-sm border border-slate-200/50 dark:border-slate-800" 
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                  }`}
                > 
                  {period} 
                </button>
              ))}
            </div>

            {/* Manual entry key action */}
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-5 py-3 bg-slate-950 dark:bg-slate-950 hover:bg-slate-900 border border-slate-850 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <PlusIcon className="h-4 w-4 stroke-[3]" /> Override Entry
            </button>
          </div>
        </header>

        {/* Real-time Status KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Present */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl border-l-4 border-l-emerald-500 shadow-sm flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Present Now</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">
                {stats.present.toString().padStart(2, "0")}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wide bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 w-fit">
              <CheckCircleIcon className="h-3 w-3" /> {Math.round((stats.present / (stats.total || 1)) * 100)}% of Staff
            </span>
          </div>

          {/* Late Arrivals */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl border-l-4 border-l-amber-500 shadow-sm flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Late Arrivals</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">
                {stats.late.toString().padStart(2, "0")}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wide bg-amber-50/50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/30 w-fit">
              <ClockIcon className="h-3 w-3" /> Requires Check
            </span>
          </div>

          {/* Absent */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl border-l-4 border-l-rose-500 shadow-sm flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Absent</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">
                {stats.absent.toString().padStart(2, "0")}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-rose-700 dark:text-rose-450 font-bold uppercase tracking-wide bg-rose-50/50 dark:bg-rose-950/20 px-2.5 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/30 w-fit">
              <UserGroupIcon className="h-3 w-3" /> Check Leave Requests
            </span>
          </div>

          {/* Average */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl border-l-4 border-l-blue-500 shadow-sm flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Avg Clock-in</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">07:42 AM</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide bg-blue-50/50 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30 w-fit">
              <CalendarDaysIcon className="h-3 w-3" /> Target: 08:00 AM
            </span>
          </div>
        </div>

        {/* Live Logs Section wrapper */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-lime-500 animate-ping" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">Live Roster Activity</h3>
            </div>
            <button 
              onClick={refreshData}
              disabled={refreshing}
              className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 flex items-center gap-1.5 transition-colors"
            >
              <ArrowPathIcon className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> 
              {refreshing ? "Syncing..." : "Sync Feed"}
            </button>
          </div>

          {/* --- DESKTOP TABLE VIEW --- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest border-b border-slate-150 dark:border-slate-850">
                  <th className="p-6">Staff Member</th>
                  <th className="p-6">Method</th>
                  <th className="p-6">Check In</th>
                  <th className="p-6">Check Out</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                      No hardware terminal activity recorded for this period.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: AttendanceLog) => (
                    <tr key={log.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="p-6">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{log.user?.name || "Unknown Roster Profile"}</p>
                          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-650">UID: {log.id.substring(0, 8)}</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          {log.method === "BIOMETRIC" ? (
                            <FingerPrintIcon className="h-4 w-4 text-blue-500" />
                          ) : (
                            <MapPinIcon className="h-4 w-4 text-slate-400 dark:text-slate-650" />
                          )}
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide">{log.method}</span>
                        </div>
                      </td>
                      <td className="p-6 font-mono text-xs text-slate-650 dark:text-slate-350">{log.checkInTime || "--:--"}</td>
                      <td className="p-6 font-mono text-xs text-slate-650 dark:text-slate-350">{log.checkOutTime || "--:--"}</td>
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                          log.status === "PRESENT" 
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-250/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                            : log.status === "LATE" 
                            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-250/50 dark:border-amber-900/30 text-amber-700 dark:text-amber-400" 
                            : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-500"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            log.status === "PRESENT" ? "bg-emerald-500" : log.status === "LATE" ? "bg-amber-500" : "bg-slate-400"
                          }`} />
                          {log.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button className="p-2 text-slate-400 dark:text-slate-600 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition-all">
                          <ArrowUpRightIcon className="h-4 w-4 stroke-[2.5]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- MOBILE CARDS VIEW --- */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-850">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 dark:text-slate-550 text-xs italic">
                No hardware terminal activity recorded for this period.
              </div>
            ) : (
              logs.map((log: AttendanceLog) => (
                <div key={log.id} className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-950 dark:text-white">{log.user?.name || "Unknown Profile"}</h4>
                      <p className="text-[9px] font-mono text-slate-400 dark:text-slate-600 mt-0.5">UID: {log.id.substring(0, 8)}</p>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      log.status === "PRESENT" 
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-250/55 dark:border-emerald-900/30 text-emerald-755 dark:text-emerald-400" 
                        : log.status === "LATE" 
                        ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-250/55 dark:border-amber-900/30 text-amber-755 dark:text-amber-400" 
                        : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-500"
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-3">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Arrival check-in</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{log.checkInTime || "--:--"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Departure check-out</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{log.checkOutTime || "--:--"}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-3">
                    <div className="flex items-center gap-1.5">
                      {log.method === "BIOMETRIC" ? (
                        <FingerPrintIcon className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-550">{log.method} Verification</span>
                    </div>

                    <button className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg">
                      <ArrowUpRightIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <ManualClockModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        companyId={schoolId}
        initialStaff={initialStaff}
        onSuccess={refreshData}
      />
    </main>
  );
};

export default StaffAttendanceClient;