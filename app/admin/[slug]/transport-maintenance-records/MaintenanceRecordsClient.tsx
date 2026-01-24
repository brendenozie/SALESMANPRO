"use client";

import React, { useState } from "react";
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
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { format, startOfMonth } from "date-fns";

const MaintenanceRecordsClient = ({ initialData, schoolId }: any) => {
  const [filter, setFilter] = useState('all');

  // const records = [
  //   { id: 'MNT-9901', vehicle: 'BUS-101', service: 'Engine Overhaul', date: '2026-01-10', cost: 1250.00, status: 'Completed', technician: 'Mike Ross' },
  //   { id: 'MNT-9924', vehicle: 'BUS-202', service: 'Brake Pad Replacement', date: '2026-01-14', cost: 420.50, status: 'In Progress', technician: 'Sarah Connor' },
  //   { id: 'MNT-9882', vehicle: 'VAN-05', service: 'Oil & Filter Change', date: '2025-12-28', cost: 115.00, status: 'Completed', technician: 'Mike Ross' },
  // ];

  const [records, setRecords] = useState(initialData.records);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stats Calculations
  const activeRepairs = records.filter((r: any) => r.status === "IN_PROGRESS").length;
  const monthlySpend = records
    .filter((r: any) => new Date(r.scheduledDate) >= startOfMonth(new Date()))
    .reduce((acc: number, r: any) => acc + (r.cost || 0), 0);

  const [formData, setFormData] = useState({
    vehicleId: "",
    description: "",
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    cost: "",
    status: "SCHEDULED"
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transport/maintenance?companyId=${schoolId}`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setRecords([result.data, ...records]);
        setIsModalOpen(false);
        toast.success("Maintenance event synchronized");
      }
    } catch (err) {
      toast.error("System sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Mechanical Background Texture */}
      <div className="fixed top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none -z-10" 
           style={{ backgroundImage: 'radial-gradient(#ea7e08 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-orange-500 rounded-full" />
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">Asset Reliability</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Maintenance <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Logs.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all font-bold text-xs">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export History
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-orange-900/40">
              <PlusIcon className="h-4 w-4 stroke-[3px]" />
              New Service Entry
            </button>
          </div>
        </header>

        {/* Diagnostic KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-orange-500">
           <p className="text-[10px] font-bold text-slate-500 uppercase">Active Repairs</p>
           <h3 className="text-2xl font-black text-white">{activeRepairs.toString().padStart(2, '0')} Vehicles</h3>
        </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-orange-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                <CogIcon className="h-6 w-6 animate-spin-slow" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Active Repairs</p>
                <h3 className="text-2xl font-black text-white">03 Vehicles</h3>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                <CheckBadgeIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Fleet Health</p>
                <h3 className="text-2xl font-black text-white">94% Optimal</h3>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly Maint. Spend</p>
                <h3 className="text-2xl font-black text-white">$4,820.00</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-bottom border-slate-800 bg-slate-900/50">
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Service ID</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Vehicle</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Service Type</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Technician</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Cost</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {records.map((log : any) => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="p-6 font-mono text-xs text-slate-400">{log.id.slice(-6).toUpperCase()}</td>
                    <td className="p-6 font-bold text-white">{log.vehicle?.registration}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <WrenchScrewdriverIcon className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-slate-300">{log.description}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{format(new Date(log.scheduledDate), "MMM dd, yyyy")}</p>
                    </td>

                    {/* <td className="p-6 font-mono text-xs text-slate-400">{log.id}</td> */}
                    {/* <td className="p-6 font-bold text-white">{log.vehicle}</td> */}
                    {/* <td className="p-6">
                      <div className="flex items-center gap-2">
                        <WrenchScrewdriverIcon className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-slate-300">{log.service}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{log.date}</p>
                    </td> */}
                    <td className="p-6 text-sm text-slate-400">{log.technician}</td>
                    <td className="p-6 font-mono text-sm text-white">${log.cost.toFixed(2)}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        log.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      }`}>
                        {log.status === 'In Progress' && <ArrowPathIcon className="h-3 w-3 animate-spin" />}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6">Schedule Service</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <select 
                required className="w-full bg-black border border-slate-800 rounded-xl p-3 text-sm text-white"
                onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
              >
                <option value="">Select Vehicle</option>
                {initialData.vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.registration} - {v.model}</option>
                ))}
              </select>
              <input 
                type="text" placeholder="Description (e.g. Brake Pads)" required
                className="w-full bg-black border border-slate-800 rounded-xl p-3 text-sm text-white"
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" required className="bg-black border border-slate-800 rounded-xl p-3 text-sm text-white"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                />
                <input 
                  type="number" placeholder="Est. Cost" className="bg-black border border-slate-800 rounded-xl p-3 text-sm text-white"
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                />
              </div>
              <select 
                className="w-full bg-black border border-slate-800 rounded-xl p-3 text-sm text-white font-bold"
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress (Grounds Vehicle)</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 bg-slate-800 rounded-xl font-bold text-xs">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-orange-600 rounded-xl font-bold text-xs text-white">
                  {loading ? "Processing..." : "Confirm Entry"}
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