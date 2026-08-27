"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
  UserPlusIcon, 
  IdentificationIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  UserIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";
import CheckInModal from "./CheckInModal";

const OVERSTAY_THRESHOLD_MINUTES = 240; // 4 Hours

interface VisitorLog {
  id: string;
  name: string;
  status: "ACTIVE" | "CHECKED_OUT";
  checkIn: string;
  checkOut: string | null;
  relation: string;
  idType?: string;
  idImageUrl?: string;
  student?: {
    firstName?: string;
    user?: { name?: string };
  };
  educator?: {
    firstName?: string;
    user?: { name?: string };
  };
}

interface VisitorsPageClientProps {
  initialLogs?: VisitorLog[];
  schoolId: string;
}

const checkOverstay = (checkIn: string, checkOut: string | null): boolean => {
  if (checkOut) return false;
  const start = new Date(checkIn).getTime();
  const now = new Date().getTime();
  return (now - start) / 60000 > OVERSTAY_THRESHOLD_MINUTES;
};

const getDuration = (checkIn: string, checkOut: string | null): string => {
  const start = new Date(checkIn).getTime();
  const end = checkOut ? new Date(checkOut).getTime() : new Date().getTime();
  const diffInMinutes = Math.floor((end - start) / 60000);
  
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const hours = Math.floor(diffInMinutes / 60);
  const mins = diffInMinutes % 60;
  return `${hours}h ${mins}m`;
};

const VisitorsPageClient = ({ initialLogs = [], schoolId }: VisitorsPageClientProps) => {
  const [logs, setLogs] = useState<VisitorLog[]>(initialLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "CHECKED_OUT">("ALL");

  const handleCheckOut = async (id: string) => {
    const promise = fetch("/api/admin/hostel/visitors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    toast.promise(promise, {
      loading: 'Recording departure...',
      success: () => {
        setLogs((current) => 
          current.map((l) => l.id === id ? { ...l, status: 'CHECKED_OUT', checkOut: new Date().toISOString() } : l)
        );
        return "Visitor checked out successfully.";
      },
      error: 'Update failed.'
    });
  };

  // Memoized stats for optimal performance
  const stats = useMemo(() => {
    const inPremise = logs.filter((l) => l.status === 'ACTIVE').length;
    const overstayCount = logs.filter((l) => l.status === 'ACTIVE' && checkOverstay(l.checkIn, l.checkOut)).length;
    return {
      inPremise,
      overstayCount,
      todayTotal: logs.length
    };
  }, [logs]);

  // Alert system for overstaying visitors
  useEffect(() => {
    const checkAllOverstays = () => {
      const overstayers = logs.filter((l) => l.status === 'ACTIVE' && checkOverstay(l.checkIn, l.checkOut));
      if (overstayers.length > 0) {
        toast.error(`Security Alert: ${overstayers.length} visitor(s) exceed the 4-hour limit!`, {
          icon: '🚨',
          duration: 6000,
        });
      }
    };

    checkAllOverstays(); // Initial check
    const interval = setInterval(checkAllOverstays, 60000);
    return () => clearInterval(interval);
  }, [logs]);

  // Search & Filter combined logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.relation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [logs, searchTerm, statusFilter]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-6 md:p-8 font-sans transition-colors duration-200">
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm shadow-xl",
        }} 
      />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-blue-600 dark:bg-blue-500 rounded-full" />
              <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
                Security Operations
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Visitor Registry
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monitor, register, and log campus visits in real time.
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-900/10 dark:shadow-none"
          >
            <UserPlusIcon className="h-4 w-4" />
            Check-In Visitor
          </button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Stat Item 1 */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Premise</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stats.inPremise.toString().padStart(2, '0')} Guests
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <UserIcon className="h-6 w-6" />
            </div>
          </div>

          {/* Stat Item 2 */}
          <div className={`bg-white dark:bg-[#111827] border p-6 rounded-2xl flex items-center justify-between shadow-sm transition-all ${
            stats.overstayCount > 0 
              ? 'border-red-200 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10' 
              : 'border-slate-200 dark:border-slate-800/80'
          }`}>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overstay Alert</p>
              <h3 className={`text-3xl font-bold tracking-tight ${
                stats.overstayCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
              }`}>
                {stats.overstayCount.toString().padStart(2, '0')} Warnings
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${
              stats.overstayCount > 0 
                ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' 
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400'
            }`}>
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
          </div>

          {/* Stat Item 3 */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Total</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stats.todayTotal.toString().padStart(2, '0')} Entries
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
          </div>
        </section>

        {/* Search, Filter, and Table Container */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Control Bar */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-50/50 dark:bg-[#111827]/50">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Activity Log</h3>
              
              {/* Quick Status Filters */}
              <div className="flex border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-white dark:bg-slate-900">
                {(["ALL", "ACTIVE", "CHECKED_OUT"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      statusFilter === filter
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {filter === "ALL" ? "All" : filter === "ACTIVE" ? "In Premise" : "Departed"}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                placeholder="Search by name or relation..." 
              />
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6">Visitor Details</th>
                  <th className="py-4 px-6">Host/Target</th>
                  <th className="py-4 px-6">ID Credentials</th>
                  <th className="py-4 px-6">Time Stats</th>
                  <th className="py-4 px-6 text-right">Departure Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800/40">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const isOverstaying = checkOverstay(log.checkIn, log.checkOut);
                    const visitingUser = log.student || log.educator;
                    const isStaffVisit = !!log.educator;

                    return (
                      <tr 
                        key={log.id} 
                        className={`transition-colors duration-150 ${
                          isOverstaying 
                            ? 'bg-red-500/[0.04] dark:bg-red-500/[0.02] border-l-4 border-l-red-500' 
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                        }`}
                      >
                        {/* Visitor Profile Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                              {log.idImageUrl ? (
                                <img src={log.idImageUrl} className="h-full w-full object-cover" alt={`${log.name}'s ID`} />
                              ) : (
                                <CameraIcon className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{log.name}</p>
                              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                                Ref: {log.id.slice(-6).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Visit Target */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{log.relation}</span>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold uppercase tracking-wider">
                              {isStaffVisit ? (
                                <>
                                  <AcademicCapIcon className="h-3.5 w-3.5 text-amber-500" /> 
                                  <span className="text-amber-600 dark:text-amber-400">
                                    {visitingUser?.firstName || visitingUser?.user?.name || "Staff Member"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <UserIcon className="h-3.5 w-3.5 text-blue-500" /> 
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {visitingUser?.firstName || visitingUser?.user?.name || "Student"}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ID Type */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <IdentificationIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                              {log.idType || "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Time and Duration */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <ClockIcon className={`h-4 w-4 ${isOverstaying ? 'text-red-500' : 'text-slate-400'}`} />
                              <span className={`text-sm font-semibold ${isOverstaying ? 'text-red-600 dark:text-red-400' : 'text-slate-950 dark:text-slate-200'}`}>
                                {getDuration(log.checkIn, log.checkOut)}
                              </span>
                            </div>
                            {isOverstaying && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">
                                🚨 Overstay Limit Exceeded
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Checkout Departure Action */}
                        <td className="py-4 px-6 text-right">
                          {log.status === 'ACTIVE' ? (
                            <button 
                              onClick={() => handleCheckOut(log.id)}
                              className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/30 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/40 rounded-xl text-xs font-bold transition-all"
                            >
                              <ArrowRightStartOnRectangleIcon className="h-3.5 w-3.5" />
                              Check Out
                            </button>
                          ) : (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <ShieldCheckIcon className="h-4 w-4" /> Departed
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-full text-slate-400 dark:text-slate-500">
                          <FunnelIcon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">No visitors match your criteria</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Try adjusting your active filters or clear search term to view all registered logs.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CheckInModal 
          schoolId={schoolId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newLog: VisitorLog) => setLogs((prev) => [newLog, ...prev])}
        />
      )}
    </main>
  );
};

export default VisitorsPageClient;