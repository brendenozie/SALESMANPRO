"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  MapIcon, 
  ClockIcon, 
  UserGroupIcon, 
  ChevronDownIcon,
  MapPinIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";

const TransportRoutesClient = () => {
  const [expandedRoute, setExpandedRoute] = useState<string | null>('R-NORTH');

  const routes = [
    {
      id: 'R-NORTH',
      name: 'North Circuit Express',
      busId: 'BUS-101',
      totalStudents: 42,
      stops: [
        { time: '07:00 AM', location: 'Central Station Hub', type: 'Start', students: 0 },
        { time: '07:20 AM', location: 'Oakwood Residential', type: 'Pickup', students: 12 },
        { time: '07:45 AM', location: 'Riverside Apartments', type: 'Pickup', students: 18 },
        { time: '08:15 AM', location: 'Main School Gate', type: 'Dropoff', students: 30 }
      ]
    },
    {
      id: 'R-DOWNTOWN',
      name: 'Downtown Shuttle',
      busId: 'BUS-202',
      totalStudents: 28,
      stops: [
        { time: '07:15 AM', location: 'Metro Plaza', type: 'Start', students: 0 },
        { time: '07:40 AM', location: 'City Library Loop', type: 'Pickup', students: 28 },
        { time: '08:20 AM', location: 'Main School Gate', type: 'Dropoff', students: 28 }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Route Path Background Glow */}
      <div className="fixed top-0 left-1/4 w-px h-full bg-gradient-to-b from-blue-500/0 via-blue-500/10 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Navigation & Scheduling</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Route <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Architecture.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all">
              <ArrowsUpDownIcon className="h-4 w-4" />
              Optimize Routes
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-600/20">
              <MapIcon className="h-4 w-4" />
              Assign Students
            </button>
          </div>
        </header>

        {/* Route List */}
        <div className="grid grid-cols-1 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden transition-all">
              
              {/* Route Summary Header */}
              <div 
                className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:bg-slate-800/20 transition-colors"
                onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
              >
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
                    <FlagIcon className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{route.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-mono text-slate-500">{route.id}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                        <UserGroupIcon className="h-3.5 w-3.5" />
                        {route.totalStudents} Students
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Fleet</p>
                    <p className="text-sm font-black text-slate-200">{route.busId}</p>
                  </div>
                  <ChevronDownIcon className={`h-6 w-6 text-slate-600 transition-transform duration-300 ${expandedRoute === route.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded Timeline View */}
              {expandedRoute === route.id && (
                <div className="px-8 pb-8 pt-0 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="border-t border-slate-800/50 pt-8 mt-2">
                    <div className="relative space-y-8">
                      {/* Vertical Connecting Line */}
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-slate-800" />

                      {route.stops.map((stop, index) => (
                        <div key={index} className="relative flex items-start gap-8 group">
                          {/* Timeline Dot */}
                          <div className={`mt-1.5 h-6 w-6 rounded-full border-4 border-[#05070A] z-10 ${
                            stop.type === 'Start' ? 'bg-blue-500' : stop.type === 'Dropoff' ? 'bg-indigo-500' : 'bg-slate-700 group-hover:bg-blue-400'
                          } transition-colors`} />

                          <div className="flex-grow flex flex-col md:flex-row justify-between gap-4 bg-slate-800/30 p-5 rounded-2xl border border-slate-700/30 hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-6">
                              <div className="text-center min-w-[70px]">
                                <ClockIcon className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                                <p className="text-xs font-black text-white">{stop.time}</p>
                              </div>
                              <div className="w-px h-8 bg-slate-700" />
                              <div>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{stop.type}</p>
                                <h4 className="font-bold text-slate-200">{stop.location}</h4>
                              </div>
                            </div>

                            {stop.students > 0 && (
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-slate-600 uppercase">Pickup</p>
                                  <p className="text-xs font-bold text-slate-400">{stop.students} students</p>
                                </div>
                                <button className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all">
                                  <UserGroupIcon className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default TransportRoutesClient;