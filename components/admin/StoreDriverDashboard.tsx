"use client";

import React, { useState, useEffect } from "react";
import { 
  TruckIcon, CurrencyDollarIcon, 
  MapIcon, ClockIcon, CheckCircleIcon, 
  ExclamationCircleIcon, ChevronRightIcon,
  ShoppingBagIcon, ArchiveBoxIcon, BellIcon,
  UserCircleIcon, AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { 
  BoltIcon, 
  MapPinIcon, 
  CheckBadgeIcon,
  Squares2X2Icon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const DeliveryDriverDashboard = ({companyId, currentUserId}: { companyId: string; currentUserId: string }) => {
  const [activeTab, setActiveTab] = useState("deliveries");
  const [isOnline, setIsOnline] = useState(true);

  // Mock Data for the Delivery Queue
  const deliveries = [
    { id: "ORD-9921", client: "Tech Corp HQ", items: 4, type: "Fragile", status: "Priority", eta: "10 mins" },
    { id: "ORD-9844", client: "Sarah Jenkins", items: 1, type: "Standard", status: "Upcoming", eta: "25 mins" },
    { id: "ORD-9710", client: "Urban Cafe", items: 12, type: "Bulk", status: "Upcoming", eta: "45 mins" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-200 p-5 pb-28 font-sans">
      
      {/* --- TOP STATUS BAR --- */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden">
               <UserCircleIcon className="w-full h-full text-slate-500" />
            </div>
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-4 border-[#0A0C10] ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Alex Rivera</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Prime Logistics • ID: 882</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-slate-900 rounded-2xl border border-white/5 relative">
            <BellIcon className="h-6 w-6 text-slate-400" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0A0C10]" />
          </button>
        </div>
      </header>

      {/* --- REVENUE & PERFORMANCE HUD --- */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-cyan-600/20 to-blue-700/10 border border-cyan-500/20 p-5 rounded-[2.5rem]"
        >
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <CurrencyDollarIcon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Today's Pay</span>
          </div>
          <p className="text-3xl font-black text-white">$284.50</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-1">+12% vs Yesterday</p>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="bg-slate-900 border border-white/5 p-5 rounded-[2.5rem]"
        >
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <CheckBadgeIcon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Success Rate</span>
          </div>
          <p className="text-3xl font-black text-white">99.2%</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">48 Drops today</p>
        </motion.div>
      </section>

      {/* --- ACTIVE LOADOUT PREVIEW --- */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Active Loadout</h2>
          <span className="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">3 Orders Remaining</span>
        </div>

        {/* The Current Delivery "Hero" Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-[#12161F] border border-white/10 rounded-[2.5rem] overflow-hidden">
            
            {/* Context Map Overlay */}
            <div className="h-32 bg-slate-800 relative">
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-74.006,40.7128,14/600x400?access_token=YOUR_TOKEN')] bg-cover opacity-30 grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12161F] to-transparent" />
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">En Route to Drop 1</span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black mb-1">{deliveries[0].client}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-cyan-500" /> 122 Industrial Way, Suite B
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-cyan-400">{deliveries[0].eta}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated</p>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <ArchiveBoxIcon className="h-5 w-5 text-slate-500 mb-2" />
                  <p className="text-lg font-bold leading-none">{deliveries[0].items}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Items</p>
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <BoltIcon className="h-5 w-5 text-amber-500 mb-2" />
                  <p className="text-lg font-bold leading-none">{deliveries[0].type}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Handling</p>
                </div>
              </div>

              <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-3 transition-all active:scale-95">
                <Squares2X2Icon className="h-6 w-6" /> Complete Delivery
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- DELIVERY QUEUE --- */}
      <section className="mb-10">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Manifest Queue</h2>
        <div className="space-y-4">
          {deliveries.slice(1).map((item) => (
            <div key={item.id} className="bg-slate-900/50 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <ShoppingBagIcon className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">{item.client}</h4>
                  <p className="text-[10px] text-slate-500 font-black uppercase">{item.items} Items • {item.eta} wait</p>
                </div>
              </div>
              <button className="p-3 bg-slate-800 rounded-xl text-slate-400 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- TACTICAL BOTTOM DOCK --- */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#0F1219]/80 backdrop-blur-2xl border-t border-white/10 px-8 flex justify-between items-center z-50">
        <NavItem icon={<Squares2X2Icon />} label="Hub" active />
        <NavItem icon={<MapIcon />} label="Route" />
        <div className="relative -top-8">
           <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${isOnline ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
           >
              <BoltIcon className="h-8 w-8 text-white" />
           </button>
           <p className={`text-[9px] font-black uppercase text-center mt-2 tracking-widest ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
             {isOnline ? 'Online' : 'Offline'}
           </p>
        </div>
        <NavItem icon={<AdjustmentsHorizontalIcon />} label="Vehicle" />
        <NavItem icon={<CheckCircleIcon />} label="Earnings" />
      </nav>

    </div>
  );
};

const NavItem = ({ icon, label, active = false }: any) => (
  <button className="flex flex-col items-center gap-1">
    <div className={`h-6 w-6 ${active ? 'text-cyan-500' : 'text-slate-500'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-cyan-500' : 'text-slate-500'}`}>
      {label}
    </span>
  </button>
);

export default DeliveryDriverDashboard;