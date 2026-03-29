/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  MapPinIcon, 
  TicketIcon, 
  UserGroupIcon, 
  ShareIcon,
  BellIcon,
  ClockIcon,
  InformationCircleIcon,
  VideoCameraIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { IEvent } from "@/types/typings";

export default function EventDetailView({ event }: { event: IEvent }) {
  const isExpired = event.endDateTime ? new Date(event.endDateTime) < new Date() : false;
  
  const formattedDate = useMemo(() => {
    if (!event.startDateTime) return "Date TBA";
    return new Date(event.startDateTime).toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [event.startDateTime]);

  const startTime = useMemo(() => {
    if (!event.startDateTime) return "";
    return new Date(event.startDateTime).toLocaleTimeString("en-KE", {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [event.startDateTime]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] font-sans selection:bg-indigo-100">
      
      {/* --- HEADER / HERO SECTION --- */}
      <section className="relative h-[60vh] lg:h-[75vh] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1600'}
            alt={event.title}
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050505] via-transparent to-transparent" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end px-6 lg:px-20 pb-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                {event.eventType}
              </span>
              {event.isRegistrationRequired && (
                <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/20">
                  Registration Required
                </span>
              )}
            </div>
            
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.9] mb-8 italic">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-indigo-500" />
                <span className="text-sm font-bold uppercase tracking-widest">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPinIcon className="w-6 h-6 text-purple-500" />
                <span className="text-sm font-bold uppercase tracking-widest">{event.location || "Location TBA"}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CONTENT GRID --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-20 grid lg:grid-cols-12 gap-16">
        
        {/* LEFT COLUMN: THE STORY */}
        <div className="lg:col-span-8">
          <section className="prose prose-zinc dark:prose-invert max-w-none">
            <h2 className="text-3xl font-black tracking-tight mb-8">About the Event</h2>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-light mb-12">
              {event.description || "Join us for an unforgettable experience that brings together visionaries, creators, and enthusiasts from across the region."}
            </p>
            
            <div className="my-12 p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5 text-indigo-500" /> Executive Summary
              </h3>
              <p className="text-base text-zinc-600 dark:text-zinc-300">
                {event.summary || "This event is designed to foster community engagement and showcase the latest innovations in our field. Attendance includes access to all sessions, networking lounges, and digital resources."}
              </p>
            </div>

            {event.videoUrl && (
              <div className="my-16 aspect-video rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-900 flex items-center justify-center group cursor-pointer relative">
                <img src={event.imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
                <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <VideoCameraIcon className="w-8 h-8 text-black" />
                </div>
              </div>
            )}
          </section>

          {/* Organizer Info */}
          <section className="mt-20 pt-12 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8">Event Coordination</h3>
            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {event.contactPerson?.charAt(0) || "O"}
              </div>
              <div>
                <p className="text-lg font-bold dark:text-white flex items-center gap-2">
                  {event.contactPerson || "Event Organizer"}
                  <CheckBadgeIcon className="w-5 h-5 text-indigo-500" />
                </p>
                <div className="flex flex-wrap gap-4 mt-1">
                  <a href={`mailto:${event.contactEmail}`} className="text-xs text-zinc-500 hover:text-indigo-600 flex items-center gap-1">
                    <EnvelopeIcon className="w-3.5 h-3.5" /> {event.contactEmail || "Contact Support"}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: THE TICKET OFFICE */}
        <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Pass Access</p>
                <h4 className="text-3xl font-black dark:text-white">
                  {event.isPaid ? `KSh ${event.price?.toLocaleString()}` : "Free Entry"}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                <TicketIcon className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs font-bold dark:text-white">Starts at</span>
                </div>
                <span className="text-xs font-black text-indigo-600">{startTime}</span>
              </div>
              
              {event.maxCapacity && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-bold dark:text-white">Availability</span>
                  </div>
                  <span className="text-xs font-black text-zinc-500">{event.maxCapacity} Max</span>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isExpired}
              className={`w-full h-16 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl mb-4 flex items-center justify-center gap-3 transition-all ${
                isExpired 
                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isExpired ? "Event Passed" : "Secure My Spot"}
            </motion.button>

            <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 flex items-center justify-center gap-2 transition-colors">
              <ShareIcon className="w-4 h-4" /> Share Event
            </button>

            {/* Online Link CTA */}
            {event.onlineMeetingLink && (
              <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Virtual Access</p>
                <a 
                  href={event.onlineMeetingLink} 
                  target="_blank"
                  className="inline-flex items-center gap-2 text-indigo-600 text-sm font-bold border-b border-indigo-200"
                >
                  Join Meeting Room <VideoCameraIcon className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Reminder Card */}
          <div className="mt-6 p-6 rounded-[2rem] bg-zinc-900 dark:bg-indigo-900/20 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BellIcon className="w-6 h-6 text-indigo-400" />
              <p className="text-xs font-bold leading-tight">Remind me before <br/> the event starts</p>
            </div>
            <button className="px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest">Enable</button>
          </div>
        </aside>
      </main>

      {/* --- LOCATION MAP / VENUE DETAIL --- */}
      {event.location && (
        <section className="bg-zinc-50 dark:bg-[#080808] py-32 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6">The Venue</h2>
              <h3 className="text-5xl font-black tracking-tighter dark:text-white mb-8 italic">Getting <br/> There</h3>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-light mb-8">
                The event will be hosted at <span className="text-zinc-900 dark:text-white font-bold">{event.location}</span>. 
                Please arrive at least 30 minutes before the start time for registration.
              </p>
              <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-indigo-600">
                <MapPinIcon className="w-5 h-5" /> Open in Google Maps
              </button>
            </div>
            <div className="flex-1 w-full h-96 rounded-[3rem] bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
               {/* Map Placeholder */}
               <div className="absolute inset-0 flex items-center justify-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Map Interface Integrated</p>
               </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}