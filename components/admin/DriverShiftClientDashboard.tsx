"use client";

import React, { useState } from "react";
import { 
  PlayIcon, 
  CheckCircleIcon, 
  MapPinIcon, 
  TruckIcon,
  PhoneIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  XMarkIcon,
  SparklesIcon,
  UserGroupIcon
} from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";

const DriverShiftClient = ({ initialShifts }: any) => {
  const [shifts, setShifts] = useState(initialShifts);
  // const [loading, setLoading] = useState<string | null>(null);
  //  const [shifts, setShifts] = useState(initialShifts);
  const [showChecklist, setShowChecklist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Checklist State
  const [checklist, setChecklist] = useState({
    passengersOffboarded: false,
    vehicleCleaned: false,
    windowsLocked: false,
    maintenanceIssues: "None"
  });

  const activeShift = shifts.find((s: any) => s.status === "IN_PROGRESS");

  const handleFinishTrip = async () => {
    if (!checklist.passengersOffboarded || !checklist.vehicleCleaned) {
      toast.error("Please complete all safety checks first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/driver/shift/${activeShift.id}`, {
        method: "PATCH",
        body: JSON.stringify({ 
          status: "COMPLETED",
          notes: JSON.stringify(checklist) 
        }),
      });
      const result = await res.json();
      if (result.success) {
        setShifts(shifts.map((s: any) => s.id === activeShift.id ? result.data : s));
        setShowChecklist(false);
        toast.success("Trip data synchronized!");
      }
    } catch (err) {
      toast.error("Sync failed. Try again.");
    } finally {
      setLoading(false);
    }
  };


  const updateShiftStatus = async (shiftId: string, newStatus: string) => {
    // setLoading(shiftId);
    setLoading(true);
    try {
      const res = await fetch(`/api/driver/shift/${shiftId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setShifts(shifts.map((s: any) => s.id === shiftId ? result.data : s));
        toast.success(`Trip ${newStatus.replace('_', ' ')}`);
      }
    } catch (err) {
      toast.error("Connection error. Check data.");
    } finally {
      // setLoading(null);
      setLoading(false);
    }
  };

  // const activeShift = shifts.find((s: any) => s.status === "IN_PROGRESS");
  const upcomingShifts = shifts.filter((s: any) => s.status === "SCHEDULED");

  return (
    <main className="min-h-screen bg-[#05070A] text-white p-4 pb-20 font-sans">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="mb-8 pt-4">
        <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Driver Portal</p>
        <h1 className="text-3xl font-black">My Shifts.</h1>
      </header>

      {activeShift && (
        <div className="bg-blue-600 rounded-[2.5rem] p-8">
            <h2 className="text-3xl font-black mb-6">{activeShift.route.name}</h2>
            <button 
                onClick={() => setShowChecklist(true)}
                className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3"
            >
                End Current Shift
            </button>
        </div>
      )}

      {/* 1. ACTIVE TRIP SECTION */}
      {activeShift ? (
        <section className="mb-10">
          <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Live Trip</span>
              <h2 className="text-4xl font-black mt-4 mb-2">{activeShift.route.name}</h2>
              <div className="flex items-center gap-2 text-blue-100 mb-6">
                <MapPinIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{activeShift.route.startPoint} → {activeShift.route.endPoint}</span>
              </div>
              
              <button 
                onClick={() => updateShiftStatus(activeShift.id, "COMPLETED")}
                disabled={loading === activeShift.id}
                className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                {loading === activeShift.id ? "Processing..." : <><CheckBadgeIcon className="h-6 w-6" /> Finish Trip</>}
              </button>
            </div>
            <TruckIcon className="absolute -right-8 -bottom-8 h-40 w-40 text-white/10 rotate-12" />
          </div>
        </section>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-[2.5rem] p-10 text-center mb-10">
          <p className="text-slate-500 font-bold">No trip currently in progress</p>
        </div>
      )}

      {/* 2. UPCOMING LIST */}
      <section>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Upcoming Today</h3>
        <div className="space-y-4">
          {upcomingShifts.map((shift: any) => (
            <div key={shift.id} className="bg-slate-900/80 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <ClockIcon className="h-3 w-3 text-blue-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {format(new Date(shift.startTime), "hh:mm aa")}
                    </p>
                </div>
                <h4 className="text-lg font-bold text-white">{shift.route.name}</h4>
                <p className="text-xs text-slate-500">{shift.vehicle.registration} • {shift.vehicle.model}</p>
              </div>
              
              {!activeShift && (
                <button 
                  onClick={() => updateShiftStatus(shift.id, "IN_PROGRESS")}
                  className="bg-slate-800 p-4 rounded-2xl text-blue-400 active:bg-blue-600 active:text-white transition-all"
                >
                  <PlayIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions Footer */}
      <footer className="fixed bottom-6 left-4 right-4 flex gap-4">
        <button className="flex-1 bg-slate-900 border border-slate-800 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold">
          <PhoneIcon className="h-4 w-4 text-emerald-500" /> Dispatch
        </button>
        <button className="flex-1 bg-slate-900 border border-slate-800 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold">
          <ExclamationTriangleIcon className="h-4 w-4 text-rose-500" /> Emergency
        </button>
      </footer>


      {/* POST-TRIP CHECKLIST MODAL */}
      {showChecklist && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black">Final Safety Check</h2>
            <button onClick={() => setShowChecklist(false)} className="p-2 bg-slate-900 rounded-full">
              <XMarkIcon className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4 flex-grow">
            {/* Checklist Item 1 */}
            <label className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${checklist.passengersOffboarded ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-xl">
                    <UserGroupIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                    <p className="font-bold">Empty Vehicle</p>
                    <p className="text-[10px] text-slate-500 uppercase">All passengers offboarded</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="h-6 w-6 rounded-full border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                checked={checklist.passengersOffboarded}
                onChange={(e) => setChecklist({...checklist, passengersOffboarded: e.target.checked})}
              />
            </label>

            {/* Checklist Item 2 */}
            <label className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${checklist.vehicleCleaned ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-xl">
                    <SparklesIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                    <p className="font-bold">Interior Check</p>
                    <p className="text-[10px] text-slate-500 uppercase">Trash removed & windows closed</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="h-6 w-6 rounded-full border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                checked={checklist.vehicleCleaned}
                onChange={(e) => setChecklist({...checklist, vehicleCleaned: e.target.checked})}
              />
            </label>

            {/* Maintenance Notes */}
            <div className="mt-8">
              <p className="text-xs font-black text-slate-500 uppercase mb-3 px-2">Report Issues</p>
              <textarea 
                placeholder="Unusual noises, tire pressure, etc."
                className="w-full bg-slate-900 border-slate-800 rounded-[1.5rem] p-4 text-sm focus:border-blue-500 outline-none"
                onChange={(e) => setChecklist({...checklist, maintenanceIssues: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={handleFinishTrip}
            disabled={loading}
            className="w-full bg-emerald-600 py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/40"
          >
            {loading ? "Syncing Report..." : "Complete & Submit"}
          </button>
        </div>
      )}

    </main>
  );
};

export default DriverShiftClient;