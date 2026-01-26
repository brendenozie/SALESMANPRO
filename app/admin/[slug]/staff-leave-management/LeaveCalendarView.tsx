"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

const LeaveCalendarView = ({ events, companyId }: { events: any[], companyId: string }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [conflicts, setConflicts] = useState<Record<string, string[]>>({});
  const [freezePeriods, setFreezePeriods] = useState<any[]>([]);
  
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      day >= new Date(event.start) && day <= new Date(event.end)
    );
  };

  useEffect(() => {
    fetch(`/api/admin/leave/conflicts?companyId=${companyId}`)
      .then(res => res.json())
      .then(data => setConflicts(data.conflicts));
  }, [currentMonth, companyId]);

  useEffect(() => {
    const fetchFreezes = async () => {
      const res = await fetch(`/api/admin/leave/freeze?companyId=${companyId}`);
      const json = await res.json();
      setFreezePeriods(json.data || []);
    };
    fetchFreezes();
  }, [companyId, currentMonth]);

  // Inside the days.map loop:
  // const dateKey = format(day, 'yyyy-MM-dd');
  // const dayConflicts = conflicts[dateKey] || [];

  // Inside LeaveCalendarView loop for each 'day':
  

  return (
    <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">

      
      {/* Calendar Navigation */}
      <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
        <h3 className="text-xl font-bold text-white italic">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/10">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayConflicts = conflicts[dateKey] || [];
          const isFrozen = freezePeriods.find(p => 
                            day >= new Date(p.startDate) && day <= new Date(p.endDate)
                          );
  
          // Logic to check if the current day falls within any Freeze Period
          const activeFreeze = freezePeriods.find(p => {
            const start = new Date(p.startDate);
            const end = new Date(p.endDate);
            // Set hours to zero for accurate day-only comparison
            return day >= start && day <= end;
          });

          return (
            <div key={idx} className={`min-h-[120px] p-2 border-r border-b border-slate-800/50 ${!isCurrentMonth ? 'opacity-20' : ''} ${isFrozen ? 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(6,182,212,0.05)_10px,rgba(6,182,212,0.05)_20px)]' : ''} ${activeFreeze ? 'bg-cyan-500/[0.03]' : ''}`}>
    
              {isFrozen && (
                <div className="flex items-center gap-1 text-[8px] font-black text-cyan-500/60 uppercase mb-1">
                  <LockClosedIcon className="h-2 w-2" /> {isFrozen.label}
                </div>
              )}

              <div className="flex justify-between items-start relative z-10">
                <span className="text-[10px] text-slate-600 font-mono">
                  {format(day, "d")}
                </span>
                
                {activeFreeze && (
                  <div className="flex items-center gap-1 text-[8px] font-black text-cyan-500 uppercase">
                    <LockClosedIcon className="h-2 w-2" /> 
                    {activeFreeze.label}
                  </div>
                )}
              </div>
              
              {dayConflicts.length > 0 && (
                <div className="absolute top-2 right-2 group">
                  <ExclamationTriangleIcon className="h-4 w-4 text-rose-500 animate-pulse" />
                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute z-50 bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 border border-rose-500/50 rounded-xl shadow-2xl">
                    <p className="text-[9px] font-black text-rose-500 uppercase mb-1">Continuity Alert</p>
                    <p className="text-[10px] text-slate-300">
                      Over 15% of <span className="text-white font-bold">{dayConflicts.join(", ")}</span> is absent today.
                    </p>
                  </div>
                </div>
              )}

              <span className={`text-[10px] font-mono ${isSameDay(day, new Date()) ? 'text-violet-400 font-bold' : 'text-slate-600'}`}>
                {format(day, "d")}
              </span>
              
              <div className="mt-2 space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id} 
                    className={`px-2 py-1 rounded-md text-[9px] font-bold truncate ${
                      event.status === 'PENDING' 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[8px] text-slate-500 text-center font-bold">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveCalendarView;