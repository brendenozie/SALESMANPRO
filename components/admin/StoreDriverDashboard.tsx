"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MapIcon, UserCircleIcon, ChevronRightIcon,
  ShoppingBagIcon, ArchiveBoxIcon, BellIcon,
  ArrowLeftIcon, CurrencyDollarIcon, TruckIcon,
  ClockIcon, MapPinIcon, CheckBadgeIcon, Squares2X2Icon,
  CameraIcon, PencilIcon, XMarkIcon, CheckIcon,
  FireIcon, SparklesIcon, Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { BoltIcon, PlayIcon, StarIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

// --- Types & Interfaces ---
interface Order {
  id: string;
  client: string;
  address: string;
  items: number;
  type: string;
  eta: string;
  payout: number;
  status: "active" | "pending" | "completed";
}

// --- Main Application Component ---
const TacticalLogisticsApp = ({companyId, currentUserId}: { companyId: string; currentUserId: string }) => {
  // Navigation & Workflow State
  const [activeTab, setActiveTab] = useState<"hub" | "profile">("hub");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [workflowStep, setWorkflowStep] = useState<"navigating" | "completing" | "summary">("navigating");
  
  // System State
  const [isOnline, setIsOnline] = useState(true);
  const [dailyEarnings, setDailyEarnings] = useState(284.50);
  
  // Mock Data
  const [orders, setOrders] = useState<Order[]>([
    { id: "ORD-9921", client: "Tech Corp HQ", address: "122 Industrial Way, B", items: 4, type: "Fragile", eta: "10 mins", payout: 15.50, status: "active" },
    { id: "ORD-9844", client: "Sarah Jenkins", address: "442 Oak Lane", items: 1, type: "Standard", eta: "25 mins", payout: 8.00, status: "pending" },
    { id: "ORD-9710", client: "Urban Cafe", address: "900 Market St", items: 12, type: "Bulk", eta: "45 mins", payout: 22.10, status: "pending" },
  ]);

  // Logic: Transition from Nav to POD
  const handleArrived = () => setWorkflowStep("completing");

  // Logic: Finalize Delivery
  const handleFinalize = (tip: number) => {
    setDailyEarnings(prev => prev + (currentOrder?.payout || 0) + tip);
    setWorkflowStep("summary");
  };

  // Logic: Return to Dashboard
  const handleReturnToHub = () => {
    setOrders(prev => prev.filter(o => o.id !== currentOrder?.id));
    setCurrentOrder(null);
    setWorkflowStep("navigating");
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* 1. Main Viewport */}
      <main className="p-5 pb-32">
        <AnimatePresence mode="wait">
          
          {/* PROFILE VIEW */}
          {activeTab === "profile" ? (
            <ProfileView key="profile" dailyTotal={dailyEarnings} />
          ) : (
            /* HUB/WORKFLOW VIEW */
            <motion.div key="hub-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {!currentOrder ? (
                /* 1.1 Dashboard */
                <Dashboard 
                  orders={orders} 
                  isOnline={isOnline} 
                  onSelect={(o: Order) => setCurrentOrder(o)} 
                />
              ) : (
                /* 1.2 Active Workflow Stack */
                <div className="space-y-6">
                  {workflowStep === "navigating" && (
                    <RouteNavigation 
                      order={currentOrder} 
                      onBack={() => setCurrentOrder(null)} 
                      onArrive={handleArrived} 
                    />
                  )}
                  {workflowStep === "completing" && (
                    <CompletionWorkflow 
                      order={currentOrder} 
                      onClose={() => setWorkflowStep("navigating")} 
                      onSuccess={handleFinalize} 
                    />
                  )}
                  {workflowStep === "summary" && (
                    <RouteSummary 
                      order={currentOrder} 
                      onDone={handleReturnToHub} 
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 2. Tactical Bottom Dock */}
      {(!currentOrder || (currentOrder && workflowStep === "navigating")) && (
        <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#0F1219]/90 backdrop-blur-2xl border-t border-white/10 px-12 flex justify-between items-center z-50">
          <NavButton 
            active={activeTab === "hub"} 
            onClick={() => { setActiveTab("hub"); setCurrentOrder(null); }} 
            icon={<Squares2X2Icon className="w-7 h-7" />} 
            label="Hub" 
          />

          <div className="relative -top-8">
             <button 
                onClick={() => setIsOnline(!isOnline)} 
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all border-4 border-[#0A0C10] active:scale-90 ${
                  isOnline ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-600 shadow-rose-600/40'
                }`}
             >
                <BoltIcon className="h-8 w-8 text-white" />
             </button>
             <p className={`text-[10px] font-black uppercase text-center mt-2 tracking-tighter ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isOnline ? 'Active' : 'Offline'}
             </p>
          </div>

          <NavButton 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")} 
            icon={<UserCircleIcon className="w-7 h-7" />} 
            label="Profile" 
          />
        </nav>
      )}
    </div>
  );
};

// --- Sub-Component: Dashboard ---
const Dashboard = ({ orders, isOnline, onSelect }: { orders: Order[]; isOnline: boolean; onSelect: (order: Order) => void }) => {
  const active = orders.find((o: Order) => o.status === "active");
  const pending = orders.filter((o: Order) => o.status === "pending");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white">Logistics Hub</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Deployment Zone: Alpha</p>
        </div>
        <div className="flex gap-2">
            <button className="p-3 bg-slate-900 rounded-2xl border border-white/5"><BellIcon className="w-5 h-5 text-slate-400" /></button>
        </div>
      </header>

      {/* Active Banner */}
      {active && (
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Active Assignment</h3>
            <span className="text-[10px] font-bold text-cyan-400 animate-pulse">Live</span>
          </div>
          <div 
            onClick={() => onSelect(active)}
            className="bg-gradient-to-br from-cyan-600/20 to-blue-600/5 border border-cyan-500/30 rounded-[2.5rem] p-6 cursor-pointer relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                    <h4 className="text-2xl font-black text-white">{active.client}</h4>
                    <p className="text-sm text-slate-400 mt-1">{active.address}</p>
                </div>
                <div className="bg-cyan-500 rounded-2xl p-3 shadow-lg shadow-cyan-500/30"><PlayIcon className="w-6 h-6 text-white" /></div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-bold">
                    <ClockIcon className="w-4 h-4 text-cyan-500" /> {active.eta}
                </div>
                <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-bold">
                    <CurrencyDollarIcon className="w-4 h-4 text-emerald-500" /> ${active.payout.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Queue */}
      <section>
        <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4 px-1 tracking-[0.2em]">Manifest Queue</h3>
        <div className="space-y-3">
          {pending.map((order: Order) => (
            <div key={order.id} onClick={() => onSelect(order)} className="bg-slate-900/50 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between cursor-pointer active:bg-slate-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center"><ShoppingBagIcon className="w-6 h-6 text-slate-500" /></div>
                <div>
                  <p className="font-bold text-white">{order.client}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{order.items} Items • {order.address.split(',')[0]}</p>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-600" />
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

// --- Sub-Component: Route Navigation ---
const RouteNavigation = ({ order, onBack, onArrive }: any) => (
  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest"><ArrowLeftIcon className="w-4 h-4" /> Cancel Route</button>
    
    <div className="h-72 bg-slate-800 rounded-[3rem] overflow-hidden relative border border-white/10">
       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800')] bg-cover grayscale opacity-40" />
       <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] to-transparent" />
       <div className="absolute bottom-8 left-8 right-8">
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Target Coordinates</p>
          <h2 className="text-3xl font-black text-white leading-none">{order.address}</h2>
       </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
        <StatTile label="Est. Drive" value={order.eta} icon={<ClockIcon className="text-cyan-500" />} />
        <StatTile label="Base Pay" value={`$${order.payout.toFixed(2)}`} icon={<CurrencyDollarIcon className="text-emerald-500" />} />
    </div>

    <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5">
       <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Special Handling</p>
       <p className="text-sm text-slate-300 italic font-medium">"Package is {order.type.toLowerCase()}. Leave at the side entrance near the blue gate."</p>
    </div>

    <button onClick={onArrive} className="w-full bg-cyan-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl shadow-cyan-900/40 active:scale-95 transition-all">
      Confirm Arrival
    </button>
  </motion.div>
);

// --- Sub-Component: Completion Workflow ---
const CompletionWorkflow = ({ order, onClose, onSuccess }: any) => {
  const [method, setMethod] = useState<"none" | "sig" | "photo">("none");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 bg-[#0A0C10] z-[100] p-6 flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <button onClick={onClose} className="p-3 bg-slate-900 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
        <h2 className="text-xs font-black uppercase tracking-[0.3em]">Proof of Delivery</h2>
        <div className="w-12" />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {method === "none" ? (
          <div className="space-y-4">
            <MethodCard onClick={() => setMethod("sig")} icon={<PencilIcon className="text-cyan-500" />} label="Digital Signature" desc="Customer signs on screen" />
            <MethodCard onClick={() => setMethod("photo")} icon={<CameraIcon className="text-emerald-500" />} label="Photo Verification" desc="Take a photo of the parcel" />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] flex items-center justify-center relative overflow-hidden">
               {method === "sig" ? (
                 <canvas ref={canvasRef} className="w-full h-full touch-none" />
               ) : (
                 <div className="text-center">
                    <CameraIcon className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 font-bold text-xs uppercase">Viewfinder Active</p>
                 </div>
               )}
            </div>
            <button onClick={() => onSuccess(5.50)} className="mt-8 py-6 bg-white text-black rounded-[2.5rem] font-black text-xl">Confirm & Finalize</button>
            <button onClick={() => setMethod("none")} className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Change Method</button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Sub-Component: Route Summary ---
const RouteSummary = ({ order, onDone }: any) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-10">
      <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/50 rounded-full flex items-center justify-center mb-6">
        <CheckBadgeIcon className="w-10 h-10 text-emerald-500" />
      </div>
      <h2 className="text-3xl font-black text-white mb-2">Delivery Success</h2>
      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-10">Mission Parameters Met</p>

      <div className="w-full grid grid-cols-2 gap-4 mb-4">
        <StatTile label="Total Time" value="14:02" icon={<ClockIcon className="text-amber-500" />} />
        <StatTile label="Rating" value="5.0" icon={<StarIcon className="text-yellow-500" />} />
      </div>

      <div className="w-full bg-slate-900 border border-white/5 p-8 rounded-[3rem] mb-10">
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Payout Credited</p>
         <p className="text-5xl font-black text-white mb-4">${(order.payout + 5.50).toFixed(2)}</p>
         <div className="flex items-center justify-center gap-2 text-emerald-500 text-xs font-black uppercase">
            <SparklesIcon className="w-4 h-4" /> Includes $5.50 Tip
         </div>
      </div>

      <button onClick={onDone} className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black text-xl">Back to Hub</button>
    </motion.div>
  );
};

// --- Sub-Component: Profile ---
const ProfileView = ({ dailyTotal }: { dailyTotal: number }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="flex flex-col items-center py-10">
      <div className="w-28 h-28 rounded-full border-4 border-slate-900 shadow-2xl overflow-hidden mb-4">
        <UserCircleIcon className="w-full h-full text-slate-700 p-2" />
      </div>
      <h2 className="text-3xl font-black">Alex Rivera</h2>
      <p className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.3em]">Elite Logistics Op</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
       <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-white/5">
          <CurrencyDollarIcon className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-2xl font-black text-white">${dailyTotal.toFixed(2)}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Session Total</p>
       </div>
       <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-white/5">
          <TruckIcon className="w-6 h-6 text-cyan-500 mb-2" />
          <p className="text-2xl font-black text-white">Tesla M3</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Assigned Vehicle</p>
       </div>
    </div>

    <div className="bg-slate-900/50 rounded-[2.5rem] p-8 border border-white/5">
        <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-6">Service Records</h3>
        {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-sm font-bold text-slate-300">Deployment #{820 + i}</p>
                </div>
                <p className="font-black text-white">+$22.40</p>
            </div>
        ))}
    </div>
  </motion.div>
);

// --- Shared Helper Components ---

const StatTile = ({ label, value, icon }: any) => (
    <div className="bg-slate-900 p-5 rounded-[2rem] border border-white/5 flex flex-col items-start">
        <div className="w-5 h-5 mb-2">{icon}</div>
        <p className="text-xl font-black text-white">{value}</p>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
);

const MethodCard = ({ icon, label, desc, onClick }: any) => (
    <button onClick={onClick} className="w-full bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 text-left active:border-cyan-500/50 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">{icon}</div>
        <div>
            <p className="font-black text-white uppercase tracking-widest text-sm">{label}</p>
            <p className="text-xs text-slate-500 font-medium">{desc}</p>
        </div>
    </button>
);

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <div className={`transition-all ${active ? 'text-cyan-500 scale-110' : 'text-slate-500'}`}>{icon}</div>
    <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'text-cyan-500' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default TacticalLogisticsApp;