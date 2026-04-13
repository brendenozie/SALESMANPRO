"use client";

import React, { useState } from "react";
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
  MapPinIcon,
  CalculatorIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}


const FuelLogsClient = ({ initialData, schoolId }: any) => {
  const [logs, setLogs] = useState(initialData.logs || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vehicleId: "",
    quantity: "",
    cost: "",
    odometer: "",
    station: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/admin/transport/fuel?companyId=${schoolId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      
      if (result.success) {
        setLogs([result.data, ...logs]);
        setIsModalOpen(false);
        toast.success("Refuel telemetry synchronized successfully");
        setFormData({ vehicleId: "", quantity: "", cost: "", odometer: "", station: "", notes: "" });
      }
    } catch (error) {
      toast.error("Telemetry uplink failed");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = logs.reduce((acc: number, log: any) => acc + (Number(log.cost) || 0), 0);
  const totalVolume = logs.reduce((acc: number, log: any) => acc + (Number(log.quantity) || 0), 0);
  const avgPrice = totalVolume > 0 ? (totalSpent / totalVolume) : 0;

  const formatDate = (date: Date, format: string) => {
    const options: Intl.DateTimeFormatOptions = {};
    if (format.includes("MMM")) options.month = "short";
    return date.toLocaleDateString("en-US", options);
  };


  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-4 md:p-8 font-sans">
      <Toaster position="top-right" toastOptions={{ style: { background: '#0F1115', color: '#fff', border: '1px solid #1e293b' }}} />
      
      {/* Background Ambience */}
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-400 rounded-full" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Energy Consumption</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fuel <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Intelligence.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-[1.2rem] text-slate-400 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
              <DocumentArrowDownIcon className="h-4 w-4" />
              Dataset Export
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
            >
              <BeakerIcon className="h-5 w-5 stroke-[2px]" />
              Initialize Log
            </button>
          </div>
        </header>

        {/* Intelligence KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <BoltIcon className="h-12 w-12 text-emerald-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market Avg. Price/L</p>
            <h3 className="text-3xl font-black text-white">${avgPrice.toFixed(2)}</h3>
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] mt-2 font-bold uppercase">
              <ArrowTrendingDownIcon className="h-3 w-3" />
              Optimal efficiency
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ChartBarIcon className="h-12 w-12 text-cyan-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gross Volume (30d)</p>
            <h3 className="text-3xl font-black text-white">{totalVolume.toLocaleString()} <span className="text-sm font-medium text-slate-500">Liters</span></h3>
            <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-tighter italic">Total Fleet Draw</p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <CurrencyDollarIcon className="h-12 w-12 text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Projected Expenditure</p>
            <h3 className="text-3xl font-black text-emerald-400">${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-widest">Settled Accounts</p>
          </div>
        </div>

        {/* Telemetry Matrix */}
        <div className="bg-slate-900/20 border border-slate-800/40 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-emerald-400" />
              Consumption Logs
            </h3>
            <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Real-time Stream</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase text-slate-600 tracking-[0.2em]">
                  <th className="p-6">Temporal Stamp</th>
                  <th className="p-6">Asset Unit</th>
                  <th className="p-6">Vendor Hub</th>
                  <th className="p-6">Telemetry (Km)</th>
                  <th className="p-6 text-center">Volume</th>
                  <th className="p-6 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <p className="text-xs text-slate-300 font-bold">{formatDate(new Date(log.date || Date.now()), "MMM dd, yyyy")}</p>
                      <p className="text-[9px] font-mono text-slate-600 mt-0.5 tracking-tighter">ID: {log.id.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg group-hover:border-emerald-500/30 border border-transparent transition-all">
                            <TruckIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-black text-white">{log.vehicle?.registration || log.vehicle}</span>
                      </div>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-1.5">
                            <MapPinIcon className="h-3 w-3 text-slate-600" />
                            <span className="text-xs text-slate-400 font-medium">{log.station || "Global Vendor"}</span>
                        </div>
                    </td>
                    <td className="p-6">
                        <div className="flex flex-col">
                            <span className="font-mono text-xs text-slate-500">{Number(log.odometer).toLocaleString()} KM</span>
                        </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                        {log.quantity || log.volume} L
                      </span>
                    </td>
                    <td className="p-6 text-right font-black text-sm text-white">
                      ${Number(log.cost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => !loading && setIsModalOpen(false)} />
          
          <div className="relative bg-[#0F1115] border border-slate-800 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex justify-between items-start mb-10 relative">
                <div>
                    <h2 className="text-3xl font-black text-white italic">Record Refuel</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1">Resource Input Command</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <XMarkIcon className="h-6 w-6 text-slate-500" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Asset Unit</label>
                <div className="relative">
                  <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                  <select 
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                    onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                  >
                    <option value="">Select Vehicle Registry</option>
                    {initialData.vehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.registration} — {v.model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Volume (L)</label>
                    <input 
                        type="number" step="0.01" placeholder="0.00" required
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Settlement ($)</label>
                    <input 
                        type="number" step="0.01" placeholder="0.00" required
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Odometer</label>
                    <div className="relative">
                        <CalculatorIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input 
                            type="number" placeholder="Km reading" required
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            onChange={(e) => setFormData({...formData, odometer: e.target.value})}
                        />
                    </div>
                </div>
                <div className="space-y-2 col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Vendor</label>
                    <input 
                        type="text" placeholder="Station name"
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                        onChange={(e) => setFormData({...formData, station: e.target.value})}
                    />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : "Commit Telemetry Log"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default FuelLogsClient;