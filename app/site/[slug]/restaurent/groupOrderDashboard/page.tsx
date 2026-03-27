"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  UserGroupIcon, 
  ShareIcon, 
  LockClosedIcon, 
  FireIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  PlusIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/solid";

/* --- 1. MOCK GROUP DATA --- */
const GROUP_MEMBERS = [
  { id: 1, name: "Brenden (Host)", status: "Ready", items: 3, total: 4200, avatar: "https://i.pravatar.cc/150?u=brenden" },
  { id: 2, name: "Sarah", status: "Ordering...", items: 1, total: 1200, avatar: "https://i.pravatar.cc/150?u=sarah" },
  { id: 3, name: "Kimani", status: "Ready", items: 2, total: 2800, avatar: "https://i.pravatar.cc/150?u=kimani" },
];


// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


export default function GroupOrderDashboard() {
  const [isLobbyLocked, setIsLobbyLocked] = useState(false);
  
  const groupTotal = GROUP_MEMBERS.reduce((acc, m) => acc + m.total, 0);

  return (
    <main className="bg-stone-950 min-h-screen pt-32 pb-24 text-stone-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER: GROUP STATUS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-3">
                 {GROUP_MEMBERS.map(m => (
                   <div key={m.id} className="w-10 h-10 rounded-full border-2 border-stone-950 bg-stone-800 overflow-hidden">
                      <img src={m.avatar} alt={m.name} />
                   </div>
                 ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Lobby Code: NYM-402</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85]">
              The Friday <br /> <span className="text-white/20">Office</span> <span className="text-orange-500">Feast.</span>
            </h1>
          </div>

          <div className="flex gap-4">
             <button className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                <ShareIcon className="w-4 h-4" /> Invite Link
             </button>
             <button 
                onClick={() => setIsLobbyLocked(!isLobbyLocked)}
                className={`flex items-center gap-3 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isLobbyLocked ? 'bg-red-600' : 'bg-emerald-600'}`}
             >
                {isLobbyLocked ? <LockClosedIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />} 
                {isLobbyLocked ? "Lobby Locked" : "Accepting Orders"}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: MEMBER LIST & ITEM BREAKDOWN */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-stone-900/40 rounded-[3rem] border border-white/5 overflow-hidden">
               <div className="p-8 border-b border-white/5 flex justify-between items-center bg-stone-900/60">
                  <h3 className="text-xl font-bold italic tracking-tight uppercase">Participants</h3>
                  <span className="text-[10px] font-black text-stone-500 uppercase">{GROUP_MEMBERS.length} Active</span>
               </div>
               
               <div className="divide-y divide-white/5">
                  {GROUP_MEMBERS.map((member) => (
                    <div key={member.id} className="p-8 flex flex-wrap justify-between items-center gap-6 hover:bg-white/[0.02] transition-colors">
                       <div className="flex items-center gap-6">
                          <div className="relative">
                             <div className="w-16 h-16 rounded-2xl bg-stone-800 overflow-hidden">
                                <img src={member.avatar} alt={member.name} />
                             </div>
                             {member.status === "Ready" && (
                               <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-stone-900">
                                  <CheckCircleIcon className="w-3 h-3 text-white" />
                               </div>
                             )}
                          </div>
                          <div>
                             <p className="text-lg font-bold italic">{member.name}</p>
                             <p className={`text-[10px] font-black uppercase tracking-widest ${member.status === 'Ready' ? 'text-emerald-500' : 'text-orange-500 animate-pulse'}`}>
                                {member.status}
                             </p>
                          </div>
                       </div>

                       <div className="flex items-center gap-12">
                          <div className="text-right">
                             <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Items</p>
                             <p className="font-mono text-lg">{member.items}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Subtotal</p>
                             <p className="font-mono text-lg text-orange-500">{member.total.toLocaleString()}</p>
                          </div>
                          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-stone-950 transition-all">
                             <PlusIcon className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* LIVE ACTIVITY FEED */}
            <div className="p-8 bg-orange-600/5 rounded-[2.5rem] border border-orange-500/10 flex items-center gap-6">
               <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  <FireIcon className="w-6 h-6" />
               </div>
               <p className="text-sm font-medium text-orange-200 italic">
                  "Kimani just added **Swahili Fish Curry** to the shared basket. Smells like a good choice!"
               </p>
            </div>
          </div>

          {/* RIGHT: MASTER CHECKOUT */}
          <div className="lg:col-span-4 sticky top-32">
             <div className="bg-white rounded-[3.5rem] p-10 text-stone-950 shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8">
                   <ShoppingBagIcon className="w-10 h-10 text-stone-100" />
                </div>
                
                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-10">Total Bill</h3>
                
                <div className="space-y-6 mb-12">
                   <div className="flex justify-between items-end border-b border-stone-100 pb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 leading-none">Group Subtotal</span>
                      <span className="text-2xl font-mono tracking-tighter">KES {groupTotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-end border-b border-stone-100 pb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 leading-none">Split (3 Ways)</span>
                      <span className="text-lg font-mono tracking-tighter">~ KES {(groupTotal/3).toLocaleString()}</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <button className="w-full py-6 bg-stone-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-orange-500 transition-all shadow-xl">
                      Proceed to M-Pesa
                   </button>
                   <p className="text-[9px] font-bold text-stone-400 text-center uppercase tracking-widest">
                      Only Brenden (Host) can finalize payment.
                   </p>
                </div>

                <div className="mt-12 pt-8 border-t border-stone-50">
                   <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                      <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                      <p className="text-[10px] font-bold text-stone-600 leading-relaxed uppercase tracking-widest">
                         Split-Pay is enabled. Members will receive an M-Pesa prompt for their individual totals.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}