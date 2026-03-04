"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  CalendarIcon, 
  ClockIcon, 
  ArrowRightIcon, 
  MapPinIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const formatDate = (input: string | Date) => {
  const date = new Date(input);
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function LatestEventsSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37';

  const events = storeFormData?.events?.length > 0 ? storeFormData.events : [
    {
      id: '1',
      title: "Future of AI in Education Summit",
      startDateTime: "2026-11-15T10:00:00Z",
      eventTime: "10:00 AM EST",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670",
      description: "A comprehensive summit exploring the transformative impact of artificial intelligence."
    },
    {
      id: '2',
      title: "Global Climate Conference",
      startDateTime: "2026-12-01T09:00:00Z",
      eventTime: "09:00 AM GMT",
      imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670"
    },
    {
      id: '3',
      title: "Blockchain Workshop",
      startDateTime: "2027-01-10T15:00:00Z",
      eventTime: "03:00 PM EST",
      imageUrl: "https://images.unsplash.com/photo-1618044737194-09439600989f?q=80&w=2670"
    }
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- Section Header --- */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white"
              style={{ backgroundColor: primaryColor }}
            >
              The Bulletin
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
              Mark Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600">Calendar</span>.
            </h2>
          </div>
          <button className="flex items-center gap-3 text-sm font-bold group text-slate-900 dark:text-white">
            EXPLORE ALL EVENTS 
            <div className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
               <ArrowRightIcon className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* --- Grid Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Main Hero Event (Span 2) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 relative h-[500px] rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-slate-200 dark:shadow-none"
          >
            <Image 
              src={events[0].imageUrl} 
              alt={events[0].title} 
              fill 
              loader={loader}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            
            <div className="absolute bottom-0 p-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-4 text-white/80 mb-4">
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                    <CalendarIcon className="w-4 h-4" style={{ color: accentColor }} /> {formatDate(events[0].startDateTime)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                    <MapPinIcon className="w-4 h-4" style={{ color: accentColor }} /> Auditorium A
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {events[0].title}
                </h3>
              </div>
              <button 
                className="shrink-0 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-xl"
              >
                Secure Spot
              </button>
            </div>
          </motion.div>

          {/* Secondary Events Stack */}
          <div className="grid grid-cols-1 gap-6">
            {events.slice(1, 3).map((event: any, idx: number) => (
              <motion.div
                key={event.id}
                whileHover={{ x: 5 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                   <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${primaryColor}10` }}
                   >
                     <TicketIcon className="w-6 h-6" style={{ color: primaryColor }} />
                   </div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                     {formatDate(event.startDateTime)}
                   </div>
                   <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                     {event.title}
                   </h4>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <ClockIcon className="w-4 h-4" /> {event.eventTime}
                  </span>
                  <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white dark:group-hover:text-slate-900 group-hover:text-white transition-all">
                    <ArrowRightIcon className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* --- Bottom Utility Row --- */}
        <div className="mt-12 flex flex-wrap items-center gap-8 justify-center py-8 border-t border-slate-200 dark:border-slate-800">
           <div className="flex -space-x-3">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-950 bg-slate-200 overflow-hidden">
                 <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
               </div>
             ))}
           </div>
           <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
             <span className="text-slate-900 dark:text-white font-bold">500+ attendees</span> registered for upcoming sessions this month.
           </p>
        </div>
      </div>
    </section>
  );
}