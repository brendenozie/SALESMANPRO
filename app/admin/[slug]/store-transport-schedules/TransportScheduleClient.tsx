"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  CalendarDaysIcon, ClockIcon, TruckIcon, UserCircleIcon,
  ArrowPathIcon, ChevronLeftIcon,
  ChevronRightIcon, PlusIcon,
  SparklesIcon,
  UserIcon,
  MapIcon,
  XMarkIcon,
  TicketIcon
} from "@heroicons/react/24/outline";
import { format, addDays, subDays } from "date-fns";

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  status: 'IN_PROGRESS' | 'SCHEDULED' | 'STANDBY' | 'COMPLETED';
  route: { name: string };
  driver: { name: string };
  vehicle: { registration: string };
}

interface TransportScheduleClientProps {
  initialShifts: Shift[];
  initialDrivers: any[];
  initialRoutes: any[];
  initialVehicles: any[];
  schoolId: string;
}

const TransportScheduleClient = ({ 
  initialShifts, 
  initialDrivers, 
  initialRoutes, 
  initialVehicles, 
  schoolId 
}: TransportScheduleClientProps) => {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const res = await fetch(`/api/admin/transport/shifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: selectedRoute,
          driverId: selectedDriver,
          vehicleId: selectedVehicle,
          startTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T${startTime}`),
          endTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T${endTime}`),
          companyId: schoolId
        }),
      });
  
      const result = await res.json();
      if (result.success) {
        setShifts([result.data, ...shifts]);
        toast.success("Shift successfully authorized and dispatched.");
        setIsModalOpen(false);
        setSelectedRoute(""); setSelectedDriver(""); setSelectedVehicle("");
      } else {
        toast.error(result.message || "Scheduling conflict detected.");
      }
    } catch (err) {
      toast.error("Dispatch system connection failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
    setCurrentDate(newDate);
    toast.success(`Schedule: ${format(newDate, 'MMM dd')}`, { icon: '📅' });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'SCHEDULED': return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'COMPLETED': return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500';
      default: return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-500';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 md:p-8 font-sans transition-colors duration-300">
      <Toaster 
        position="top-right" 
        toastOptions={{ 
            className: 'bg-white dark:bg-[#0F1115] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800' 
        }} 
      />
      
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">Operational Dispatch</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500">Logistics.</span>
            </h1>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="group flex items-center gap-2 px-6 py-4 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
            <PlusIcon className="h-5 w-5 stroke-[3px]" />
            Assign New Shift
          </button>
        </header>

        {/* Control Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 p-4 rounded-[2rem] backdrop-blur-sm shadow-sm dark:shadow-none">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <div className="flex bg-slate-100 dark:bg-black/40 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-all">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="px-4 flex items-center border-x border-slate-200 dark:border-slate-800">
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {format(currentDate, 'EEEE, MMM dd')}
                </h2>
              </div>
              <button onClick={() => navigateDate('next')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-all">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800/30 rounded-full border border-slate-200 dark:border-slate-700/50">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {shifts.filter(s => s.status === 'IN_PROGRESS').length} Active Now
            </div>
            <span>Total: {shifts.length} Shifts</span>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">
            <div className="col-span-3">Route Architecture</div>
            <div className="col-span-2 text-center">Temporal Window</div>
            <div className="col-span-2">Assigned Pilot</div>
            <div className="col-span-2">Fleet Unit</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {shifts.map((shift) => (
            <div key={shift.id} className="grid grid-cols-1 lg:grid-cols-12 items-center p-5 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 rounded-[2rem] hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all group relative overflow-hidden shadow-sm dark:shadow-none">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="col-span-3 mb-4 lg:mb-0 relative">
                <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate pr-4">{shift.route.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <TicketIcon className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                    <p className="text-[9px] font-mono text-slate-500 uppercase">REF: {shift.id.slice(-8)}</p>
                </div>
              </div>

              <div className="col-span-2 text-center mb-4 lg:mb-0 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-black/60 rounded-xl border border-slate-200 dark:border-slate-800/50">
                  <ClockIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                    {format(new Date(shift.startTime), 'HH:mm')} — {format(new Date(shift.endTime), 'HH:mm')}
                  </span>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 mb-4 lg:mb-0 relative">
                <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500/30 transition-colors">
                  <UserCircleIcon className="h-6 w-6 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{shift.driver.name}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-tighter">Certified Pilot</span>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 mb-4 lg:mb-0 relative">
                <TruckIcon className="h-5 w-5 text-slate-400 dark:text-slate-600" />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300 tracking-wider">{shift.vehicle.registration}</span>
              </div>

              <div className="col-span-2 relative">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(shift.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${shift.status === 'IN_PROGRESS' ? 'bg-emerald-500 animate-pulse' : 'bg-current opacity-40'}`} />
                  {shift.status.replace('_', ' ')}
                </span>
              </div>

              <div className="col-span-1 text-right relative">
                <button className="p-2.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all bg-slate-100 dark:bg-slate-800/40 rounded-xl hover:bg-emerald-500/10">
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {shifts.length === 0 && (
            <div className="py-24 text-center bg-white dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-[3rem]">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarDaysIcon className="h-8 w-8 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold mb-1">Grid Empty</h3>
              <p className="text-slate-500 text-xs uppercase tracking-widest">No active deployments for this cycle.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- DISPATCH MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-sm dark:backdrop-blur-xl" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex justify-between items-start mb-10 relative">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white italic">Authorize Dispatch</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Resource Matrix Allocation</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-6 relative">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Primary Objective (Route)</label>
                <div className="relative">
                  <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                  <select required value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none transition-all cursor-pointer">
                    <option value="" className="bg-white dark:bg-slate-900">Select Path Architecture</option>
                    {initialRoutes.map(r => <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900">{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">T-Minus (Start)</label>
                  <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">ETA (Conclusion)</label>
                  <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Assigned Personnel</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select required value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none transition-all cursor-pointer">
                      <option value="" className="bg-white dark:bg-slate-900">Select Pilot</option>
                      {initialDrivers.map(d => <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900">{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Fleet Unit</label>
                  <div className="relative">
                    <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select required value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none transition-all cursor-pointer">
                      <option value="" className="bg-white dark:bg-slate-900">Select Registration</option>
                      {initialVehicles.map(v => <option key={v.id} value={v.id} className="bg-white dark:bg-slate-900">{v.registration}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="group w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-black text-xs uppercase tracking-[0.25em] rounded-[1.5rem] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-600/20 dark:shadow-emerald-900/20 mt-4"
              >
                {isSubmitting ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Commit to Dispatch
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default TransportScheduleClient;