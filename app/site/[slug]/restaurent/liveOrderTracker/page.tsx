"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleIcon, 
  MapPinIcon, 
  FireIcon, 
  TruckIcon, 
  HomeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ClockIcon
} from "@heroicons/react/24/solid";

const trackerStages = [
  { id: 1, label: "Order Confirmed", icon: <CheckCircleIcon />, desc: "The kitchen has received your request." },
  { id: 2, label: "In the Pan", icon: <FireIcon />, desc: "Chef Kamau is preparing your Swahili Fusion Platter." },
  { id: 3, label: "On the Move", icon: <TruckIcon />, desc: "Rider is navigating the Nairobi traffic." },
  { id: 4, label: "Arriving", icon: <HomeIcon />, desc: "Your meal is at your doorstep. Enjoy!" },
];

export default function LiveOrderTracker() {
  const [currentStage, setCurrentStage] = useState(2); // Mocking "In the Pan"
  const [eta, setEta] = useState(18); // Minutes

  return (
    <main className="bg-stone-950 min-h-screen pt-32 pb-24 text-stone-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT: STATUS & MAP */}
        <div className="lg:col-span-8 space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Live Tracking Active</span>
              </div>
              <h1 className="text-6xl font-black italic tracking-tighter uppercase">Order <span className="text-orange-500">#SP-9201</span></h1>
            </div>
            <div className="bg-stone-900/50 border border-white/5 rounded-2xl p-6 flex items-center gap-6">
               <ClockIcon className="w-8 h-8 text-stone-500" />
               <div>
                  <p className="text-[10px] font-black uppercase text-stone-500">Estimated Arrival</p>
                  <p className="text-3xl font-bold italic">{eta} mins</p>
               </div>
            </div>
          </header>

          {/* THE PROGRESS BAR */}
          <div className="relative bg-stone-900/30 rounded-[3rem] p-10 border border-white/5">
            <div className="flex justify-between relative z-10">
               {trackerStages.map((stage) => (
                 <div key={stage.id} className="flex flex-col items-center text-center max-w-[120px]">
                    <motion.div 
                      animate={currentStage === stage.id ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 transition-all duration-700 ${currentStage >= stage.id ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'bg-stone-800 border-white/5 text-stone-600'}`}
                    >
                       {React.cloneElement(stage.icon as React.ReactElement, { className: "w-8 h-8" })}
                    </motion.div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${currentStage >= stage.id ? 'text-white' : 'text-stone-600'}`}>{stage.label}</p>
                 </div>
               ))}
            </div>
            {/* The Connecting Line */}
            <div className="absolute top-[62px] left-24 right-24 h-1 bg-stone-800 -z-0">
               <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: `${((currentStage - 1) / (trackerStages.length - 1)) * 100}%` }}
                 className="h-full bg-orange-500 shadow-[0_0_15px_#f97316]"
               />
            </div>
          </div>

          {/* MOCK MAP VIEW */}
          <div className="relative h-[450px] bg-stone-900 rounded-[4rem] overflow-hidden border border-white/5 group">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30" />
             {/* Map Pins */}
             <div className="absolute top-1/4 left-1/4">
                <div className="relative">
                  <div className="absolute -inset-4 bg-orange-500/20 rounded-full animate-ping" />
                  <MapPinIcon className="w-8 h-8 text-orange-500 relative z-10" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-stone-950 px-3 py-1 rounded-lg text-[10px] font-black whitespace-nowrap">The Kitchen</span>
                </div>
             </div>
             
             <div className="absolute bottom-1/3 right-1/3">
                <TruckIcon className="w-10 h-10 text-white animate-bounce" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-black whitespace-nowrap italic">Rider: Otieno</span>
             </div>

             {/* Map Overlay Info */}
             <div className="absolute bottom-8 left-8 right-8 p-6 bg-stone-950/80 backdrop-blur-xl rounded-[2.5rem] border border-white/10 flex flex-wrap justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-full bg-stone-800 overflow-hidden border-2 border-orange-500">
                      <img src="https://i.pravatar.cc/150?u=otieno" alt="Rider" />
                   </div>
                   <div>
                      <p className="text-lg font-bold">Otieno J.</p>
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Honda Sky-Runner • KMDQ 231</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500 transition-all">
                      <ChatBubbleLeftRightIcon className="w-6 h-6" />
                   </button>
                   <button className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 transition-all">
                      <PhoneIcon className="w-6 h-6" />
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY SUMMARY */}
        <div className="lg:col-span-4 sticky top-32">
          <div className="bg-white rounded-[3rem] p-10 text-stone-950 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16" />
             <h3 className="text-2xl font-black italic mb-8 uppercase tracking-tighter">Your Feast</h3>
             
             <div className="space-y-6 mb-10 pb-10 border-b border-stone-100">
                <div className="flex justify-between items-center">
                   <span className="font-bold">Swahili Platter x1</span>
                   <span className="text-stone-400 font-mono text-sm">KES 2,450</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-stone-500 italic">Extra Spice Sauce</span>
                   <span className="text-orange-500 font-bold">FREE</span>
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black uppercase text-stone-400">Paid via M-PESA</p>
                   <p className="font-black text-xl italic">KES 2,450</p>
                </div>
                <button className="w-full py-5 bg-stone-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-orange-500 transition-all">
                   View Digital Receipt
                </button>
             </div>
          </div>
          
          <div className="mt-8 p-8 bg-orange-500/10 rounded-[2.5rem] border border-orange-500/20 text-center">
             <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-2">Pro-Tip</p>
             <p className="text-sm italic text-orange-200">The Saffron Pilau is best enjoyed while steaming hot. Our rider is using a thermal-lock bag!</p>
          </div>
        </div>
      </div>
    </main>
  );
}