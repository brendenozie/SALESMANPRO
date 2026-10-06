"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  CalendarIcon, 
  ArrowRightIcon, 
  MapPinIcon,
  TicketIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'; // Consistency with Heroicons

const formatDate = (input: string | Date) => {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return { day: "24", month: "MAY" };
  return {
    day: date.toLocaleDateString('en-US', { day: '2-digit' }),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  };
};

export default function ProfessionalEvents({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  
  const events = storeFormData?.events?.length > 0 ? storeFormData.events : [
    { id: '1', title: "The Future of AI in Global Education", startDateTime: "2026-05-15T10:00:00Z", description: "A technical symposium exploring transformative impacts of generative models on modern learning systems.", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
    { id: '2', title: "Global Climate Strategic Summit", startDateTime: "2026-06-01T09:00:00Z", imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713" },
    { id: '3', title: "Blockchain & Governance Workshop", startDateTime: "2026-07-10T15:00:00Z", imageUrl: "https://images.unsplash.com/photo-1618044737194-09439600989f" },
  ];

  const featured = events[0];
  const list = events.slice(1, 3);

  return (
    <section className="py-32 bg-white border-b border-gray-100">
      <div className="container mx-auto px-6 lg:px-8">
        
        {/* Institutional Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <TicketIcon className="w-5 h-5" style={{ color: primaryColor }} />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Scheduled Symposiums</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tighter leading-none">
              Where insight <br /> 
              <span className="text-gray-300 font-light italic text-blue-600">meets action.</span>
            </h2>
          </div>
          <button className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 border-b border-gray-900 pb-2 transition-all hover:gap-6">
            Access Full Calendar <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-px bg-gray-100 border border-gray-100">
          
          {/* --- Left: The Featured Brief (8 Columns) --- */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="lg:col-span-8 bg-white relative group overflow-hidden h-[650px]"
          >
            <Image decoding="async" 
              src={featured.imageUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
              alt={featured.title}
              fill 
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
            />
            
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

            {/* Featured Floating Date Badge */}
            <div className="absolute top-0 left-0 bg-white p-8 flex flex-col items-center justify-center border-r border-b border-gray-100">
              <span className="text-3xl font-black text-gray-900 leading-none">{formatDate(featured.startDateTime).day}</span>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest">{formatDate(featured.startDateTime).month}</span>
            </div>

            <div className="absolute bottom-0 left-0 p-12 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] w-12 bg-white/40" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Institutional Keynote</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-[1.1] max-w-2xl tracking-tighter">
                {featured.title}
              </h3>

              <div className="flex flex-wrap items-center gap-10 text-gray-300 text-[11px] font-bold uppercase tracking-widest mb-10">
                <span className="flex items-center gap-3">
                  <ClockIcon className="w-4 h-4 text-white" /> 10:00 AM EST
                </span>
                <span className="flex items-center gap-3">
                  <GlobeAltIcon className="w-4 h-4 text-white" /> Global Hybrid 
                </span>
              </div>

              <button 
                className="px-12 py-5 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 shadow-2xl"
                style={{ backgroundColor: primaryColor }}
              >
                Register For Symposium
              </button>
            </div>
          </motion.div>

          {/* --- Right: The List (4 Columns) --- */}
          <div className="lg:col-span-4 flex flex-col gap-px">
            {list.map((event: any, i: number) => {
              const date = formatDate(event.startDateTime);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="group bg-white p-10 flex flex-col justify-between h-full hover:bg-gray-50 transition-colors"
                >
                  <div className="mb-12">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-gray-900">{date.day}</span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-widest">{date.month}</span>
                      </div>
                      <div className="px-3 py-1 border border-gray-200 text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Level {i + 1}
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Strict Capacity</span>
                    <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}

            {/* Subscription Monolith */}
            <div className="bg-gray-900 p-10 text-white flex-grow flex flex-col justify-center">
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3">Newsletter</p>
                <p className="text-lg font-bold leading-tight tracking-tight">Access the briefing.</p>
              </div>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Professional Email" 
                  className="w-full bg-white/5 border-b border-white/20 py-4 text-sm focus:outline-none focus:border-white transition-colors"
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 text-white">
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}