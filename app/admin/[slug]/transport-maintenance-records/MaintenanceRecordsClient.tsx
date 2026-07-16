"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  WrenchScrewdriverIcon, 
  ClipboardDocumentListIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  CogIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";
import { format, startOfMonth } from "date-fns";

interface MaintenanceRecordsClientProps {
  initialData: {
    records: any[];
    vehicles: any[];
  };
  schoolId: string;
}

const MaintenanceRecordsClient = ({ initialData, schoolId }: MaintenanceRecordsClientProps) => {
  const [records, setRecords] = useState(initialData.records || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Form States
  const [formData, setFormData] = useState({
    vehicleId: "",
    description: "",
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    cost: "",
    status: "SCHEDULED"
  });

  // Sync / Configure Light and Dark theme toggles
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Dynamic calculations based on state records
  const activeRepairs = records.filter(
    (r: any) => r.status === "IN_PROGRESS" || r.status === "In Progress"
  ).length;

  const monthlySpend = records
    .filter((r: any) => new Date(r.scheduledDate || r.date) >= startOfMonth(new Date()))
    .reduce((acc: number, r: any) => acc + (Number(r.cost) || 0), 0);

  // Fallback calculation for Fleet Health
  const totalVehiclesCount = initialData.vehicles?.length || 10;
  const optimalPercentage = Math.max(0, Math.min(100, Math.round(((totalVehiclesCount - activeRepairs) / totalVehiclesCount) * 100)));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transport/maintenance?companyId=${schoolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setRecords([result.data, ...records]);
        setIsModalOpen(false);
        toast.success("Maintenance event synchronized");
        // Reset form
        setFormData({
          vehicleId: "",
          description: "",
          scheduledDate: format(new Date(), "yyyy-MM-dd"),
          cost: "",
          status: "SCHEDULED"
        });
      } else {
        toast.error(result.message || "Failed to log event");
      }
    } catch (err) {
      toast.error("System sync failed");
    } finally {
      setLoading(false);
    }
  };

  // Browser-driven dynamic CSV Export
  const handleExportCSV = () => {
    if (records.length === 0) {
      toast.error("No maintenance records to export.");
      return;
    }
    const headers = ["ID,Vehicle,Description,Scheduled Date,Cost,Status,Technician\n"];
    const rows = records.map((r: any) => {
      const id = r.id || "N/A";
      const vehicle = r.vehicle?.registration || "Unknown";
      const desc = r.description || r.service || "N/A";
      const date = format(new Date(r.scheduledDate || r.date), "yyyy-MM-dd");
      const cost = r.cost || 0;
      const status = r.status || "N/A";
      const tech = r.technician || "N/A";
      return `"${id}","${vehicle}","${desc.replace(/"/g, '""')}","${date}",${cost},"${status}","${tech}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows.join("\n")).join("");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maintenance_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Log data exported successfully");
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "COMPLETED") {
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
    }
    if (s === "IN_PROGRESS" || s === "IN PROGRESS") {
      return "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400 animate-pulse";
    }
    return "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Mechanical Background Radial Grid */}
      <div 
        className="fixed top-0 right-0 w-full h-full opacity-[0.03] dark:opacity-[0.02] pointer-events-none -z-10" 
        style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 0)', backgroundSize: '40px 40px' }} 
      />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-orange-500 rounded-full" />
              <span className="text-orange-600 dark:text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">Asset Reliability</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Maintenance <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-500">Logs.</span>
            </h1>
          </div>

          <div className="flex gap-3 w-full md:w-auto justify-end items-center">
            {/* Theme Toggle */}
            {/* <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl transition-all shadow-sm active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-slate-600" />
              )}
            </button> */}

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-black text-xs active:scale-95 shadow-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export History
            </button>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-xs transition-all shadow-xl shadow-orange-500/10 active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" />
              New Entry
            </button>
          </div>
        </header>

        {/* Diagnostic KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* KPI 1 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl border-l-4 border-l-orange-500 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-orange-500/10 rounded-2xl text-orange-600 dark:text-orange-500">
                <CogIcon className="h-6 w-6 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Repairs</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {activeRepairs.toString().padStart(2, '0')} Vehicles
                </h3>
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl border-l-4 border-l-emerald-500 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500">
                <CheckBadgeIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fleet Health</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {optimalPercentage}% Optimal
                </h3>
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl border-l-4 border-l-blue-500 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-500">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Monthly Spend</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  ${monthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Table Grid */}
        <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 rounded-[2.2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Service ID</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Vehicle</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Service Detail</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Technician</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Cost</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {records.map((log: any) => {
                  const displayDate = log.scheduledDate || log.date;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors group">
                      <td className="p-6 font-mono text-xs text-slate-500">
                        {log.id ? log.id.slice(-6).toUpperCase() : "MNT-NEW"}
                      </td>
                      <td className="p-6 font-bold text-slate-900 dark:text-white">
                        {log.vehicle?.registration || log.vehicle || "N/A"}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <WrenchScrewdriverIcon className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {log.description || log.service}
                          </span>
                        </div>
                        {displayDate && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            {format(new Date(displayDate), "MMM dd, yyyy")}
                          </p>
                        )}
                      </td>
                      <td className="p-6 text-sm text-slate-600 dark:text-slate-400">
                        {log.technician || "Internal Fleet Staff"}
                      </td>
                      <td className="p-6 font-mono text-sm font-bold text-slate-800 dark:text-white">
                        ${(Number(log.cost) || 0).toFixed(2)}
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(log.status)}`}>
                          {(log.status === 'In Progress' || log.status === 'IN_PROGRESS') && (
                            <ArrowPathIcon className="h-3 w-3 animate-spin" />
                          )}
                          {log.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <ClipboardDocumentListIcon className="h-12 w-12 text-slate-300 dark:text-slate-800 mx-auto mb-4" />
                      <p className="text-slate-400 dark:text-slate-500 font-bold italic text-sm">
                        No service files recorded in this segment.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- SCHEDULE NEW SERVICE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" 
            onClick={() => !loading && setIsModalOpen(false)} 
          />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic">Schedule Service</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Asset Maintenance Registry</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Select Fleet Unit */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Fleet Unit</label>
                <select 
                  required 
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-orange-500 outline-none cursor-pointer appearance-none"
                >
                  <option value="">Select Fleet Registration</option>
                  {initialData.vehicles?.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.registration} — {v.make || ""} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Service Detail Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. System Overhaul, Oil Exchange" 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-orange-500 outline-none"
                />
              </div>

              {/* Date and cost metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Date scheduled</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-orange-500 outline-none dark:color-scheme-dark" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Estimated Cost</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-orange-500 outline-none" 
                  />
                </div>
              </div>

              {/* Status matrix Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Current Maintenance Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-orange-500 outline-none cursor-pointer"
                >
                  <option value="SCHEDULED">Scheduled / In Queue</option>
                  <option value="IN_PROGRESS">In Progress (Shop Floor)</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 px-6 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 py-3 px-6 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm Entry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default MaintenanceRecordsClient;