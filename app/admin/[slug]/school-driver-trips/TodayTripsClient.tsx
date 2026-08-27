'use client';

import React, { useState } from 'react';
import { 
  ClockIcon, 
  MapPinIcon, 
  ChevronRightIcon, 
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon,
  CalendarDaysIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function TodayTripsClient({ adminSlug, initialTrips }: any) {
  const [trips, setTrips] = useState(initialTrips || [
    { id: 'T1', routeName: 'Route A - Northside', time: '07:00 AM', type: 'Pickup', status: 'completed', students: 24, vehicle: 'Bus 402' },
    { id: 'T2', routeName: 'Kindergarten Express', time: '12:30 PM', type: 'Dropoff', status: 'active', students: 12, vehicle: 'Bus 402' },
    { id: 'T3', routeName: 'Route A - Afternoon', time: '03:45 PM', type: 'Dropoff', status: 'pending', students: 28, vehicle: 'Bus 402' },
  ]);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white p-6 pb-24">
      
      {/* HEADER: DATE & OVERVIEW */}
      <header className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <CalendarDaysIcon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Today's Schedule</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Daily Manifest</h1>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black italic leading-none text-white/20">FEB 26</p>
          <p className="text-[10px] font-black uppercase text-slate-500">Thursday</p>
        </div>
      </header>

      {/* TRIP TIMELINE */}
      <div className="space-y-6 relative">
        {/* Vertical Timeline Thread */}
        <div className="absolute left-6 top-4 bottom-4 w-px bg-white/10" />

        {trips.map((trip: any, index: number) => (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            key={trip.id} 
            className="relative pl-14 group"
          >
            {/* Status Indicator Dot */}
            <div className={`absolute left-[21px] top-6 w-[7px] h-[7px] rounded-full ring-8 ${
              trip.status === 'completed' ? 'bg-emerald-500 ring-emerald-500/10' :
              trip.status === 'active' ? 'bg-blue-500 ring-blue-500/20 animate-pulse' :
              'bg-slate-700 ring-white/5'
            }`} />

            <div className={`p-6 rounded-[2.5rem] border transition-all duration-300 ${
              trip.status === 'active' 
              ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.1)]' 
              : 'bg-white/5 border-white/5 opacity-80 group-hover:opacity-100 group-hover:border-white/20'
            }`}>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <ClockIcon className={`h-6 w-6 ${trip.status === 'active' ? 'text-blue-500' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-black italic tracking-tight leading-none">{trip.time}</p>
                    <p className="text-[10px] font-black uppercase text-slate-500 mt-1 tracking-widest">{trip.type}</p>
                  </div>
                </div>
                
                <StatusBadge status={trip.status} />
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{trip.routeName}</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                    <TruckIcon className="h-3.5 w-3.5" /> {trip.vehicle}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                    <CheckCircleIcon className="h-3.5 w-3.5" /> {trip.students} Students
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              {trip.status === 'active' ? (
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black italic flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/40">
                  <PlayIcon className="h-5 w-5 fill-current" /> RESUME TRIP
                </button>
              ) : trip.status === 'pending' ? (
                <button className="w-full bg-white/5 hover:bg-white text-slate-400 hover:text-black py-4 rounded-2xl font-black italic flex items-center justify-center gap-2 transition-all border border-white/10">
                  START TRIP <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <CheckCircleIcon className="h-4 w-4" /> Trip Logged & Filed
                </div>
              )}

            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    active: "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-900/40",
    pending: "bg-white/5 text-slate-500 border-white/10"
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}