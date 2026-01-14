"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  TruckIcon, 
  MapPinIcon, 
  WrenchScrewdriverIcon, 
  UserGroupIcon, 
  Battery50Icon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  PlusIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";

const TransportFleetClient = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const fleet = [
    { id: 'BUS-101', plate: 'K-TX 2024', driver: 'Robert Fox', route: 'North Circuit', status: 'Active', fuel: 82, occupancy: '42/50', health: 'Optimal' },
    { id: 'BUS-202', plate: 'K-AX 2026', driver: 'Jane Cooper', route: 'Downtown Express', status: 'In Service', fuel: 15, occupancy: '12/32', health: 'Warning' },
    { id: 'VAN-05', plate: 'K-MS 9912', driver: 'Cody Fisher', route: 'Staff Shuttle', status: 'Maintenance', fuel: 100, occupancy: '0/12', health: 'Repair' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Moving Background Gradient (Subtle Road Effect) */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent -z-10 shadow-[0_0_50px_rgba(234,179,8,0.1)]" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-yellow-500 rounded-full" />
              <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em]">Fleet Operations</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Vehicle <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Logistics.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all">
              <GlobeAltIcon className="h-4 w-4" />
              Live Map
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-bold text-xs transition-all shadow-lg shadow-yellow-500/20 active:scale-95">
              <PlusIcon className="h-4 w-4 stroke-[3px]" />
              Add Vehicle
            </button>
          </div>
        </header>

        {/* Fleet Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Fleet', value: '18 Units', sub: '3 Standby', icon: TruckIcon, color: 'text-yellow-500' },
            { label: 'On Route', value: '14 Active', sub: '92% Efficiency', icon: MapPinIcon, color: 'text-emerald-500' },
            { label: 'Maintenance', value: '2 Pending', sub: 'Schedule Next Week', icon: WrenchScrewdriverIcon, color: 'text-rose-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-2xl">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-xl font-black text-white">{stat.value}</h3>
                  <p className="text-[10px] text-slate-600 mt-0.5">{stat.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {fleet.map((bus) => (
            <div key={bus.id} className="group relative bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-8 hover:bg-slate-900/50 transition-all overflow-hidden border-t-4 border-t-slate-800 hover:border-t-yellow-500">
              
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                {/* Left: Vehicle Identity */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    {bus.status}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{bus.id}</h2>
                    <p className="text-sm font-mono text-slate-500">{bus.plate}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-8 w-8 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center">
                      <UserGroupIcon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-600 uppercase">Primary Pilot</p>
                      <p className="text-xs text-slate-300">{bus.driver}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Telemetrics */}
                <div className="flex-grow grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-3xl p-4 border border-slate-800/50">
                    <div className="flex justify-between items-center mb-2">
                      <Battery50Icon className={`h-4 w-4 ${bus.fuel < 20 ? 'text-rose-500 animate-pulse' : 'text-yellow-500'}`} />
                      <span className="text-xs font-bold text-white">{bus.fuel}%</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Fuel Reserve</p>
                    <div className="h-1 w-full bg-slate-800 rounded-full mt-2">
                      <div className={`h-full rounded-full ${bus.fuel < 20 ? 'bg-rose-500' : 'bg-yellow-500'}`} style={{ width: `${bus.fuel}%` }} />
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-3xl p-4 border border-slate-800/50">
                    <div className="flex justify-between items-center mb-2">
                      <UserGroupIcon className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">{bus.occupancy}</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Occupancy</p>
                    <div className="h-1 w-full bg-slate-800 rounded-full mt-2">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '84%' }} />
                    </div>
                  </div>

                  <div className="col-span-2 bg-slate-800/30 rounded-3xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-600 uppercase">Assigned Route</p>
                        <p className="text-sm font-bold text-white">{bus.route}</p>
                      </div>
                    </div>
                    <button className="p-2 bg-slate-800 hover:bg-yellow-500 hover:text-black rounded-xl transition-all">
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Maintenance Alert Badge */}
              {bus.health !== 'Optimal' && (
                <div className="absolute bottom-4 right-8 flex items-center gap-2 text-rose-500">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Service Required</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default TransportFleetClient;