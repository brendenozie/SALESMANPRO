'use client';

import React, { useState } from 'react';
import { 
  WrenchScrewdriverIcon, 
  FireIcon, 
  ShieldCheckIcon, 
  ExclamationCircleIcon,
  TruckIcon,
  BeakerIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function VehicleClient({ initialVehicle }: any) {
  // Mock data if API is empty
  const vehicle = initialVehicle || {
    id: 'BUS-402',
    model: 'Blue Bird All American',
    plate: 'SCH-9920',
    fuelLevel: 75,
    lastInspection: '2024-05-20',
    odometer: '42,350 km',
    status: 'Ready'
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white p-6 pb-24">
      
      {/* HEADER: VEHICLE IDENTITY */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">{vehicle.id}</h1>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1">{vehicle.model}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Status: {vehicle.status}</span>
        </div>
      </header>

      {/* QUICK STATS GRID */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
          <div className="flex items-center gap-2 mb-2">
            <BeakerIcon className="h-4 w-4 text-blue-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase">Fuel Level</span>
          </div>
          <p className="text-2xl font-black italic">{vehicle.fuelLevel}%</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${vehicle.fuelLevel}%` }} />
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
          <div className="flex items-center gap-2 mb-2">
            <ArrowPathIcon className="h-4 w-4 text-purple-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase">Mileage</span>
          </div>
          <p className="text-2xl font-black italic">{vehicle.odometer}</p>
          <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">Next Service: 45k</p>
        </div>
      </div>

      {/* INSPECTION CHECKLIST CARD */}
      <section className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl shadow-blue-900/20 mb-8 relative overflow-hidden">
        <TruckIcon className="absolute -right-10 -bottom-10 h-64 w-64 opacity-10 rotate-12" />
        <div className="relative z-10">
          <h2 className="text-2xl font-black italic uppercase mb-2">Daily Inspection</h2>
          <p className="text-blue-100 text-sm mb-6 max-w-[200px]">Perform your walk-around check before departure.</p>
          
          <button className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-transform">
            <ClipboardDocumentCheckIcon className="h-5 w-5" /> Start Inspection
          </button>
        </div>
      </section>

      {/* SAFETY GEAR & SYSTEM STATUS */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Safety Systems</h3>
        
        <SystemRow icon={FireIcon} label="Fire Extinguisher" status="Inspected" date="Exp: 2025" />
        <SystemRow icon={ShieldCheckIcon} label="First Aid Kit" status="Complete" date="Verified Today" />
        <SystemRow icon={ExclamationCircleIcon} label="Emergency Exits" status="Functional" color="text-emerald-500" />
        
        <button className="w-full mt-4 flex items-center justify-center gap-3 py-6 rounded-[2rem] border border-dashed border-rose-500/30 text-rose-500 font-black italic hover:bg-rose-500/5 transition-all">
          <WrenchScrewdriverIcon className="h-5 w-5" /> REPORT MECHANICAL ISSUE
        </button>
      </div>

    </div>
  );
}

function SystemRow({ icon: Icon, label, status, date, color = "text-slate-400" }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-[2rem]">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl">
          <Icon className="h-5 w-5 text-slate-300" />
        </div>
        <div>
          <p className="font-bold text-sm">{label}</p>
          {date && <p className="text-[9px] font-black text-slate-600 uppercase">{date}</p>}
        </div>
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{status}</span>
    </div>
  );
}