// app/[slug]/products/[productId]/EventDetailClient.tsx
"use client";

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
  EnvelopeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { IEvent, StoreForm } from "@/types/typings";
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

interface EventDetailClientProps {
  event: IEvent;
  related: IEvent[];
  storeData: StoreForm;
}

export default function EventDetailClient({ event, related, storeData }: EventDetailClientProps) {
  const primary = storeData.themeSettings?.primaryColor || '#6366f1';
  const secondary = storeData.themeSettings?.secondaryColor || '#4f46e5';
  
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Immersive Cinematic Hero Box Banner */}
      <section className="relative h-[50vh] lg:h-[65vh] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-900">
        <div className="absolute inset-0">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1600'}
            alt={event.title}
            className="w-full h-full object-cover brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16">
          <div className="flex flex-wrap gap-2 mb-4">
            <span 
              className="px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase text-white rounded-full shadow-sm"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              {event.eventType || "PASS ACCESS"}
            </span>
            {event.isRegistrationRequired && (
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10">
                REGISTRATION MANDATORY
              </span>
            )}
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-[0.95] mb-6 italic max-w-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-zinc-300 text-xs font-bold tracking-widest uppercase">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-5 h-5" style={{ color: primary }} />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPinIcon className="w-5 h-5" style={{ color: secondary }} />
              <span>{event.location || "Location Coordinates TBA"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Structural Narrative Layout */}
      <main className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Side Column: Copy Descriptions */}
        <div className="lg:col-span-8 space-y-12">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight italic border-b border-zinc-100 dark:border-zinc-900 pb-4">
              About the Experience
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
              {event.description || "Join us for an unforgettable experiential showcase curated to bring together visionaries, industry leaders, and creators from across the territory region."}
            </p>
          </div>

          {/* Core Program Executive Summary */}
          <div className="p-8 bg-zinc-50 dark:bg-zinc-900/40 rounded-[2rem] border border-zinc-100 dark:border-zinc-900 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5" style={{ color: primary }} /> 
              Key Briefing & Highlights
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              {event.summary || "This master arrangement is strategically constructed to deliver rich thematic updates, masterclasses, and networking opportunities. Admission permits full workspace floor access."}
            </p>
          </div>

          {/* Embed Preview Media Block */}
          {event.videoUrl && (
            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-zinc-950 border border-zinc-900 relative group shadow-lg flex items-center justify-center">
              <img src={event.imageUrl || 'https://images.unsplash.com/photo-1519681393784-d120267933ba'} alt="video thumb" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-102 transition-all duration-700" />
              <div className="w-16 h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl z-10 group-hover:scale-110 transition-transform cursor-pointer">
                <VideoCameraIcon className="w-6 h-6" />
              </div>
            </div>
          )}

          {/* Coordination Officer Contact Panel */}
          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full text-white text-sm font-black flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                {event.contactPerson?.charAt(0) || "E"}
              </div>
              <div>
                <h4 className="text-base font-bold dark:text-zinc-100 flex items-center gap-1.5">
                  {event.contactPerson || "Event Control Support"}
                  <CheckBadgeIcon className="w-4 h-4" style={{ color: primary }} />
                </h4>
                <p className="text-xs text-zinc-400 font-medium">Official verified coordination manager</p>
              </div>
            </div>
            {event.contactEmail && (
              <a href={`mailto:${event.contactEmail}`} className="px-5 py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 text-xs font-bold tracking-wider uppercase border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center gap-2 transition-all">
                <EnvelopeIcon className="w-4 h-4" /> Message Desk
              </a>
            )}
          </div>
        </div>

        {/* Right Side Column: Box Office Ticket Desk Counter */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
          <div className="p-8 bg-zinc-50 dark:bg-zinc-900/60 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/80 shadow-xs space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase block mb-1">Pass Access Plan</span>
                <h3 className="text-3xl font-black tracking-tight dark:text-white">
                  {event.isPaid ? `KSh ${event.price?.toLocaleString()}` : "Free Admission"}
                </h3>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60 rounded-2xl">
                <TicketIcon className="w-6 h-6 text-zinc-400" />
              </div>
            </div>

            {/* Operational Meta Attributes Details Mapping */}
            <div className="space-y-3 text-xs tracking-wide font-bold text-zinc-500">
              <div className="flex justify-between items-center p-3.5 bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <span className="flex items-center gap-2 text-zinc-400"><ClockIcon className="w-4 h-4" /> Doors Open</span>
                <span className="text-zinc-900 dark:text-zinc-200 font-black">{startTime || "08:00 AM"}</span>
              </div>
              {event.maxCapacity && (
                <div className="flex justify-between items-center p-3.5 bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <span className="flex items-center gap-2 text-zinc-400"><UserGroupIcon className="w-4 h-4" /> Crowd Size Limit</span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-black">{event.maxCapacity} Seats Max</span>
                </div>
              )}
            </div>

            {/* Core Registry CTA Button */}
            <motion.button
              whileHover={!isExpired ? { y: -1 } : {}}
              whileTap={!isExpired ? { scale: 0.99 } : {}}
              disabled={isExpired}
              className="w-full h-14 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed"
              style={!isExpired ? { background: `linear-gradient(135deg, ${primary}, ${secondary})` } : {}}
            >
              {isExpired ? "Event Terminated" : "Claim Admission Spot"}
            </motion.button>

            {/* Virtual Meeting Join Actions Link Grid */}
            {event.onlineMeetingLink && !isExpired && (
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
                <a 
                  href={event.onlineMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase hover:opacity-80 border-b-2 pb-1 transition-all"
                  style={{ borderColor: primary, color: primary }}
                >
                  Launch Live Broadcast Room <ArrowRightIcon className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Secondary Dynamic Collections Recommendations Carousel */}
      {related.length > 0 && (
        <section className="mt-24 pt-16 border-t border-zinc-100 dark:border-zinc-900">
          <div className="mb-8">
            <span className="text-xs font-black tracking-[0.3em] text-zinc-400 uppercase block mb-1">Calendar</span>
            <h3 className="text-2xl sm:text-3xl font-black italic tracking-tight">Other Events You Might Like</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((evt) => (
              <div key={evt.id} className="group relative rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-md transition-all">
                <div className="aspect-[16/10] w-full relative overflow-hidden bg-zinc-200">
                  <img src={evt.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600'} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">{evt.eventType || "EXPO"}</span>
                  <h4 className="font-bold text-base line-clamp-1 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">{evt.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 font-light">{evt.summary || "No brief snapshot attached."}</p>
                </div>
                <a href={`/slug-placeholder/products/${evt.id}`} className="absolute inset-0 z-10" onClick={(e) => {
                  e.preventDefault();
                  window.location.href = window.location.href.replace(event.id, evt.id);
                }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Floating WhatsApp Quick Direct Sync Inquiry Button */}
      {typeof window !== 'undefined' && (
        <WhatsAppInquiry 
          productName={event.title || "Event Registration"}
          productPrice={event.price || 0}
          productUrl={window.location.href}
          phoneNumber="254712345678"
        />
      )}
    </div>
  );
}