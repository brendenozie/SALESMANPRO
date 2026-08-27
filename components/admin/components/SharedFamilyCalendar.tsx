'use client';

import React, { useMemo } from 'react';
import { ClockIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface SharedCalendarProps {
  childrenData: any[];
}

export default function SharedFamilyCalendar({ childrenData }: SharedCalendarProps) {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  // Combine and sort all events for today from all children
  const dailyTimeline = useMemo(() => {
    const events: any[] = [];
    
    childrenData.forEach((child, index) => {
      // Mapping the child's specific timetable slots
      child.timetable?.forEach((slot: any) => {
        events.push({
          ...slot,
          childName: child.name,
          colorIndex: index, // Used for distinct color coding per child
        });
      });
    });

    // Sort by time string (e.g., "08:00 AM")
    return events.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
      const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
      return timeA - timeB;
    });
  }, [childrenData]);

  // Dynamic style maps for children
  const colorSchemes = [
    'bg-indigo-50 border-indigo-100 text-indigo-700 ring-indigo-500',
    'bg-emerald-50 border-emerald-100 text-emerald-700 ring-emerald-500',
    'bg-rose-50 border-rose-100 text-rose-700 ring-rose-500',
    'bg-amber-50 border-amber-100 text-amber-700 ring-amber-500',
  ];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 leading-tight">Family Flow</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentDay}</p>
          </div>
        </div>
      </div>

      {/* Timeline Body */}
      <div className="p-6 overflow-y-auto max-h-[600px] scrollbar-hide">
        {dailyTimeline.length > 0 ? (
          <div className="relative space-y-6 before:absolute before:inset-0 before:left-[7px] before:h-full before:w-0.5 before:bg-slate-100">
            {dailyTimeline.map((event, idx) => {
              const theme = colorSchemes[event.colorIndex % colorSchemes.length];
              
              return (
                <div key={idx} className="relative pl-8 group animate-in fade-in slide-in-from-left-4 duration-300">
                  {/* Timeline Node */}
                  <div className={`absolute left-0 top-2 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-1 ${theme.split(' ')[3]}`} />
                  
                  <div className={`p-4 rounded-2xl border ${theme.split(' ').slice(0, 3).join(' ')} transition-all hover:shadow-md hover:scale-[1.01]`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black tracking-tighter uppercase opacity-80 flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {event.time}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/60 border border-current uppercase">
                        {event.childName.split(' ')[0]}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-sm leading-tight mb-2">{event.event}</h4>
                    
                    <div className="flex items-center gap-1.5 opacity-70">
                      <MapPinIcon className="h-3 w-3" />
                      <span className="text-[10px] font-bold tracking-wide uppercase">{event.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <ClockIcon className="h-10 w-10 text-slate-200 mx-auto" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Classes Scheduled</p>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex flex-wrap gap-3">
        {childrenData.map((child, i) => (
          <div key={child.id} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colorSchemes[i % colorSchemes.length].split(' ')[3].replace('ring-', 'bg-')}`} />
            <span className="text-[9px] font-bold text-slate-500 uppercase">{child.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}