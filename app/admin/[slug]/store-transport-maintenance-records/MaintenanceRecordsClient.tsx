"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  WrenchScrewdriverIcon, 
  CurrencyDollarIcon,
  CheckBadgeIcon,
  CogIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { format, startOfMonth } from "date-fns";

const MaintenanceRecordsClient = ({ initialData, schoolId }: any) => {
  const [records, setRecords] = useState(initialData.records);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stats Calculations
  const activeRepairs = records.filter((r: any) => r.status === "IN_PROGRESS").length;
  const monthlySpend = records
    .filter((r: any) => new Date(r.scheduledDate) >= startOfMonth(new Date()))
    .reduce((acc: number, r: any) => acc + (Number(r.cost) || 0), 0);

  const [formData, setFormData] = useState({
    vehicleId: "",
    description: "",
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    cost: "",
    status: "SCHEDULED",
    technician: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transport/maintenance?companyId=${schoolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setRecords([result.data, ...records]);
        setIsModalOpen(false);
        toast.success("Maintenance event synchronized with fleet records");
        setFormData({ ...formData, description: "", cost: "", vehicleId: "" });
      }
    } catch (err) {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 md:p-8 font-sans transition-colors duration-300">
      <Toaster 
        position="top-right" 
        toastOptions={{ 
            className: 'bg-white dark:bg-[#0F1115] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl' 
        }} 
      />
      
      {/* Dynamic Background Pattern */}
      <div className="fixed top-0 right-0 w-full h-full opacity-[0.05] dark:opacity-[0.03] pointer-events-none -z-10" 
           style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-orange-500 rounded-full" />
              <span className="text-orange-600 dark:text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">Lifecycle Management</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Maintenance <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-400 dark:to-amber-500">Intelligence.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[1.2rem] text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white transition-all font-bold text-xs uppercase tracking-widest shadow-sm">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 active:scale-95"
            >
              <PlusIcon className="h-5 w-5 stroke-[3px]" />
              Initialize Service
            </button>
          </div>
        </header>

        {/* Diagnostic KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Active Workshops", val: activeRepairs.toString().padStart(2, '0'), unit: "Units", icon: CogIcon, color: "text-orange-500", bar: "bg-orange-500", progress: "w-1/3" },
            { label: "Fleet Readiness", val: "94.2%", unit: "Optimal", icon: CheckBadgeIcon, color: "text-emerald-500", bar: "bg-emerald-500", progress: "w-[94%]" },
            { label: "MTD Opex", val: `$${monthlySpend.toLocaleString(undefined, {minimumFractionDigits: 2})}`, unit: "", icon: CurrencyDollarIcon, color: "text-blue-500", bar: "bg-blue-500", progress: "w-1/2" }
          ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <kpi.icon className={`h-12 w-12 ${kpi.icon === CogIcon ? 'animate-spin-slow' : ''} ${kpi.color}`} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{kpi.val} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">{kpi.unit}</span></h3>
                <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${kpi.bar} ${kpi.progress}`} />
                </div>
            </div>
          ))}
        </div>

        {/* Log Matrix */}
        <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/40 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  {["Service ID", "Asset Unit", "Protocol Detail", "Assigned Tech", "Allocation", "Status"].map((th) => (
                    <th key={th} className="p-6 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                {records.map((log: any) => (
                  <tr key={log.id} className="hover:bg-orange-500/[0.03] dark:hover:bg-orange-500/[0.02] transition-colors group">
                    <td className="p-6">
                        <span className="font-mono text-[10px] text-slate-500 py-1 px-2 bg-slate-100 dark:bg-slate-800/40 rounded-md">
                            #{log.id.slice(-6).toUpperCase()}
                        </span>
                    </td>
                    <td className="p-6">
                        <div className="flex flex-col">
                            <span className="font-black text-slate-900 dark:text-white text-sm">{log.vehicle?.registration}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">{log.vehicle?.model}</span>
                        </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <WrenchScrewdriverIcon className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">{log.description}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{format(new Date(log.scheduledDate), "MMMM dd, yyyy")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                <UserIcon className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                            </div>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{log.technician || "Internal Tech"}</span>
                        </div>
                    </td>
                    <td className="p-6 font-mono text-sm text-slate-900 dark:text-white/80 font-bold">${Number(log.cost).toFixed(2)}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                        log.status === 'COMPLETED' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400'
                      }`}>
                        {log.status === 'IN_PROGRESS' && <ArrowPathIcon className="h-3 w-3 animate-spin" />}
                        {log.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Initialize Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" onClick={() => !loading && setIsModalOpen(false)} />
          
          <div className="relative bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl overflow-hidden transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex justify-between items-start mb-8 relative">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white italic">Service Entry</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Maintenance Command Interface</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <XMarkIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6 relative">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Select Unit</label>
                <select 
                  required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                >
                  <option value="" className="text-slate-400">Choose Vehicle Account</option>
                  {initialData.vehicles.map((v: any) => (
                    <option key={v.id} value={v.id} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                      {v.registration} — {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Service Description</label>
                <input 
                  type="text" placeholder="e.g. System Diagnostic & Brake Flush" required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-orange-500 outline-none transition-all"
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Date</label>
                    <input 
                      type="date" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:border-orange-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Projected Cost</label>
                    <input 
                      type="number" placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-orange-500 outline-none transition-all"
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest">Operational Status</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white font-bold focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="SCHEDULED">Status: Scheduled</option>
                  <option value="IN_PROGRESS">Status: In Progress</option>
                  <option value="COMPLETED">Status: Completed</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-3"
              >
                {loading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : "Commit Service Record"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default MaintenanceRecordsClient;