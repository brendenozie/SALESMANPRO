'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  BookOpenIcon,
  MapPinIcon,
  UsersIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  LinkIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PrinterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

import type { ClassScheduleItem, EventScheduleItem, TeacherInfo } from './page';

export default function TeachersSchedulePageClient({
  educator,
  initialSchedule,
  initialEvents,
}: { educator: TeacherInfo; initialSchedule: ClassScheduleItem[]; initialEvents: EventScheduleItem[]; companyId: string }) {
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Helper to get a week's worth of dates for the "Week Strip"
  const weekStrip = useMemo(() => {
    const start = new Date(selectedDate);
    const dayOfWeek = start.getDay();
    const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(start.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const currentDayScheduleAndEvents = useMemo(() => {
    const selectedDateObj = new Date(selectedDate);
    const selectedDayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const selectedDateISO = selectedDate;

    const dayItems: any[] = [];

    initialSchedule.forEach(item => {
      if (item.day === selectedDayName) {
        dayItems.push({ ...item, category: 'class', timeSort: item.startTime });
      }
    });

    initialEvents.forEach(item => {
      if (item.date === selectedDateISO) {
        dayItems.push({ ...item, category: item.type, timeSort: item.startTime });
      }
    });

    return dayItems.sort((a, b) => a.timeSort.localeCompare(b.timeSort));
  }, [selectedDate, initialSchedule, initialEvents]);

  const getEventStyles = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CLASS': return { icon: <BookOpenIcon />, color: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-700' };
      case 'MEETING': return { icon: <UsersIcon />, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' };
      case 'WORKSHOP': return { icon: <BriefcaseIcon />, color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700' };
      default: return { icon: <SparklesIcon />, color: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-700' };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">
                <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                Live Schedule
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {educator.name.split(' ')[0]}&apos;s <span className="text-slate-400">Planner</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <PrinterIcon className="h-5 w-5" />
            </button>
            <div className="h-12 w-[1px] bg-slate-200 mx-2 hidden md:block" />
            <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Current Role</p>
                <p className="text-sm font-bold text-slate-700">{educator.role}</p>
            </div>
          </div>
        </header>

        {/* Date Navigator Strip */}
        <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200 flex items-center justify-between print:hidden">
           <button 
             onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 7);
                setSelectedDate(d.toISOString().split('T')[0]);
             }}
             className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400"
            >
             <ChevronLeftIcon className="h-5 w-5" />
           </button>

           <div className="flex flex-1 justify-around px-2">
             {weekStrip.map((date) => {
               const iso = date.toISOString().split('T')[0];
               const isActive = iso === selectedDate;
               return (
                 <button
                   key={iso}
                   onClick={() => setSelectedDate(iso)}
                   className={`flex flex-col items-center p-3 min-w-[60px] rounded-2xl transition-all ${
                     isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-50 text-slate-500'
                   }`}
                 >
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                     {date.toLocaleDateString('en-US', { weekday: 'short' })}
                   </span>
                   <span className="text-lg font-bold">{date.getDate()}</span>
                 </button>
               );
             })}
           </div>

           <button 
             onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 7);
                setSelectedDate(d.toISOString().split('T')[0]);
             }}
             className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400"
            >
             <ChevronRightIcon className="h-5 w-5" />
           </button>
        </div>

        {/* Main Timeline Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Timeline Column */}
            <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-lg font-bold text-slate-800">
                        {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 border-none rounded-lg px-3 py-1 focus:ring-0 cursor-pointer"
                    />
                </div>

                <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                    <AnimatePresence mode="wait">
                        {currentDayScheduleAndEvents.length > 0 ? (
                            currentDayScheduleAndEvents.map((item, idx) => {
                                const style = getEventStyles(item.category);
                                return (
                                    <motion.div 
                                        key={`${item.id}-${idx}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative"
                                    >
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[26px] top-1.5 h-4 w-4 rounded-full border-4 border-white shadow-sm ${style.color}`} />
                                        
                                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-tighter">
                                                        <ClockIcon className="h-3.5 w-3.5" />
                                                        {item.startTime} — {item.endTime}
                                                    </div>
                                                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-3 mt-2">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.light} ${style.text}`}>
                                                            {React.cloneElement(style.icon as React.ReactElement, { className: 'h-3 w-3' })}
                                                            {item.category}
                                                        </span>
                                                        {item.location && (
                                                            <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                                                                <MapPinIcon className="h-3.5 w-3.5" />
                                                                {item.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {(item.meetingLink || item.onlineMeetingLink) && (
                                                    <a 
                                                        href={item.meetingLink || item.onlineMeetingLink}
                                                        target="_blank"
                                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                                                    >
                                                        <VideoCameraIcon className="h-4 w-4" />
                                                        Join Session
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center">
                                <div className="bg-white h-16 w-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <SparklesIcon className="h-8 w-8 text-slate-300" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">Clear Skies!</h4>
                                <p className="text-slate-500 text-sm max-w-[240px] mx-auto mt-1">No scheduled classes or events for this date. Use this time for deep work.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Sidebar Stats Column */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Daily Snapshot</h5>
                    <div className="space-y-4">
                        <StatRow 
                            label="Total Sessions" 
                            value={currentDayScheduleAndEvents.length} 
                            icon={<CalendarDaysIcon className="h-5 w-5 text-indigo-600" />} 
                        />
                        <StatRow 
                            label="Classes" 
                            value={currentDayScheduleAndEvents.filter(e => e.category === 'class').length} 
                            icon={<BookOpenIcon className="h-5 w-5 text-emerald-600" />} 
                        />
                        <StatRow 
                            label="Meetings" 
                            value={currentDayScheduleAndEvents.filter(e => e.category !== 'class').length} 
                            icon={<UsersIcon className="h-5 w-5 text-amber-600" />} 
                        />
                    </div>
                </div>

                <div className="bg-indigo-900 rounded-[2rem] p-6 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">Coming Up Next</p>
                        {currentDayScheduleAndEvents[0] ? (
                            <>
                                <h6 className="text-lg font-bold leading-tight mb-4">{currentDayScheduleAndEvents[0].title}</h6>
                                <div className="text-xs font-medium text-indigo-200 flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4" />
                                    Starts at {currentDayScheduleAndEvents[0].startTime}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm font-bold">Nothing else today</p>
                        )}
                    </div>
                    <SparklesIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 group-hover:rotate-12 transition-transform duration-500" />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl">
                    {icon}
                </div>
                <span className="text-sm font-bold text-slate-600">{label}</span>
            </div>
            <span className="text-xl font-black text-slate-900">{value}</span>
        </div>
    );
}