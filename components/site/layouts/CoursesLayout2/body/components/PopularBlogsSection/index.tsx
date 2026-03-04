'use client';

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

const formatDate = (input: string | Date) => {
  const date = typeof input === 'string' ? new Date(input) : input;
  return isNaN(date.getTime()) ? "Upcoming" : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function MoriahEvents({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  
  const events = storeFormData?.events?.length > 0 ? storeFormData.events : [
    { id: '1', title: "Future of AI in Education", startDateTime: "2026-05-15T10:00:00Z", description: "Exploring the transformative impact of AI on modern learning systems.", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
    { id: '2', title: "Global Climate Summit", startDateTime: "2026-06-01T09:00:00Z", imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713" },
    { id: '3', title: "Blockchain Workshop", startDateTime: "2026-07-10T15:00:00Z", imageUrl: "https://images.unsplash.com/photo-1618044737194-09439600989f" },
  ];

  const featured = events[0];
  const list = events.slice(1, 4);

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full mb-6"
            >
              <TicketIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Experiences</span>
            </motion.div>
            <h2 className="text-5xl font-light text-slate-900 tracking-tight leading-none">
              Where knowledge <br /> 
              <span className="font-semibold italic">meets community.</span>
            </h2>
          </div>
          <motion.button 
            whileHover={{ x: 5 }}
            className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-3"
          >
            View Full Calendar <ArrowRightIcon className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- Featured Event: The "Hero Ticket" --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="lg:col-span-8 relative group rounded-[3rem] overflow-hidden bg-slate-900 h-[600px] shadow-2xl"
          >
            <Image 
              src={featured.imageUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
              alt={featured.title} 
              loader={({src})=>src}
              fill 
              className="object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700 group-hover:scale-105 duration-1000"
            />
            
            {/* Dark Gradient Overlay for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

            <div className="absolute bottom-0 left-0 p-12 w-full">
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                  Featured Event
                </span>
                <span className="px-4 py-2 bg-blue-600 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                  Registration Open
                </span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-2xl">
                {featured.title}
              </h3>

              <div className="flex flex-wrap items-center gap-8 text-slate-300 text-sm font-medium mb-10">
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-400" />
                  {formatDate(featured.startDateTime)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-400" />
                  Main Auditorium / Virtual
                </span>
              </div>

              <button className="px-10 py-4 bg-white text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                Secure Your Spot
              </button>
            </div>
          </motion.div>

          {/* --- Side Events: The "Minimalist Schedule" --- */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {list.map((event: any, i: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-slate-50 hover:bg-white rounded-[2rem] p-8 border border-transparent hover:border-slate-100 hover:shadow-xl transition-all flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <ClockIcon className="w-6 h-6 text-slate-400 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {formatDate(event.startDateTime)}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h4>
                </div>
                
                <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Limited Capacity</span>
                  <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-blue-600">
                    <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* "Stay in the loop" Minimalist Card */}
            <div className="bg-blue-600 rounded-[2rem] p-8 text-white">
              <p className="text-sm font-bold mb-2">Can't find a date?</p>
              <p className="text-xs opacity-80 leading-relaxed mb-6">Subscribe to get notified about new workshops as they are announced.</p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Join Newsletter
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}