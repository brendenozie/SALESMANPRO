"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ExclamationTriangleIcon, 
  LifebuoyIcon, 
  ShieldExclamationIcon,
  ChatBubbleBottomCenterTextIcon,
  VideoCameraIcon,
  MapPinIcon,
  PhotoIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const IncidentPageClient = () => {
  const incidents = [
    { id: 'INC-901', date: '2026-01-14', bus: 'BUS-202', type: 'Minor Collision', severity: 'Medium', status: 'Under Investigation', driver: 'Jane Cooper' },
    { id: 'INC-882', date: '2026-01-12', bus: 'BUS-101', type: 'Engine Smoking', severity: 'High', status: 'Resolved', driver: 'Robert Fox' },
    { id: 'INC-875', date: '2026-01-08', bus: 'VAN-03', type: 'Route Deviation', severity: 'Low', status: 'Logged', driver: 'Cody Fisher' },
  ];

  const getSeverityStyles = (level: string) => {
    switch (level) {
      case 'High': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Emergency Alert Glow */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/40 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em]">Safety & Compliance Watch</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Incident <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">Reports.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-rose-900/40">
            <ShieldExclamationIcon className="h-4 w-4" />
            Report New Incident
          </button>
        </header>

        {/* Incident Summary Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${getSeverityStyles(inc.severity)}`}>
                  {inc.severity} Severity
                </span>
                <span className="font-mono text-[10px] text-slate-600">{inc.id}</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{inc.type}</h3>
              <p className="text-xs text-slate-500 mb-6 flex items-center gap-2">
                <MapPinIcon className="h-3.5 w-3.5 text-rose-500" />
                Bus {inc.bus} • {inc.driver}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/40 rounded-2xl p-3 border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Status</p>
                  <p className="text-xs font-bold text-slate-300">{inc.status}</p>
                </div>
                <div className="bg-black/40 rounded-2xl p-3 border border-slate-800/50 text-right">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Date</p>
                  <p className="text-xs font-mono text-slate-300">{inc.date}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="flex gap-2">
                   <button title="View Footage" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all">
                      <VideoCameraIcon className="h-4 w-4" />
                   </button>
                   <button title="View Photos" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all">
                      <PhotoIcon className="h-4 w-4" />
                   </button>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-400 hover:text-rose-300">
                   Case File →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Protocol & Resources Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                 <LifebuoyIcon className="h-6 w-6 text-blue-400" />
                 Emergency Protocols
              </h3>
              <div className="space-y-4">
                 {[
                   'Immediate Driver Safety Check',
                   'Contact Local Authorities (if needed)',
                   'Notify Parents/Guardians via SMS',
                   'Dispatch Replacement Vehicle'
                 ].map((step, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                      <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-blue-500/20">
                         {i + 1}
                      </div>
                      <p className="text-sm text-slate-300">{step}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between">
              <div>
                <ChatBubbleBottomCenterTextIcon className="h-10 w-10 text-rose-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Internal Feedback</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  "The rapid response during the Jan 12 engine issue prevented a major delay. The replacement bus arrived within 12 minutes."
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-300">Compliance Audited</span>
                 </div>
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">View Full History</button>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
};

export default IncidentPageClient;