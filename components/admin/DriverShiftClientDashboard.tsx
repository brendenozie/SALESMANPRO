"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { 
  MapPinIcon, PhoneIcon, ExclamationTriangleIcon, 
  CheckBadgeIcon, XMarkIcon, UserPlusIcon, CheckIcon, 
  ClockIcon, SignalIcon, Squares2X2Icon, UserCircleIcon, 
  ArrowLeftIcon, ChevronDoubleUpIcon, ChevronDownIcon, 
  SpeakerWaveIcon, Bars3BottomLeftIcon, NoSymbolIcon,
  ArrowsUpDownIcon, ClipboardDocumentCheckIcon, 
  CameraIcon, BoltIcon, TruckIcon, PlayIcon, StopIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// --- TYPES & COORDINATES ---
type Coords = [number, number];

const INITIAL_STOPS = [
  { id: "s1", name: "Maple Street", time: "08:10", status: "COMPLETED", coords: [40.7128, -74.0060] as Coords },
  { id: "s2", name: "Oak Lane", time: "08:25", status: "ACTIVE", coords: [40.7306, -73.9352] as Coords },
  { id: "s3", name: "Highland Terrace", time: "08:40", status: "UPCOMING", coords: [40.7589, -73.9851] as Coords },
  { id: "s4", name: "Lincoln Elementary", time: "09:00", status: "UPCOMING", coords: [40.7829, -73.9654] as Coords },
];

const INITIAL_STUDENTS = [
  { id: 1, name: "Alice Thompson", grade: "4th", stopId: "s1", onboard: true },
  { id: 2, name: "Benny Garcia", grade: "2nd", stopId: "s1", onboard: true },
  { id: 3, name: "Charlie Evans", grade: "5th", stopId: "s2", onboard: false },
  { id: 4, name: "Daisy Miller", grade: "3rd", stopId: "s2", onboard: false },
  { id: 5, name: "Ethan Hunt", grade: "1st", stopId: "s3", onboard: false },
];

// --- TACTICAL MAP ENGINE ---
const MapModule = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, Polyline, useMap } = await import("react-leaflet");
    const L = await import("leaflet");

    const MapRecenter = ({ coords }: { coords: Coords }) => {
      const map = useMap();
      useEffect(() => { map.setView(coords, map.getZoom(), { animate: true }); }, [coords, map]);
      return null;
    };

    return ({ progress, start, end, isMini = false }: { progress: number; start: Coords; end: Coords; isMini?: boolean }) => {
      const currentPos: Coords = [
        start[0] + (end[0] - start[0]) * (progress / 100),
        start[1] + (end[1] - start[1]) * (progress / 100),
      ];

      const calculateBearing = (s: Coords, e: Coords) => {
        const y = Math.sin(e[1] - s[1]) * Math.cos(e[0]);
        const x = Math.cos(s[0]) * Math.sin(e[0]) - Math.sin(s[0]) * Math.cos(e[0]) * Math.cos(e[1] - s[1]);
        return (Math.atan2(y, x) * 180) / Math.PI;
      };

      const busIcon = L.divIcon({
        className: "custom-icon",
        html: `<div style="transform: rotate(${calculateBearing(start, end)}deg);" 
                    class="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.6)] border border-white/20">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white"><path d="M3.375 18.75h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125V13.5a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v4.125c0 .621-.504 1.125-1.125 1.125m-17.25 0h17.25" /></svg>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      return (
        <MapContainer center={currentPos} zoom={isMini ? 13 : 15} zoomControl={false} className="h-full w-full grayscale brightness-[0.6] contrast-[1.2]">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapRecenter coords={currentPos} />
          
          <Polyline positions={[start, end]} pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '8, 8', opacity: 0.5 }} />
          <Marker position={currentPos} icon={busIcon} />
          <Marker position={end} />
        </MapContainer>
      );
    };
  },
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-900 animate-pulse" /> }
);

export default function StudentNavigatorOS({companyId, currentUserId}: { companyId: string; currentUserId: string }) {
  const [isInspected, setIsInspected] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [view, setView] = useState<"hub" | "profile">("hub");
  const [workflow, setWorkflow] = useState<"dash" | "boarding" | "safety">("dash");
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  const [stops, setStops] = useState(INITIAL_STOPS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [activeStopId, setActiveStopId] = useState("s2");

  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            toast.success("Arrival Confirmed", { icon: "📍" });
            return 100;
          }
          return prev + 0.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const currentStop = useMemo(() => stops.find(s => s.id === activeStopId), [activeStopId, stops]);
  const prevStop = useMemo(() => stops[stops.findIndex(s => s.id === activeStopId) - 1] || stops[0], [activeStopId, stops]);
  const stopStudents = useMemo(() => students.filter(s => s.stopId === activeStopId), [activeStopId, students]);
  const totalOnboard = students.filter(s => s.onboard).length;

  return (
    <div className="min-h-screen bg-[#07090D] text-white overflow-hidden relative">
      <Toaster position="top-center" />

      <main className="h-screen overflow-y-auto p-5 pb-32">
        <AnimatePresence mode="wait">
          {!isInspected ? (
            <PreTripSection key="pre-trip" onComplete={() => { setIsInspected(true); setIsOnline(true); }} />
          ) : (
            <motion.div key="main-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
              {view === "profile" ? (
                <ProfileView onBack={() => setView("hub")} />
              ) : (
                <div className="h-full">
                  {workflow === "dash" && (
                    <Dashboard 
                      currentStop={currentStop} 
                      prevStop={prevStop}
                      onboardCount={totalOnboard} 
                      onExpandMap={() => setIsMapExpanded(true)}
                      onBoard={() => setWorkflow("boarding")}
                      onFinish={() => setWorkflow("safety")}
                      stops={stops}
                      activeStopId={activeStopId}
                      setActiveStopId={setActiveStopId}
                      isSimulating={isSimulating}
                      simProgress={simProgress}
                      onToggleSim={() => { setSimProgress(0); setIsSimulating(!isSimulating); }}
                    />
                  )}
                  {workflow === "boarding" && (
                    <BoardingManifest stop={currentStop} students={stopStudents} onToggle={(id: number) => setStudents(prev => prev.map(s => s.id === id ? { ...s, onboard: !s.onboard } : s))} onBack={() => setWorkflow("dash")} />
                  )}
                  {workflow === "safety" && <SafetyCloseout onBack={() => { setWorkflow("dash"); setIsInspected(false); }} />}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {isInspected && !isMapExpanded && (
        <nav className="fixed bottom-0 inset-x-0 h-24 bg-[#12161F]/90 backdrop-blur-2xl border-t border-white/10 px-12 flex justify-between items-center z-40">
          <NavButton active={view === "hub"} onClick={() => setView("hub")} icon={<Squares2X2Icon className="w-7 h-7" />} label="Route" />
          <div className="relative -top-8">
             <button onClick={() => setIsOnline(!isOnline)} className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-[#07090D] ${isOnline ? 'bg-blue-600 shadow-xl shadow-blue-500/40' : 'bg-rose-600 shadow-xl shadow-rose-600/40'}`}>
                <BoltIcon className="h-8 w-8 text-white" />
             </button>
          </div>
          <NavButton active={view === "profile"} onClick={() => setView("profile")} icon={<UserCircleIcon className="w-7 h-7" />} label="Profile" />
        </nav>
      )}

      <AnimatePresence>
        {isMapExpanded && (
          <TurnByTurnMap currentStop={currentStop} prevStop={prevStop} stops={stops} setStops={setStops} onClose={() => setIsMapExpanded(false)} isSimulating={isSimulating} simProgress={simProgress} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Dashboard({ currentStop, prevStop, onboardCount, onExpandMap, onBoard, onFinish, stops, activeStopId, setActiveStopId, isSimulating, simProgress, onToggleSim }: any) {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Navigator</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bus #882-Alpha</p>
        </div>
        {/* <button onClick={onToggleSim} className={`px-4 py-2 rounded-2xl border font-black text-[10px] uppercase transition-all ${isSimulating ? 'bg-orange-500 border-orange-400 animate-pulse' : 'bg-slate-900 border-white/10'}`}>
          {isSimulating ? 'Active Drive' : 'Simulate Drive'}
        </button> */}
        
        <div className="flex gap-2">
           {/* SIMULATION TOGGLE FOR BOARD PRESENTATION */}
           <button 
            onClick={onToggleSim} 
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-black text-[10px] uppercase transition-all ${
              isSimulating ? 'bg-orange-500 border-orange-400 text-white animate-pulse' : 'bg-slate-900 border-white/10 text-slate-400'
            }`}
          >
            {isSimulating ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            {isSimulating ? 'Drive Active' : 'Simulate Drive'}
          </button>
        </div>
      </header>

      <div className="bg-[#12161F] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
        <div onClick={onExpandMap} className="h-48 bg-slate-900 relative cursor-pointer group">
          <MapModule progress={simProgress} start={prevStop.coords} end={currentStop.coords} isMini />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12161F] via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="px-8 pb-8 -mt-6 relative z-10">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Target Stop</p>
          <h2 className="text-4xl font-black italic tracking-tighter leading-none">{currentStop?.name}</h2>
          
          <div className="flex items-center gap-3 py-6 overflow-x-auto no-scrollbar border-y border-white/5 my-6">
            {stops.map((stop: any, idx: number) => (
              <button key={stop.id} onClick={() => setActiveStopId(stop.id)} className={`flex-shrink-0 w-12 h-12 rounded-2xl border-2 transition-all ${activeStopId === stop.id ? 'bg-blue-600 border-blue-400 scale-110 shadow-lg' : 'bg-slate-800 border-transparent'}`}>
                <span className="font-black text-sm">{idx + 1}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={onBoard} className="bg-blue-600 p-6 rounded-[2.2rem] flex flex-col items-center gap-2 active:scale-95 transition-all">
              <UserPlusIcon className="w-8 h-8" />
              <span className="text-xs font-black uppercase tracking-widest">Boarding</span>
            </button>
            <div className="bg-black/40 border border-white/5 p-6 rounded-[2.2rem] flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{onboardCount}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase">Onboard</span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => toast.success("Delay reported to parents")} className="bg-slate-900 border border-white/10 p-6 rounded-[2.2rem] flex flex-col gap-4 text-left active:bg-slate-800 transition-all">
          <ClockIcon className="w-6 h-6 text-orange-500" />
          <div>
            <p className="text-sm font-black">Report Delay</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Auto-notify</p>
          </div>
        </button>
        <button onClick={onFinish} className="bg-white text-black p-6 rounded-[2.2rem] flex flex-col gap-4 text-left active:scale-95 transition-all">
          <CheckBadgeIcon className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm font-black">Finish Trip</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Post-Trip Log</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function TurnByTurnMap({ currentStop, prevStop, stops, setStops, onClose, isSimulating, simProgress }: any) {
  const [showManifest, setShowManifest] = useState(false);

  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 bg-[#07090D] z-[100] flex flex-col">
      <div className="bg-blue-600 p-8 pt-12 flex items-center gap-6 shadow-2xl z-20">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"><ChevronDoubleUpIcon className="w-10 h-10" /></div>
        <div className="flex-1">
          <p className="text-blue-200 font-black text-xs uppercase tracking-widest leading-none mb-1">{isSimulating ? Math.max(0, 800 - Math.floor(simProgress * 8)) : 800} ft</p>
          <h2 className="text-2xl font-black italic tracking-tighter leading-none">Turn on {currentStop?.name}</h2>
        </div>
        <button onClick={onClose} className="p-4 bg-black/20 rounded-full"><ChevronDownIcon className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 relative">
        <MapModule progress={simProgress} start={prevStop.coords} end={currentStop.coords} />
        
         {/* STOP MARKER */}
        <div className="absolute left-[70%] top-[30%] text-emerald-500 flex flex-col items-center">
            <MapPinIcon className="w-12 h-12" />
            <div className="bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase mt-1 shadow-2xl">{currentStop?.name}</div>
        </div>

        <div className="absolute top-6 right-6 flex flex-col gap-4">
           <button onClick={() => setShowManifest(true)} className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 border border-white/20"><Bars3BottomLeftIcon className="w-6 h-6" /></button>
           <button className="w-14 h-14 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10"><SpeakerWaveIcon className="w-6 h-6" /></button>
        </div>
        
        <div className="absolute bottom-10 inset-x-6 bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex items-center justify-between">
          <div className="flex gap-10">
            <div>
              <p className="text-2xl font-black text-white">{(0.8 * (1 - simProgress/100)).toFixed(1)}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase">Miles</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-500">08:24</p>
              <p className="text-[10px] font-black text-slate-500 uppercase">ETA</p>
            </div>
          </div>
          <button className="bg-blue-600 text-[10px] px-6 py-3 rounded-2xl font-black uppercase">End Trip</button>
          
        </div>
      </div>
          <AnimatePresence>
        {showManifest && (
          <motion.div initial={{ y: "100%" }} animate={{ y: "15%" }} exit={{ y: "100%" }} className="fixed inset-x-0 bottom-0 h-full bg-[#12161F] border-t border-white/10 rounded-t-[3rem] z-[110] p-8 pb-20">
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />
            <h4 className="text-xl font-black italic mb-6 uppercase">Route Sequence</h4>
            <Reorder.Group axis="y" values={stops} onReorder={setStops} className="space-y-3">
              {stops.map((stop: any) => (
                <Reorder.Item key={stop.id} value={stop} className={`p-5 rounded-3xl flex items-center justify-between border ${stop.id === currentStop?.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/5 border-transparent'}`}>
                  <div className="flex items-center gap-4">
                    <ArrowsUpDownIcon className="w-4 h-4 text-slate-600" />
                    <p className={`font-black ${stop.id === currentStop?.id ? 'text-blue-400' : 'text-white'}`}>{stop.name}</p>
                  </div>
                  {stop.id !== currentStop?.id && <button className="p-2 text-rose-500"><NoSymbolIcon className="w-5 h-5" /></button>}
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <button onClick={() => setShowManifest(false)} className="w-full py-5 bg-white text-black font-black uppercase rounded-[2rem] mt-8">Confirm Sequence</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// (InspectionItem, NavButton, PreTripSection, etc. remain logically the same but are styled to match the dark theme)
const InspectionItem = ({ title, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all ${active ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900/50 border-white/5'}`}>
    <span className={`font-black text-lg ${active ? 'text-white' : 'text-slate-400'}`}>{title}</span>
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${active ? 'bg-blue-500 border-blue-400' : 'border-slate-700'}`}>{active && <CheckIcon className="w-5 h-5" />}</div>
  </button>
);

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1">
    <div className={`${active ? 'text-blue-500' : 'text-slate-500'}`}>{icon}</div>
    <span className={`text-[10px] font-black uppercase ${active ? 'text-blue-500' : 'text-slate-500'}`}>{label}</span>
  </button>
);

function PreTripSection({ onComplete }: any) {
  const [checks, setChecks] = useState({ brakes: false, tires: false, lights: false });
  const allClear = Object.values(checks).every(Boolean);

  return (
    <div className="h-full flex flex-col pt-6">
      <header className="text-center mb-10">
        <h2 className="text-3xl font-black italic uppercase">Pre-Trip DVIR</h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Safety Checkpoint</p>
      </header>
      <div className="space-y-4 flex-1">
        <InspectionItem title="Brake Inspection" active={checks.brakes} onClick={() => setChecks(c => ({...c, brakes: !c.brakes}))} />
        <InspectionItem title="Tire Condition" active={checks.tires} onClick={() => setChecks(c => ({...c, tires: !c.tires}))} />
        <InspectionItem title="Signal Lights" active={checks.lights} onClick={() => setChecks(c => ({...c, lights: !c.lights}))} />
      </div>
      <button disabled={!allClear} onClick={onComplete} className={`w-full py-6 rounded-[2.5rem] font-black text-xl mb-10 ${allClear ? 'bg-blue-600' : 'bg-slate-800 text-slate-600'}`}>Verify & Start</button>
    </div>
  );
}

function BoardingManifest({ stop, students, onToggle, onBack }: any) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-slate-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ArrowLeftIcon className="w-4 h-4" /> Hub</button>
      <h3 className="text-3xl font-black italic uppercase">{stop?.name}</h3>
      <div className="space-y-3">
        {students.map((student: any) => (
          <button key={student.id} onClick={() => onToggle(student.id)} className={`w-full flex items-center justify-between p-5 rounded-[2.2rem] border-2 ${student.onboard ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900 border-white/5'}`}>
            <div className="text-left"><p className="font-black text-lg">{student.name}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{student.grade} Grade</p></div>
            {student.onboard && <CheckIcon className="w-6 h-6 text-emerald-500" />}
          </button>
        ))}
      </div>
      <button onClick={onBack} className="w-full bg-blue-600 py-6 rounded-[2.5rem] font-black text-xl">Finish Boarding</button>
    </div>
  );
}

function SafetyCloseout({ onBack }: any) {
  return (
    <div className="text-center py-20 space-y-10">
      <CheckBadgeIcon className="w-24 h-24 text-emerald-500 mx-auto" />
      <h2 className="text-4xl font-black italic uppercase">Trip Finalized</h2>
      <button onClick={onBack} className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black text-xl">Sign Out Duty</button>
    </div>
  );
}

function ProfileView({ onBack }: any) {
  return (
    <div className="space-y-8 flex flex-col items-center pt-10 text-center">
      <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border border-white/10 flex items-center justify-center"><UserCircleIcon className="w-20 h-20 text-slate-600" /></div>
      <h2 className="text-4xl font-black italic uppercase tracking-tighter">Op. Sarah Parker</h2>
      <button onClick={onBack} className="px-8 py-3 bg-white/5 rounded-full text-slate-500 font-black text-[10px] uppercase tracking-widest">Back to Dashboard</button>
      <div className="w-full bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8">
         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Certifications</h3>
         <div className="space-y-4">
           {['Class B CDL', 'School Bus Endorsement', 'First Aid Certified'].map((cert, i) => (
             <div key={i} className="flex items-center gap-3">
               <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
               <span className="font-bold text-sm text-slate-300">{cert}</span>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}