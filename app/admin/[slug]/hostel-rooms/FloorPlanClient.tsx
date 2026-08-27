"use client";

import React, { useState } from "react";
import { 
  HomeIcon, 
  MapIcon, 
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  Square3Stack3DIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const FloorPlanClient = () => {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const floorPlan = [
    { id: '101', type: 'Double', x: 'col-start-1', y: 'row-start-1', status: 'Full', maintenance: false },
    { id: '102', type: 'Single', x: 'col-start-2', y: 'row-start-1', status: 'Available', maintenance: false },
    { id: '103', type: 'Double', x: 'col-start-3', y: 'row-start-1', status: 'Partial', maintenance: true },
    { id: '104', type: 'Single', x: 'col-start-4', y: 'row-start-1', status: 'Full', maintenance: false },
    { id: 'Hallway', type: 'Utility', x: 'col-span-4', y: 'row-start-2', status: 'Transit' },
    { id: '105', type: 'Suite', x: 'col-start-1', y: 'row-start-3', status: 'Full', maintenance: false },
    { id: '106', type: 'Double', x: 'col-start-2', y: 'row-start-3', status: 'Available', maintenance: false },
    { id: 'Washroom', type: 'Utility', x: 'col-span-2', y: 'row-start-3', status: 'Utility' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-500 rounded-full" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Spatial Mapping</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Blueprint.</span>
            </h1>
          </div>

          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
            {[1, 2, 3, 4].map(f => (
              <button 
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`w-12 h-10 rounded-xl text-xs font-black transition-all ${selectedFloor === f ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-500 hover:text-white'}`}
              > F{f} </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Floor Plan Area */}
          <div className="lg:col-span-3 bg-slate-900/20 border border-slate-800 rounded-[3rem] p-12 relative overflow-hidden">
            {/* Blueprint Grid Lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

            <div className="grid grid-cols-4 grid-rows-3 gap-4 relative z-10">
              {floorPlan.map((unit) => (
                <div 
                  key={unit.id}
                  onMouseEnter={() => setHoveredRoom(unit.id)}
                  className={`${unit.x} ${unit.y} h-32 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group
                    ${unit.status === 'Full' ? 'bg-slate-900/80 border-slate-800' : 
                      unit.status === 'Available' ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' :
                      unit.status === 'Partial' ? 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10' :
                      'bg-slate-950/40 border-slate-800/50 grayscale'} 
                    ${unit.maintenance ? 'border-dashed border-rose-500/50' : ''}`}
                >
                  <span className="text-xs font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">{unit.id}</span>
                  {unit.status !== 'Transit' && unit.status !== 'Utility' && (
                    <div className="flex gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${unit.status === 'Full' ? 'bg-slate-700' : 'bg-emerald-400'}`} />
                      <div className={`h-1.5 w-1.5 rounded-full ${unit.status !== 'Available' ? 'bg-purple-500' : 'bg-slate-800'}`} />
                    </div>
                  )}
                  {unit.maintenance && <ExclamationTriangleIcon className="h-4 w-4 text-rose-500 absolute top-2 right-2 animate-pulse" />}
                </div>
              ))}
            </div>
            
            <div className="mt-12 flex justify-center gap-8 border-t border-slate-800 pt-8">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                <div className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500" /> Available
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                <div className="h-3 w-3 rounded bg-blue-500/20 border border-blue-500" /> Partially Occupied
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                <div className="h-3 w-3 rounded bg-slate-800 border border-slate-700" /> Full
              </div>
            </div>
          </div>

          {/* Contextual Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-purple-400" />
                Room Intelligence
              </h3>
              {hoveredRoom ? (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <p className="text-[10px] font-black text-purple-500 uppercase">Unit Detail</p>
                  <h4 className="text-2xl font-black text-white mt-1">Room {hoveredRoom}</h4>
                  <div className="mt-4 space-y-3 text-xs text-slate-400">
                    <p className="flex justify-between"><span>Type:</span> <span className="text-white font-bold">Double Executive</span></p>
                    <p className="flex justify-between"><span>Current Residents:</span> <span className="text-white font-bold">1/2</span></p>
                    <p className="flex justify-between"><span>Next Cleaning:</span> <span className="text-white font-bold">Tomorrow</span></p>
                  </div>
                  <button className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    Open Dossier
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">Hover over a room on the floor plan to view live telemetry...</p>
              )}
            </div>

            <div className="bg-rose-500/5 border border-rose-500/20 rounded-[2rem] p-6">
              <h4 className="text-[10px] font-black text-rose-500 uppercase mb-2 tracking-widest">Maintenance Alert</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Room <span className="text-white font-bold">103</span> has a reported plumbing leak. Water main in Wing A restricted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FloorPlanClient;