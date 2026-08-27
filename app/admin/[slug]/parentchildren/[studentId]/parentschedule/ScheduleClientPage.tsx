'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ScheduleClientPage({ initialSchedule }: any) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const currentTimeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const isCurrentClass = (start: string, end: string) => {
    return currentTimeStr >= start && currentTimeStr <= end;
  };

  return (
    <div className="relative max-w-3xl mx-auto py-10">
      {/* Central Timeline Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2 hidden md:block" />

      <div className="space-y-12">
        {initialSchedule.map((item: any, index: number) => {
          const isActive = isCurrentClass(item.startTime, item.endTime);
          const isPast = currentTimeStr > item.endTime;

          return (
            <div key={item.id} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Timeline Dot */}
              <div className={`absolute left-4 md:left-1/2 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 -translate-x-1/2 transition-colors duration-500 ${
                isActive ? 'bg-indigo-600 scale-125 ring-4 ring-indigo-100' : isPast ? 'bg-slate-300' : 'bg-white border-slate-300'
              }`} />

              {/* Content Card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className={`ml-12 md:ml-0 w-full md:w-[45%] p-5 rounded-3xl border transition-all duration-300 ${
                  isActive 
                  ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100 ring-1 ring-indigo-50' 
                  : 'bg-white/50 border-slate-100 opacity-80'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    item.type === 'academic' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {item.subject}
                  </span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> LIVE NOW
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-bold text-slate-800">{item.subject}</h4>
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" /> {item.startTime} - {item.endTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" /> {item.room}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200" />
                  <span className="text-xs text-slate-400">Teacher: <b className="text-slate-600">{item.teacher}</b></span>
                </div>
              </motion.div>

              {/* Spacer for the other side on desktop */}
              <div className="hidden md:block w-[45%]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);