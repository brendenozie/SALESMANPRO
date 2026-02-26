'use client';

import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon, 
  UserGroupIcon, 
  WrenchIcon, 
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronRightIcon,
  PlusIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'behavior', label: 'Student Behavior', icon: UserGroupIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'mechanical', label: 'Mechanical Issue', icon: WrenchIcon, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'traffic', label: 'Traffic / Delay', icon: ClockIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'other', label: 'General Report', icon: ChatBubbleBottomCenterTextIcon, color: 'text-slate-400', bg: 'bg-white/5' },
];

export default function IncidentsClient({ initialIncidents }: any) {
  const [incidents, setIncidents] = useState(initialIncidents || [
    { id: 1, type: 'traffic', title: 'Construction on 5th Ave', time: '08:15 AM', status: 'sent' },
    { id: 2, type: 'behavior', title: 'Seating Dispute - Grade 4', time: '07:45 AM', status: 'resolved' },
  ]);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white p-6 pb-24">
      
      {/* HEADER */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BellAlertIcon className="h-5 w-5 text-rose-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Dispatch Comms</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Incidents & Logs</h1>
      </header>

      {/* QUICK ACTION TILES */}
      <section className="mb-12">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 px-2">New Report</h2>
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id}
              className={`p-6 rounded-[2.5rem] border border-white/5 ${cat.bg} flex flex-col items-start gap-4 active:scale-95 transition-all group`}
            >
              <cat.icon className={`h-8 w-8 ${cat.color} group-hover:scale-110 transition-transform`} />
              <span className="font-bold text-sm text-left leading-tight">{cat.label}</span>
              <div className="mt-2 bg-white/10 p-2 rounded-full">
                <PlusIcon className="h-4 w-4 text-white" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* RECENT FEED */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Activity</h2>
          <button className="text-[10px] font-black text-blue-500 uppercase">View All</button>
        </div>

        <div className="space-y-3">
          {incidents.map((item: any) => (
            <div 
              key={item.id}
              className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex items-center justify-between group hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-white/5`}>
                  {item.type === 'traffic' && <ClockIcon className="h-6 w-6 text-blue-500" />}
                  {item.type === 'behavior' && <UserGroupIcon className="h-6 w-6 text-amber-500" />}
                </div>
                <div>
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase mt-1">{item.time} • {item.status}</p>
                </div>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-slate-700 group-hover:text-white transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* EMERGENCY HOTLINE */}
      <div className="mt-12 p-8 bg-rose-600 rounded-[3rem] shadow-2xl shadow-rose-900/30 flex items-center justify-between relative overflow-hidden">
        <ExclamationTriangleIcon className="absolute -right-6 -bottom-6 h-32 w-32 opacity-20" />
        <div className="relative z-10">
          <h3 className="text-xl font-black italic uppercase">Critical Alert</h3>
          <p className="text-rose-100 text-xs font-bold mt-1">Direct line to Emergency Dispatch</p>
        </div>
        <button className="relative z-10 bg-white text-rose-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-transform">
          Call Now
        </button>
      </div>

    </div>
  );
}