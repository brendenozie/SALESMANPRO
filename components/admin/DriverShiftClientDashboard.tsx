"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  MapPinIcon, TruckIcon, PhoneIcon, ExclamationTriangleIcon, 
  CheckBadgeIcon, XMarkIcon, UserPlusIcon, CheckIcon, 
  ChevronRightIcon, ClockIcon, WifiIcon, CloudIcon, 
  SignalIcon, MapIcon, SparklesIcon, UserGroupIcon
} from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---
const MOCK_STOPS = [
  { id: "s1", name: "Maple Street", time: "08:10", status: "COMPLETED" },
  { id: "s2", name: "Oak Lane", time: "08:25", status: "ARRIVING" },
  { id: "s3", name: "Highland Terrace", time: "08:40", status: "UPCOMING" },
  { id: "s4", name: "Lincoln Elementary", time: "09:00", status: "UPCOMING" },
];

const MOCK_STUDENTS = [
  { id: 1, name: "Alice Thompson", grade: "4th", stopId: "s1", onboard: true },
  { id: 2, name: "Benny Garcia", grade: "2nd", stopId: "s1", onboard: true },
  { id: 3, name: "Charlie Evans", grade: "5th", stopId: "s2", onboard: false },
  { id: 4, name: "Daisy Miller", grade: "3rd", stopId: "s2", onboard: false },
  { id: 5, name: "Ethan Hunt", grade: "1st", stopId: "s3", onboard: false },
];

const ComprehensiveDriverDashboard = ({companyId, currentUserId}: { companyId: string; currentUserId: string }) => {
  // --- STATE ---
  const [activeStopId, setActiveStopId] = useState("s2");
  const [showRoster, setShowRoster] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [activeDelay, setActiveDelay] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStop = MOCK_STOPS.find(s => s.id === activeStopId);
  const onboardCount = students.filter(s => s.onboard).length;
  const stopStudents = useMemo(() => students.filter(s => s.stopId === activeStopId), [activeStopId, students]);

  const toggleStudent = (id: number) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, onboard: !s.onboard } : s));
  };

  const handleDelayReport = (mins: number) => {
    setActiveDelay(`+${mins}m Delay Reported`);
    setShowDelayModal(false);
    toast.success(`Parents/School notified of ${mins}m delay.`);
  };

  return (
    <main className="min-h-screen bg-[#07090D] text-white p-5 pb-40 font-sans selection:bg-blue-500/30">
      <Toaster position="top-center" />

      {/* 1. DYNAMIC HEADER */}
      <header className="flex justify-between items-start mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <TruckIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none italic uppercase">Navigator</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Vehicle #882-Alpha</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-black text-white leading-none">{format(currentTime, "HH:mm")}</p>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Global Sync Active</p>
        </div>
      </header>

      {/* 2. DELAY ALERT BAR */}
      <AnimatePresence>
        {activeDelay && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-orange-500 animate-pulse" />
                <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{activeDelay}</span>
              </div>
              <button onClick={() => setActiveDelay(null)} className="text-orange-500/40 text-xs font-black uppercase">Clear</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. THE COMMAND CARD (Active Trip) */}
      <section className="bg-[#12161F] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative mb-8">
        {/* MAP PREVIEW UNDERLAY */}
        <div className="relative h-40 bg-slate-900">
           <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-74.006,40.7128,14,0/600x400?access_token=YOUR_TOKEN')] bg-cover bg-center" />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#12161F]/40 to-[#12161F]" />
           <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <SignalIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Live Route Tracking</span>
           </div>
        </div>

        <div className="px-8 pb-8 -mt-10 relative z-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Current Stop</p>
              <h2 className="text-4xl font-black italic tracking-tighter">{currentStop?.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-slate-400">
                <MapPinIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">ETA: {currentStop?.time}</span>
              </div>
            </div>
          </div>

          {/* STOP STEPPER */}
          <div className="flex items-center gap-3 py-6 overflow-x-auto no-scrollbar border-y border-white/5 mb-8">
            {MOCK_STOPS.map((stop, idx) => (
              <React.Fragment key={stop.id}>
                <button 
                  onClick={() => setActiveStopId(stop.id)}
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    activeStopId === stop.id ? 'bg-blue-600 border-blue-400 scale-110 shadow-lg shadow-blue-600/40' : 
                    stop.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800 border-transparent'
                  }`}
                >
                  {stop.status === 'COMPLETED' ? <CheckIcon className="h-6 w-6 text-emerald-500" /> : <span className="font-black text-sm">{idx + 1}</span>}
                </button>
                {idx !== MOCK_STOPS.length - 1 && <div className={`h-1 w-6 rounded-full ${stop.status === 'COMPLETED' ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowRoster(true)}
              className="bg-blue-600 hover:bg-blue-500 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              <UserPlusIcon className="h-8 w-8 text-white" />
              <span className="text-xs font-black uppercase tracking-widest">Boarding</span>
            </button>
            <div className="bg-black/30 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center">
              <p className="text-3xl font-black">{onboardCount}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Onboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. UTILITY GRID */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowDelayModal(true)}
          className="bg-[#1C2128] border border-white/10 p-6 rounded-[2rem] flex flex-col gap-4 group active:scale-95 transition-all"
        >
          <ClockIcon className="h-6 w-6 text-orange-500" />
          <div className="text-left">
            <p className="font-black text-sm">Report Delay</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Notify Parents</p>
          </div>
        </button>
        <button 
          onClick={() => setShowFinishModal(true)}
          className="bg-white text-black p-6 rounded-[2rem] flex flex-col gap-4 active:scale-95 transition-all shadow-xl shadow-white/5"
        >
          <CheckBadgeIcon className="h-6 w-6 text-blue-600" />
          <div className="text-left">
            <p className="font-black text-sm">Finish Trip</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Log Safety</p>
          </div>
        </button>
      </section>

      {/* 5. FLOATING FOOTER */}
        <footer className="
          /* Position and Z-index */
          fixed bottom-0 z-20 
          
          /* Background & Border */
          bg-[#12161F]/90 backdrop-blur-xl border-t border-white/10 
          
          /* Layout */
          py-5 px-8 flex items-center justify-between gap-4 
          
          /* THE FIX: Width & Offsetting */
          inset-x-0                       /* Full width on mobile */
          lg:left-64                      /* Offset by sidebar width on desktop (adjust 64 to your sidebar width) */
          lg:right-0                      /* Align to the right edge of the content area */
        ">
          <button className="flex-1 bg-white/5 border border-white/10 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-white/10 transition-colors">
            <PhoneIcon className="h-5 w-5 text-emerald-500" /> Dispatch
          </button>
          <button className="flex-1 bg-rose-600/10 border border-rose-500/20 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-500 shadow-2xl hover:bg-rose-600/20 transition-colors">
            <ExclamationTriangleIcon className="h-5 w-5 text-rose-500" /> Emergency
          </button>
        </footer>

      {/* 5. FLOATING FOOTER
      <footer className={"fixed inset-x-0 bottom-0 bg-[#12161F]/90 backdrop-blur-xl border-t border-white/10 py-5 px-8 flex items-center justify-between gap-4 z-20"}>
        <button className="flex-1 bg-[#12161F]/90 backdrop-blur-xl border border-white/10 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl">
          <PhoneIcon className="h-5 w-5 text-emerald-500" /> Dispatch
        </button>
        <button className="flex-1 bg-rose-600/10 backdrop-blur-xl border border-rose-500/20 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-500 shadow-2xl">
          <ExclamationTriangleIcon className="h-5 w-5 text-rose-500" /> Emergency
        </button>
      </footer> */}

      {/* --- MODALS --- */}
      
      {/* ROSTER MODAL */}
      <Modal isOpen={showRoster} onClose={() => setShowRoster(false)} title="Stop Manifest">
        <div className="mb-6">
          <h4 className="text-2xl font-black italic">{currentStop?.name}</h4>
          <p className="text-slate-500 text-xs">Verify students boarding at this stop.</p>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[45vh] mb-6 pr-2">
          {stopStudents.map(student => (
            <button key={student.id} onClick={() => toggleStudent(student.id)} className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all ${student.onboard ? 'bg-emerald-500/10 border-emerald-500 shadow-inner' : 'bg-white/5 border-transparent'}`}>
              <div className="flex items-center gap-4 text-left">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${student.onboard ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{student.name.charAt(0)}</div>
                <div>
                  <p className="font-black text-lg leading-none mb-1">{student.name}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">{student.grade} Grade</p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${student.onboard ? 'bg-emerald-500 border-emerald-400' : 'border-slate-700'}`}>
                {student.onboard && <CheckIcon className="h-5 w-5 text-white" />}
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => setShowRoster(false)} className="w-full bg-blue-600 py-6 rounded-[2rem] font-black text-lg">Confirm Manifest</button>
      </Modal>

      {/* DELAY MODAL */}
      <Modal isOpen={showDelayModal} onClose={() => setShowDelayModal(false)} title="Report Issue">
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[5, 15, 30].map(mins => (
            <button key={mins} onClick={() => handleDelayReport(mins)} className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-orange-500 transition-all">
              <span className="text-3xl font-black">+{mins}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Minutes</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl mb-8">
          <CloudIcon className="h-5 w-5 text-orange-500" />
          <p className="text-xs text-orange-200">This will notify all parents and school administration via SMS/Push.</p>
        </div>
      </Modal>

      {/* FINISH/SAFETY CHECKLIST MODAL */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title="Safety Check">
          <div className="space-y-4 mb-10">
              <SafetyItem icon={<UserGroupIcon className="h-5 w-5" />} title="Empty Vehicle" desc="Walked to the back and checked every seat." />
              <SafetyItem icon={<SparklesIcon className="h-5 w-5" />} title="Interior Cleaned" desc="Trash removed and windows locked." />
          </div>
          <button onClick={() => {toast.success("Route Logged Successfully"); setShowFinishModal(false)}} className="w-full bg-emerald-600 py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-900/40">Submit Route Log</button>
      </Modal>
    </main>
  );
};

// --- SUB-COMPONENTS ---

const Modal = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80]" />
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed inset-x-0 bottom-0 bg-[#12161F] border-t border-white/10 rounded-t-[4rem] z-[90] p-8 pb-12 shadow-2xl">
          <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-10" />
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">{title}</h3>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><XMarkIcon className="h-5 w-5 text-slate-400" /></button>
          </div>
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const SafetyItem = ({ icon, title, desc }: any) => (
    <label className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-transparent active:border-emerald-500 transition-all">
        <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-slate-800 rounded-xl text-blue-400">{icon}</div>
            <div>
                <p className="font-black text-lg leading-none mb-1">{title}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{desc}</p>
            </div>
        </div>
        <input type="checkbox" className="w-8 h-8 rounded-full border-slate-700 bg-black text-emerald-500 focus:ring-0" />
    </label>
);

export default ComprehensiveDriverDashboard;