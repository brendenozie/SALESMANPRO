'use client';

import React, { useState } from 'react';
import { 
  MapIcon, 
  FlagIcon, 
  UsersIcon, 
  ClockIcon, 
  ChevronRightIcon, 
  MapPinIcon,
  PlayIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinSolid } from '@heroicons/react/24/solid';

export type Stop = {
  id: string;
  name: string;
  address: string;
  studentCount: number;
  expectedTime: string;
};

export type RouteProfile = {
  id: string;
  routeName: string;
  type: 'Morning' | 'Afternoon';
  totalDistance: string;
  estimatedTime: string;
  stops: Stop[];
};

export default function RoutesClient({ adminSlug, initialRoutes }: { adminSlug: string, initialRoutes: RouteProfile[] }) {
  const [activeRoute, setActiveRoute] = useState<RouteProfile | null>(initialRoutes[0] || null);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white p-4 pb-24 md:p-8">
      
      {/* HEADER SECTION */}
      <header className="mb-8">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Route Command</h1>
        <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase mt-1">
          {initialRoutes.length} Assigned Circuits
        </p>
      </header>

      {/* ROUTE SELECTOR TABS */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {initialRoutes.map((route) => (
          <button
            key={route.id}
            onClick={() => setActiveRoute(route)}
            className={`flex-shrink-0 px-6 py-4 rounded-2xl border transition-all ${
              activeRoute?.id === route.id 
              ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20' 
              : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <span className="text-xs font-black uppercase italic block">{route.type}</span>
            <span className="text-lg font-bold">{route.routeName}</span>
          </button>
        ))}
      </div>

      {activeRoute ? (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT: ROUTE OVERVIEW & MAP PREVIEW */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-64 md:h-96 rounded-[3rem] bg-slate-800 overflow-hidden border border-white/10">
              {/* Mock Map Placeholder */}
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/pin-s-a+3b82f6(-74.00,40.71),pin-s-b+3b82f6(-74.05,40.75)/auto/600x400?access_token=TOKEN')] bg-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black italic">{activeRoute.routeName}</h2>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1 text-slate-300 text-xs font-bold uppercase">
                      <ClockIcon className="h-4 w-4 text-blue-500" /> {activeRoute.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 text-xs font-bold uppercase">
                      <MapIcon className="h-4 w-4 text-blue-500" /> {activeRoute.totalDistance}
                    </div>
                  </div>
                </div>
                <button className="bg-white text-black p-5 rounded-full shadow-2xl active:scale-90 transition-transform">
                  <PlayIcon className="h-8 w-8 fill-black" />
                </button>
              </div>
            </div>

            {/* ROUTE STATS */}
            <div className="grid grid-cols-3 gap-4">
               <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Stops</p>
                  <p className="text-2xl font-black italic">{activeRoute.stops.length}</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Capacity</p>
                  <p className="text-2xl font-black italic">85%</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Fuel Estimate</p>
                  <p className="text-2xl font-black italic">14L</p>
               </div>
            </div>
          </div>

          {/* RIGHT: SEQUENTIAL MANIFEST */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 px-2">Route Sequence</h3>
            <div className="relative">
              {/* Vertical Progress Line */}
              <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-transparent" />

              <div className="space-y-6 relative">
                {activeRoute.stops.map((stop, index) => (
                  <div key={stop.id} className="flex gap-6 group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl z-10 transition-colors ${index === 0 ? 'bg-blue-600' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                      {index === 0 ? <FlagIcon className="h-6 w-6" /> : index + 1}
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-[2rem] hover:border-blue-500/50 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-lg">{stop.name}</h4>
                        <span className="text-blue-500 font-black text-xs">{stop.expectedTime}</span>
                      </div>
                      <p className="text-slate-500 text-xs mb-3">{stop.address}</p>
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-[10px] font-black uppercase text-slate-400">{stop.studentCount} Students</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
          <MapIcon className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">No active routes found in your manifest.</p>
        </div>
      )}
    </div>
  );
}