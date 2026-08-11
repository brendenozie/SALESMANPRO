'use client';

import React, { useState } from 'react';
import { 
  ChevronDoubleRightIcon, 
  MapPinIcon, 
  PhoneIcon, 
  ExclamationTriangleIcon,
  XMarkIcon,
  ChevronUpIcon,
  UsersIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { PlayIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

export default function StartDrivingMode({ route, onExit }: { route: any, onExit: () => void }) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const currentStop = route.stops[currentStopIndex];
  const nextStop = route.stops[currentStopIndex + 1];

  
    // const { slug } = await params;
  
    // const session = await getAuthSession();
  
    // // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    // const identifier = slug || session?.user?.id || '';
  
    // // 2. Retrieve the memoized company data (no extra DB cost)
    // const company = await findCompanyCached(identifier, "page");
  
    // if (!company) {
    //   return <div>Company not found</div>;
    // }
  
    // // Use the actual database ID for your API calls, ensuring consistency
    // const companyId = company.id;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col font-sans overflow-hidden">
      
      {/* --- TACTICAL HEADER (Next Turn / ETA) --- */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-20 flex justify-between items-start">
        <div className="flex items-center gap-4 bg-blue-600 p-4 rounded-3xl shadow-2xl">
          <ChevronDoubleRightIcon className="h-10 w-10 text-white" />
          <div>
            <p className="text-[10px] font-black uppercase text-blue-200 leading-none mb-1">In 400 meters</p>
            <p className="text-2xl font-black italic text-white leading-none">Turn Right onto Oak St.</p>
          </div>
        </div>
        
        <button 
          onClick={onExit}
          className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 active:bg-rose-600 transition-colors"
        >
          <XMarkIcon className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* --- FULLSCREEN MAP BACKGROUND --- */}
      <div className="flex-1 relative bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/static/path-5+3b82f6(-74,40.7)/auto/1000x1000?access_token=TOKEN')] bg-cover opacity-80" />
        
        {/* Pulsing User Location Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-[0_0_30px_rgba(59,130,246,0.8)] animate-pulse" />
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-blue-500 absolute -top-4 left-0" />
        </div>
      </div>

      {/* --- FLOATING STATUS PILLS --- */}
      <div className="absolute bottom-48 left-6 right-6 flex justify-between items-end z-10">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] flex items-center gap-4">
            <div className="text-center border-r border-white/10 pr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase">ETA</p>
                <p className="text-xl font-black text-white">08:12</p>
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Distance</p>
                <p className="text-xl font-black text-white">1.2 km</p>
            </div>
        </div>
        
        <button className="bg-amber-500 p-5 rounded-full shadow-2xl animate-bounce">
            <SpeakerWaveIcon className="h-8 w-8 text-black" />
        </button>
      </div>

      {/* --- ACTIVE STOP DRAWER --- */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-[#12161F] border-t border-white/10 rounded-t-[3rem] p-8 z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <MapPinIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black italic uppercase leading-none">{currentStop.name}</h2>
                    <p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-widest">{currentStop.address}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="p-4 bg-white/5 rounded-2xl text-slate-400 border border-white/5">
                    <PhoneIcon className="h-6 w-6" />
                </button>
                <button className="p-4 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                </button>
            </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 mb-8 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3 text-slate-400">
                <UsersIcon className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">{currentStop.studentCount} Students Awaiting</span>
            </div>
            <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#12161F] overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="student" />
                    </div>
                ))}
            </div>
        </div>

        <button 
          onClick={() => setCurrentStopIndex(prev => prev + 1)}
          className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all"
        >
          <CheckBadgeIcon className="h-8 w-8" /> ARRIVED AT STOP
        </button>

        {nextStop && (
           <p className="text-center mt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
             Next: <span className="text-slate-300">{nextStop.name}</span>
           </p>
        )}
      </motion.div>
    </div>
  );
}