"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  CalendarDaysIcon, ClockIcon, TruckIcon, UserCircleIcon,
  ArrowPathIcon, FunnelIcon, PrinterIcon, ChevronLeftIcon,
  ChevronRightIcon, PlusIcon,
  SparklesIcon,
  UserIcon,
  MapIcon,
  XMarkIcon
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

const TransportScheduleClient = ({ initialShifts, initialDrivers, initialRoutes, initialVehicles, schoolId }: TransportScheduleClientProps) => {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  // Mock data for selectors (In real app, pass these as props or fetch on mount)
  const availableRoutes = initialRoutes;
  const availableDrivers = initialDrivers;
  const availableVehicles = initialVehicles;
  
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
        toast.success("Shift successfully dispatched.");
        setIsModalOpen(false);
      } else {
        toast.error(result.message || "Scheduling conflict detected.");
      }
    } catch (err) {
      toast.error("Failed to connect to Dispatch.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
    setCurrentDate(newDate);
    // In a real app, you'd trigger a fetch here for the specific date
    toast.loading(`Loading schedule for ${format(newDate, 'MMM dd')}...`, { duration: 1000 });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'SCHEDULED': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default: return 'bg-slate-800 border-slate-700 text-slate-500';
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">Temporal Coordination</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Schedule.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-emerald-50 transition-all shadow-lg">
              <PlusIcon className="h-4 w-4 stroke-[3px]" />
              Create Shift
            </button>
          </div>
        </header>

        {/* Date Navigator */}
        <div className="flex items-center justify-between mb-8 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button onClick={() => navigateDate('next')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">
              {format(currentDate, 'EEEE, MMM dd, yyyy')}
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Active Shifts: {shifts.length}</span>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">
            <div className="col-span-3">Route Detail</div>
            <div className="col-span-2 text-center">Time Slot</div>
            <div className="col-span-2">Pilot</div>
            <div className="col-span-2">Vehicle</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Edit</div>
          </div>

          {shifts.map((shift) => (
            <div key={shift.id} className="grid grid-cols-1 md:grid-cols-12 items-center p-6 bg-slate-900/20 border border-slate-800/60 rounded-[2rem] hover:bg-slate-800/40 transition-all group">
              <div className="col-span-3 mb-4 md:mb-0">
                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{shift.route.name}</p>
                <p className="text-[10px] font-mono text-slate-500 uppercase">{shift.id}</p>
              </div>

              <div className="col-span-2 text-center mb-4 md:mb-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-slate-800">
                  <ClockIcon className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-mono text-slate-300">
                    {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')}
                  </span>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 mb-4 md:mb-0">
                <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                  <UserCircleIcon className="h-5 w-5 text-slate-500" />
                </div>
                <span className="text-sm font-medium text-slate-300">{shift.driver.name}</span>
              </div>

              <div className="col-span-2 flex items-center gap-3 mb-4 md:mb-0">
                <TruckIcon className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-mono text-slate-300">{shift.vehicle.registration}</span>
              </div>

              <div className="col-span-2">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(shift.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${shift.status === 'IN_PROGRESS' ? 'bg-emerald-500 animate-pulse' : 'bg-current opacity-50'}`} />
                  {shift.status.replace('_', ' ')}
                </span>
              </div>

              <div className="col-span-1 text-right">
                <button className="p-2 text-slate-600 hover:text-emerald-400 transition-colors bg-slate-800/50 rounded-lg hover:bg-emerald-500/10">
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {shifts.length === 0 && (
            <div className="py-20 text-center bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[3rem]">
              <CalendarDaysIcon className="h-12 w-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-bold italic">No shifts recorded for this date cycle.</p>
            </div>
          )}
        </div>
      </div>

      {/* // --- MODAL JSX --- */}
{isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
    
    <div className="relative w-full max-w-xl bg-[#0F1115] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-black text-white italic">Dispatch Shift</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Resource Allocation Matrix</p>
        </div>
        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <XMarkIcon className="h-6 w-6 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleCreateShift} className="space-y-6">
        {/* Route Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Assigned Route</label>
          <div className="relative">
            <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            <select required value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 outline-none appearance-none">
              <option value="">Select Route Architecture</option>
              {availableRoutes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        {/* Time Matrix */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Departure</label>
            <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 outline-none color-scheme-dark" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Estimated Return</label>
            <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 outline-none color-scheme-dark" />
          </div>
        </div>

        {/* Resource Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Assigned Pilot</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select required value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-white focus:border-emerald-500 outline-none appearance-none">
                <option value="">Select Driver</option>
                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Fleet Unit</label>
            <div className="relative">
              <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select required value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-white focus:border-emerald-500 outline-none appearance-none">
                <option value="">Select Vehicle</option>
                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} {v.registration}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20"
        >
          {isSubmitting ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              Authorize Shift
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