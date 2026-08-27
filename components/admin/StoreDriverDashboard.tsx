"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { 
  UserCircleIcon, ChevronRightIcon, ShoppingBagIcon, 
  ArrowLeftIcon, CurrencyDollarIcon, TruckIcon, 
  ClockIcon, CheckBadgeIcon, Squares2X2Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { BoltIcon, PlayIcon as PlaySolid } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// --- Types ---
type Coords = { lat: number; lng: number };

interface Order {
  id: string;
  client: string;
  address: string;
  items: number;
  type: string;
  eta: string;
  payout: number;
  status: "active" | "pending" | "completed";
  startCoords: Coords;
  destination: Coords;
}

// --- Tactical Map Engine ---
const MapModule = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, Circle, Polyline, useMap } = await import("react-leaflet");
    const L = await import("leaflet");

    // Internal helper for camera tracking
    const MapRecenter = ({ coords }: { coords: [number, number] }) => {
      const map = useMap();
      useEffect(() => {
        map.setView(coords, map.getZoom(), { animate: true });
      }, [coords, map]);
      return null;
    };

    return ({ progress, start, end }: { progress: number; start: Coords; end: Coords }) => {
      // Calculate current position via interpolation
      const currentPos: [number, number] = [
        start.lat + (end.lat - start.lat) * (progress / 100),
        start.lng + (end.lng - start.lng) * (progress / 100),
      ];

      // Calculate Bearing (Rotation) for the truck
      const calculateBearing = (s: Coords, e: Coords) => {
        const y = Math.sin(e.lng - s.lng) * Math.cos(e.lat);
        const x = Math.cos(s.lat) * Math.sin(e.lat) - Math.sin(s.lat) * Math.cos(e.lat) * Math.cos(e.lng - s.lng);
        return (Math.atan2(y, x) * 180) / Math.PI;
      };

      const bearing = calculateBearing(start, end);

      const truckIcon = L.divIcon({
        className: "custom-icon",
        html: `<div style="transform: rotate(${bearing}deg); transition: transform 0.2s ease-out;" 
                    class="bg-cyan-500 p-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.8)] border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="white" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.806H14.25M16.5 18.75h-2.25m0-11.25v11.25m0-11.25h-4.875c-.621 0-1.125.504-1.125 1.125V18" />
                </svg>
              </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      return (
        <div className="h-full w-full relative">
          <MapContainer center={currentPos} zoom={15} zoomControl={false} className="h-full w-full grayscale brightness-[0.7] contrast-[1.2]">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            <MapRecenter coords={currentPos} />

            {/* Tactical Path Polylines */}
            <Polyline 
              positions={[[start.lat, start.lng], [end.lat, end.lng]]} 
              pathOptions={{ color: '#22d3ee', weight: 8, opacity: 0.1 }} 
            />
            <Polyline 
              positions={[[start.lat, start.lng], [end.lat, end.lng]]} 
              pathOptions={{ color: '#22d3ee', weight: 2, dashArray: '12, 12', opacity: 0.6 }} 
            />

            {/* Destination Node */}
            <Circle 
              center={[end.lat, end.lng]} 
              radius={100} 
              pathOptions={{ color: "#06b6d4", weight: 2, fillOpacity: 0.2, dashArray: "5, 5" }} 
            />
            <Marker position={[end.lat, end.lng]} />

            {/* Start Node */}
            <Circle 
              center={[start.lat, start.lng]} 
              radius={40} 
              pathOptions={{ color: "#475569", weight: 1, fillOpacity: 0.1 }} 
            />

            {/* The Asset (Truck) */}
            <Marker position={currentPos} icon={truckIcon} />
          </MapContainer>
          
          {/* Real-time Telemetry HUD */}
          <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">Live Stream</p>
              </div>
              <p className="font-mono text-[10px] text-white/80 leading-tight">
                LAT: {currentPos[0].toFixed(5)}<br/>
                LNG: {currentPos[1].toFixed(5)}<br/>
                HDG: {bearing.toFixed(1)}°
              </p>
            </div>
          </div>
        </div>
      );
    };
  },
  { ssr: false, loading: () => (
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest">Establishing Uplink...</p>
    </div>
  )}
);

// --- Main Application Component ---
export default function TacticalLogisticsApp({ companyId, currentUserId }: { companyId: string; currentUserId: string }) {
  const [activeTab, setActiveTab] = useState<"hub" | "profile">("hub");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [workflowStep, setWorkflowStep] = useState<"navigating" | "completing" | "summary">("navigating");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [dailyEarnings, setDailyEarnings] = useState(412.85);

  const [orders] = useState<Order[]>([
    { 
        id: "X-RAY-1", client: "Cyberdyne Systems", address: "Tech Plaza, Sector 7", items: 12, type: "High Priority", eta: "8 mins", payout: 24.50, status: "active",
        startCoords: { lat: 40.7128, lng: -74.0060 }, destination: { lat: 40.7306, lng: -73.9352 }
    },
    { 
        id: "ZULU-9", client: "Arakis Exports", address: "Pier 44, Bulk Loading", items: 2, type: "Standard", eta: "19 mins", payout: 14.00, status: "pending",
        startCoords: { lat: 40.7306, lng: -73.9352 }, destination: { lat: 40.7589, lng: -73.9851 }
    },
  ]);

  // Simulation Engine
  useEffect(() => {
    let interval: any;
    if (isSimulating && workflowStep === "navigating" && currentOrder) {
      interval = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            setWorkflowStep("completing");
            toast.success("Arrival: Target Reached", { 
              icon: <CheckBadgeIcon className="w-5 h-5 text-cyan-400" />,
              style: { background: '#0F172A', color: '#fff', border: '1px solid #1E293B' } 
            });
            return 100;
          }
          return prev + 0.5; 
        });
      }, 60);
    }
    return () => clearInterval(interval);
  }, [isSimulating, workflowStep, currentOrder]);

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <Toaster position="top-center" />
      
      <main className="p-6 pb-32 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "profile" ? (
            <ProfileView key="profile" dailyTotal={dailyEarnings} />
          ) : (
            <motion.div key="hub-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!currentOrder ? (
                <Dashboard 
                  orders={orders} 
                  isOnline={isOnline} 
                  onSelect={(o: Order) => { setCurrentOrder(o); setSimProgress(0); }} 
                  isSimulating={isSimulating}
                  onToggleSim={() => setIsSimulating(!isSimulating)}
                />
              ) : (
                <div className="space-y-6">
                  {workflowStep === "navigating" && (
                    <RouteNavigation 
                      order={currentOrder} 
                      simProgress={simProgress}
                      isSimulating={isSimulating}
                      onBack={() => { setCurrentOrder(null); setIsSimulating(false); }} 
                      onArrive={() => setWorkflowStep("completing")} 
                    />
                  )}
                  {workflowStep === "completing" && (
                    <CompletionWorkflow 
                      onClose={() => setWorkflowStep("navigating")} 
                      onSuccess={(tip: number) => {
                        setDailyEarnings(prev => prev + (currentOrder?.payout || 0) + tip);
                        setWorkflowStep("summary");
                      }} 
                    />
                  )}
                  {workflowStep === "summary" && (
                    <RouteSummary 
                      order={currentOrder} 
                      onDone={() => { setCurrentOrder(null); setWorkflowStep("navigating"); }} 
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Tactical Dock */}
      {(!currentOrder || workflowStep === "navigating") && (
        <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-3xl border-t border-white/5 px-12 flex justify-between items-center z-[5000]">
          <NavButton active={activeTab === "hub"} onClick={() => { setActiveTab("hub"); setCurrentOrder(null); }} icon={<Squares2X2Icon className="w-7 h-7" />} label="Command" />
          <div className="relative -top-8">
             <button onClick={() => setIsOnline(!isOnline)} className={`w-16 h-16 rounded-3xl flex items-center justify-center border-4 border-[#07080A] transition-all duration-500 shadow-2xl ${isOnline ? 'bg-cyan-500 rotate-0' : 'bg-rose-600 rotate-45'}`}>
                <BoltIcon className="h-8 w-8 text-white" />
             </button>
             <p className={`text-[10px] font-black uppercase text-center mt-2 tracking-widest ${isOnline ? 'text-cyan-500' : 'text-rose-500'}`}>{isOnline ? 'Ready' : 'Standby'}</p>
          </div>
          <NavButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<UserCircleIcon className="w-7 h-7" />} label="Operator" />
        </nav>
      )}
    </div>
  );
}

// --- Sub-Views ---

const Dashboard = ({ orders, onSelect, isSimulating, onToggleSim }: any) => {
  const active = orders.find((o: Order) => o.status === "active");
  const pending = orders.filter((o: Order) => o.status === "pending");

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Operations</h2>
          <p className="text-[10px] text-cyan-500/60 font-black uppercase tracking-[0.3em] mt-2">Active Grid: Industrial </p>
        </div>
        <button 
          onClick={onToggleSim}
          className={`px-4 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${isSimulating ? 'bg-cyan-500 border-cyan-400 text-white animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
        >
          {isSimulating ? "Signal Active" : "Run Simulation"}
        </button>
      </header>

      {active && (
        <motion.div 
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(active)}
          className="bg-gradient-to-br from-cyan-600/20 to-transparent border border-cyan-500/30 rounded-[2.5rem] p-8 cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TruckIcon className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h4 className="text-2xl font-black text-white">{active.client}</h4>
              <p className="text-sm text-slate-400 font-medium">{active.address}</p>
            </div>
            <div className="bg-cyan-500 rounded-2xl p-3 shadow-xl group-hover:scale-110 transition-transform"><PlaySolid className="w-6 h-6 text-white" /></div>
          </div>
          <div className="flex gap-3 relative z-10">
            <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 text-[11px] font-black text-cyan-400 flex items-center gap-2 uppercase tracking-widest border border-white/5"><ClockIcon className="w-4 h-4" /> {active.eta}</div>
            <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 text-[11px] font-black text-emerald-400 flex items-center gap-2 uppercase tracking-widest border border-white/5"><CurrencyDollarIcon className="w-4 h-4" /> ${active.payout.toFixed(2)}</div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-slate-600 px-1 tracking-[0.4em]">Queue</h3>
        {pending.map((order: Order) => (
          <motion.div key={order.id} whileTap={{ scale: 0.98 }} onClick={() => onSelect(order)} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between cursor-pointer hover:border-white/10 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/5 shadow-inner"><ShoppingBagIcon className="w-6 h-6 text-slate-500" /></div>
              <div>
                <p className="font-bold text-white text-lg">{order.client}</p>
                <p className="text-[10px] text-cyan-500/50 font-black uppercase tracking-widest">{order.items} Units • {order.type}</p>
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-slate-700" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const RouteNavigation = ({ order, simProgress, isSimulating, onBack, onArrive }: any) => (
  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors">
      <ArrowLeftIcon className="w-4 h-4" /> Disengage
    </button>
    
    <div className="h-[450px] bg-slate-900 rounded-[3.5rem] overflow-hidden relative border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        <MapModule progress={simProgress} start={order.startCoords} end={order.destination} />
        
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-[1001]">
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-1">Destination Node</p>
          <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{order.address}</h2>
        </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
        <StatTile label="T-Minus" value={isSimulating ? `${Math.max(1, 8 - Math.floor(simProgress/12))}m` : order.eta} icon={<ClockIcon className="text-cyan-500" />} />
        <StatTile label="Yield" value={`$${order.payout.toFixed(2)}`} icon={<CurrencyDollarIcon className="text-emerald-500" />} />
    </div>

    <button onClick={onArrive} className="w-full bg-cyan-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-[0_20px_40px_rgba(8,145,178,0.3)] active:scale-95 transition-all">
      Confirm Delivery
    </button>
  </motion.div>
);

// --- Global UI Components ---

const StatTile = ({ label, value, icon }: any) => (
  <div className="bg-white/5 p-6 rounded-[2.2rem] border border-white/5 flex flex-col items-start w-full shadow-inner">
    <div className="w-6 h-6 mb-3 opacity-80">{icon}</div>
    <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1.5 outline-none">
    <div className={`transition-all duration-300 ${active ? 'text-cyan-500 scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-slate-600'}`}>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${active ? 'text-cyan-500' : 'text-slate-600'}`}>{label}</span>
  </button>
);

const CompletionWorkflow = ({ onSuccess, onClose }: any) => (
  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} className="fixed inset-0 bg-[#07080A] z-[9000] p-8 flex flex-col">
    <div className="flex justify-between items-center mb-16">
      <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl border border-white/5"><XMarkIcon className="w-6 h-6" /></button>
      <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500">Verification Phase</h2>
      <div className="w-14" />
    </div>
    <div className="flex-1 flex flex-col items-center justify-center space-y-12">
      <div className="text-center">
        <p className="text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-2">Awaiting Client Approval</p>
        <div className="flex gap-2 justify-center">
            {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
        </div>
      </div>
      <button onClick={() => onSuccess(8.25)} className="w-full py-7 bg-white text-black rounded-[2.5rem] font-black text-xl shadow-2xl active:scale-95 transition-all">Complete Handover</button>
    </div>
  </motion.div>
);

const RouteSummary = ({ order, onDone }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-12">
    <div className="w-28 h-28 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
      <CheckBadgeIcon className="w-14 h-14 text-emerald-500" />
    </div>
    <h2 className="text-5xl font-black text-white mb-3 italic tracking-tighter uppercase">Mission Logged</h2>
    <p className="text-slate-500 font-medium mb-12 uppercase text-[10px] tracking-[0.4em]">Transaction Hash: 0x44F...92E</p>
    
    <div className="w-full bg-white/5 border border-white/5 p-10 rounded-[3.5rem] mb-12 shadow-2xl">
       <p className="text-[10px] font-black text-cyan-500/50 uppercase tracking-[0.4em] mb-4">Total Credit</p>
       <p className="text-7xl font-black text-white tracking-tighter italic">${(order.payout + 8.25).toFixed(2)}</p>
    </div>
    
    <button onClick={onDone} className="w-full py-7 bg-cyan-600 text-white rounded-[2.5rem] font-black text-xl active:scale-95 transition-all shadow-xl">Return to Command</button>
  </motion.div>
);

const ProfileView = ({ dailyTotal }: any) => (
  <div className="space-y-10">
    <div className="flex flex-col items-center py-12 relative">
      <div className="absolute top-0 w-full h-32 bg-cyan-500/5 blur-[100px] -z-10" />
      <div className="w-32 h-32 rounded-[3rem] bg-slate-900 border-2 border-white/5 flex items-center justify-center mb-6 shadow-2xl overflow-hidden">
        <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center">
            <UserCircleIcon className="w-20 h-20 text-slate-500" />
        </div>
      </div>
      <h2 className="text-4xl font-black italic uppercase tracking-tighter">Alex Rivera</h2>
      <div className="mt-2 px-4 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
        <p className="text-cyan-500 font-black text-[9px] uppercase tracking-[0.4em]">Rank: Elite Courier</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
       <StatTile label="Session Yield" value={`$${dailyTotal.toFixed(2)}`} icon={<CurrencyDollarIcon className="text-emerald-500" />} />
       <StatTile label="Asset Unit" value="Model S-Tactical" icon={<TruckIcon className="text-cyan-500" />} />
    </div>

    <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Service History</h4>
        <div className="space-y-4">
            {[1,2].map(i => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                            <p className="text-sm font-bold text-white">Zone Alpha Delivery</p>
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Yesterday</p>
                        </div>
                    </div>
                    <p className="font-black text-white/60">+$32.10</p>
                </div>
            ))}
        </div>
    </div>
  </div>
);