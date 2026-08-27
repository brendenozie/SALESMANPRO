"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
  BeakerIcon, 
  CurrencyDollarIcon, 
  TruckIcon, 
  ChartBarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  BoltIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface FuelLogsClientProps {
  initialData: {
    logs: any[];
    vehicles: any[];
  };
  schoolId: string;
}

const FuelLogsClient = ({ initialData, schoolId }: FuelLogsClientProps) => {
  const [logs, setLogs] = useState<any[]>(initialData.logs || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Form State
  const [formData, setFormData] = useState({
    vehicleId: "",
    quantity: "",
    cost: "",
    odometer: "",
    station: "",
    date: format(new Date(), "yyyy-MM-dd")
  });

  // Sync and configure Light/Dark styles
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

  // Safe KPI calculations extracting volumes and costs
  const getNumericVolume = (val: any) => {
    if (typeof val === "string") {
      return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
    }
    return Number(val) || 0;
  };

  const totalSpent = logs.reduce((acc: number, log: any) => acc + (Number(log.cost) || 0), 0);
  const totalVolume = logs.reduce((acc: number, log: any) => acc + getNumericVolume(log.quantity || log.volume), 0);
  const averagePricePerLitre = totalVolume > 0 ? (totalSpent / totalVolume) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        cost: parseFloat(formData.cost),
        odometer: parseInt(formData.odometer, 10)
      };

      const res = await fetch(`/api/admin/transport/fuel?companyId=${schoolId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      
      if (result.success) {
        setLogs([result.data, ...logs]);
        setIsModalOpen(false);
        toast.success("Log synchronized with Fleet Command");
        // Reset state
        setFormData({
          vehicleId: "",
          quantity: "",
          cost: "",
          odometer: "",
          station: "",
          date: format(new Date(), "yyyy-MM-dd")
        });
      } else {
        toast.error(result.message || "Failed to persist refuel entry.");
      }
    } catch (error) {
      toast.error("Network synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  // Browser-driven dynamic CSV Export
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error("No refueling entries found to export.");
      return;
    }
    const headers = ["ID,Date,Vehicle,Station,Odometer,Quantity,Total Cost\n"];
    const rows = logs.map((log: any) => {
      const id = log.id || "N/A";
      const date = log.date || "N/A";
      const vehicle = log.vehicle?.registration || log.vehicle || "N/A";
      const station = log.station || "N/A";
      const odometer = log.odometer || "N/A";
      const qty = log.quantity || log.volume || 0;
      const cost = log.cost || 0;
      return `"${id}","${date}","${vehicle}","${station.replace(/"/g, '""')}","${odometer}","${qty}",${cost}`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows.join("\n")).join("");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_fuel_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fuel dataset exported successfully");
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Fuel Gradient Ambient Light */}
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/[0.03] blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Resource Consumption</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fuel <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-cyan-400">Intelligence.</span>
            </h1>
          </div>

          <div className="flex gap-3 w-full md:w-auto justify-end items-center">
            {/* Dark & Light mode toggle */}
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
              <DocumentArrowDownIcon className="h-4 w-4" />
              Download Report
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
            >
              <BeakerIcon className="h-4 w-4" />
              Log Refuel
            </button>
          </div>
        </header>

        {/* Consumption Efficiency Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Avg Price */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Avg. Price/Litre</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                ${averagePricePerLitre.toFixed(2)}
              </h3>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] mt-2 font-bold">
                <ArrowTrendingDownIcon className="h-3 w-3" />
                Optimal rate locked
              </div>
            </div>
            <BoltIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/[0.03] dark:text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors pointer-events-none" />
          </div>

          {/* Card 2: Total Volume */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Volume Logged</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 1 })} Litres
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider italic">Fleet Wide consumption</p>
            </div>
            <ChartBarIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/[0.03] dark:text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors pointer-events-none" />
          </div>

          {/* Card 3: Total Expenditure */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Expenditure</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider">Settled Fleet invoices</p>
            </div>
            <CurrencyDollarIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/[0.03] dark:text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors pointer-events-none" />
          </div>
        </div>

        {/* Logs Table Area */}
        <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 rounded-[2.2rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-emerald-500" />
              Recent Refueling Entries
            </h3>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Live Sync Active</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-800/50">
                  <th className="p-6">Timestamp</th>
                  <th className="p-6">Vehicle</th>
                  <th className="p-6">Station / Vendor</th>
                  <th className="p-6">Odometer</th>
                  <th className="p-6">Quantity</th>
                  <th className="p-6 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                {logs.map((log: any) => {
                  const displayQuantity = typeof log.quantity === "number" ? `${log.quantity}L` : log.quantity || log.volume;
                  return (
                    <tr key={log.id} className="hover:bg-emerald-500/[0.01] dark:hover:bg-emerald-500/[0.02] transition-colors group">
                      <td className="p-6">
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{log.date}</p>
                        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-600 mt-0.5">
                          {log.id ? log.id.slice(-6).toUpperCase() : "FL-NEW"}
                        </p>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <TruckIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {log.vehicle?.registration || log.vehicle || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {log.station || "Commercial Station"}
                      </td>
                      <td className="p-6 font-mono text-xs text-slate-500">
                        {log.odometer ? `${Number(log.odometer).toLocaleString()} km` : "—"}
                      </td>
                      <td className="p-6">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-xl border border-emerald-500/20">
                          {displayQuantity}
                        </span>
                      </td>
                      <td className="p-6 text-right font-black text-sm text-slate-900 dark:text-white">
                        ${(Number(log.cost) || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <BeakerIcon className="h-12 w-12 text-slate-300 dark:text-slate-800 mx-auto mb-4" />
                      <p className="text-slate-400 dark:text-slate-500 font-bold italic text-sm">
                        No localized refueling entries logged yet.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- RECORD REFUELLING MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" 
            onClick={() => !loading && setIsModalOpen(false)} 
          />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic">Record Fuel Log</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Direct Refuel Dispatch</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Fleet Unit */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Fleet Unit</label>
                <select 
                  required 
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer appearance-none"
                >
                  <option value="">Select Fleet Registration</option>
                  {initialData.vehicles?.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.registration} — {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Station Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Station / Provider</label>
                <input 
                  type="text" 
                  placeholder="e.g. Shell Central, Chevron Fleet Yard" 
                  required
                  value={formData.station}
                  onChange={(e) => setFormData({...formData, station: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Litres and Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Volume (Liters)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Total Cost ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Date and Odometer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Odometer (km)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 14500" 
                    required
                    value={formData.odometer}
                    onChange={(e) => setFormData({...formData, odometer: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Refuel Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none dark:color-scheme-dark" 
                  />
                </div>
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
                  className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <BoltIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Log"
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

export default FuelLogsClient;