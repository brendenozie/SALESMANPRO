"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  CalendarDaysIcon, ClockIcon, TruckIcon, UserCircleIcon,
  ArrowPathIcon, PlusIcon,
  SparklesIcon,
  UserIcon,
  MapIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  DocumentArrowDownIcon
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
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const availableRoutes = initialRoutes;
  const availableDrivers = initialDrivers;
  const availableVehicles = initialVehicles;

  // Sync theme configurations
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
        // Reset states
        setSelectedRoute("");
        setSelectedDriver("");
        setSelectedVehicle("");
        setStartTime("");
        setEndTime("");
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
    toast.loading(`Loading schedule for ${format(newDate, 'MMM dd')}...`, { duration: 1000 });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': 
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'SCHEDULED': 
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'STANDBY': 
        return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
      default: 
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">Temporal Coordination</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-500">Schedule.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl transition-all shadow-sm active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-slate-600" />
              )}
            </button>

            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white rounded-2xl font-black text-xs tracking-wider transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" />
              Create Shift
            </button>
          </div>
        </header>

        {/* Date Navigator Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button 
                onClick={() => navigateDate('prev')} 
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all active:scale-95"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => navigateDate('next')} 
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all active:scale-95"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
              {format(currentDate, 'EEEE, MMM dd, yyyy')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Active Shifts: {shifts.length}
            </span>
          </div>
        </div>

        {/* Timeline Grid Layout */}
        <div className="space-y-4">
          {/* Legend Heading Table bar */}
          <div className="hidden lg:grid grid-cols-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2">
            <div className="col-span-3">Route Architecture</div>
            <div className="col-span-2 text-center">Time Frame</div>
            <div className="col-span-2">Assigned Pilot</div>
            <div className="col-span-2">Fleet Unit</div>
            <div className="col-span-2">Dispatch Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {shifts.map((shift) => (
            <div 
              key={shift.id} 
              className="grid grid-cols-1 lg:grid-cols-12 items-center p-6 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 rounded-[2.2rem] hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:shadow-md transition-all group gap-4 lg:gap-0"
            >
              <div className="col-span-3">
                <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {shift.route.name}
                </p>
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  {shift.id.slice(-8)}
                </p>
              </div>

              <div className="col-span-2 lg:text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <ClockIcon className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                    {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')}
                  </span>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors">
                  <UserCircleIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {shift.driver.name}
                </span>
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                  <TruckIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold font-mono text-slate-700 dark:text-slate-300">
                  {shift.vehicle.registration}
                </span>
              </div>

              <div className="col-span-2">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(shift.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${shift.status === 'IN_PROGRESS' ? 'bg-emerald-500 animate-pulse' : 'bg-current opacity-50'}`} />
                  {shift.status.replace('_', ' ')}
                </span>
              </div>

              <div className="col-span-1 text-right">
                <button 
                  className="p-2.5 text-slate-400 hover:text-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700"
                  title="Synchronize/Reset"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {shifts.length === 0 && (
            <div className="py-20 text-center bg-white/50 dark:bg-slate-900/10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
              <CalendarDaysIcon className="h-12 w-12 text-slate-300 dark:text-slate-800 mx-auto mb-4" />
              <p className="text-slate-400 dark:text-slate-500 font-bold italic text-sm">
                No active shifts dispatched for this schedule window.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- RESOURCE ALLOCATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic">Dispatch Shift</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Resource Allocation Matrix</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-6">
              {/* Route Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Assigned Route</label>
                <div className="relative">
                  <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                  <select 
                    required 
                    value={selectedRoute} 
                    onChange={e => setSelectedRoute(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select Route Architecture</option>
                    {availableRoutes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Departure</label>
                  <input 
                    type="time" 
                    required 
                    value={startTime} 
                    onChange={e => setStartTime(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-emerald-500 outline-none dark:color-scheme-dark" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Estimated Return</label>
                  <input 
                    type="time" 
                    required 
                    value={endTime} 
                    onChange={e => setEndTime(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-emerald-500 outline-none dark:color-scheme-dark" 
                  />
                </div>
              </div>

              {/* Resource Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Assigned Pilot</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <select 
                      required 
                      value={selectedDriver} 
                      onChange={e => setSelectedDriver(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select Driver</option>
                      {availableDrivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Fleet Unit</label>
                  <div className="relative">
                    <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <select 
                      required 
                      value={selectedVehicle} 
                      onChange={e => setSelectedVehicle(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select Vehicle</option>
                      {availableVehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registration})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/10 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    Authorize Dispatch
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