'use client';

import React, { useState, useMemo } from 'react';
import { 
  MapIcon, 
  ArrowRightIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  FlagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import { Route } from './page';

export default function RoutesClient({ params }: { params: { companyId: string, routesData: Route[] } }) {
  const [routes] = useState<Route[]>(params.routesData);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredRoutes = useMemo(() => {
    if (activeFilter === 'All') return routes;
    return routes.filter(r => r.status === activeFilter.toLowerCase());
  }, [routes, activeFilter]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <Toaster />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Route Dispatch</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-indigo-500" />
            Managing {routes.length} active transit corridors
          </p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          {['All', 'Active', 'Delayed', 'Scheduled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeFilter === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRoutes.map((route) => (
          <div key={route.id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl transition-all group relative overflow-hidden">
            {/* Priority Ribbon */}
            <div className={`absolute top-0 right-10 px-4 py-1 rounded-b-xl text-[10px] font-black uppercase tracking-tighter text-white ${
              route.priority === 'Critical' ? 'bg-rose-600' : route.priority === 'High' ? 'bg-amber-500' : 'bg-indigo-600'
            }`}>
              {route.priority} Priority
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Route ID & Driver */}
              <div className="w-full lg:w-64">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{route.routeCode}</p>
                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 truncate">
                  {route.cargoType}
                </h3>
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">👤</div>
                  <span className="text-sm font-bold">{route.driverName}</span>
                </div>
              </div>

              {/* Transit Visualization */}
              <div className="flex-1">
                <div className="flex justify-between items-end mb-3">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 text-left">Origin</p>
                    <p className="text-sm font-black text-slate-800">{route.origin}</p>
                  </div>
                  <div className="text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                      route.status === 'delayed' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {route.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 text-right">Destination</p>
                    <p className="text-sm font-black text-slate-800">{route.destination}</p>
                  </div>
                </div>

                {/* The Progress Line */}
                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${route.status === 'delayed' ? 'bg-rose-500' : 'bg-indigo-600'}`}
                    style={{ width: `${route.progress}%` }}
                  >
                    <div className="absolute top-0 right-0 h-full w-8 bg-white/20 skew-x-12 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-2">
                    <p className="text-[10px] font-bold text-slate-400">{route.distance} KM Total</p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase italic">ETA: {route.eta}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 lg:border-l lg:pl-8 border-slate-100">
                <button className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                  <ClockIcon className="h-6 w-6" />
                  <span className="text-[8px] font-black uppercase mt-1">Logs</span>
                </button>
                <button className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200">
                  Manage Load
                </button>
              </div>
            </div>

            {/* Delay Alert Footer */}
            {route.status === 'delayed' && (
              <div className="mt-4 pt-4 border-t border-rose-100 flex items-center gap-2 text-rose-600">
                <ExclamationCircleIcon className="h-5 w-5" />
                <p className="text-xs font-bold">Traffic congestion reported at Highway 101. Estimated 25min setback.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}