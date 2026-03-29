"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  MapIcon, 
  SunIcon, 
  UserGroupIcon, 
  SparklesIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CameraIcon,
  HeartIcon,
  ShareIcon,
  CloudIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const loader = ({ src }: { src: string }) => src;

export default function TravelDestinationView({ destination, storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0ea5e9';
  const [activeTab, setActiveTab] = useState('Itinerary');

  // Mock Travel Data
  const tripSpecs = [
    { label: 'Duration', value: '8 Days', icon: <CalendarDaysIcon className="w-5 h-5" /> },
    { label: 'Group Size', value: 'Max 12', icon: <UserGroupIcon className="w-5 h-5" /> },
    { label: 'Difficulty', value: 'Moderate', icon: <MapIcon className="w-5 h-5" /> },
    { label: 'Best Time', value: 'June - Oct', icon: <SunIcon className="w-5 h-5" /> },
  ];

  const itinerary = [
    { day: '01', title: 'Arrival & Sunset Safari', desc: 'Touch down and head straight into the wild for a golden hour drive.' },
    { day: '02', title: 'The Great Migration', desc: 'Witness the breathtaking movement of wildlife across the plains.' },
    { day: '03', title: 'Cultural Immersion', desc: 'A private visit to a local community to learn ancient traditions.' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#050505] selection:bg-emerald-100">
      
      {/* --- IMMERSIVE PANORAMIC HERO --- */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          <Image
            src={destination?.imageUrl || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1600'}
            alt="Destination Backdrop"
            fill
            className="object-cover brightness-90"
            loader={loader}
            priority
          />
        </motion.div>
        
        {/* Gradients for UI readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#FDFDFD] dark:to-[#050505]" />
        
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 lg:px-20 pb-20 max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6 text-white/90">
              <MapPinIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-black uppercase tracking-[0.3em]">Maasai Mara, Kenya</span>
            </div>
            
            <h1 className="text-6xl lg:text-[100px] font-serif font-bold text-white leading-none mb-10 drop-shadow-2xl">
              {destination?.name || "The Great Wildebeest Migration"}
            </h1>

            <div className="flex flex-wrap items-center gap-6">
              <button className="h-16 px-10 rounded-full bg-white text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-emerald-50 transition-all">
                Check Availability
              </button>
              <button className="w-16 h-16 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <CameraIcon className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- TRIP PULSE BAR --- */}
      <section className="relative z-10 -mt-12 px-6 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-zinc-800">
          {tripSpecs.map((s, i) => (
            <div key={i} className="flex items-center gap-5 p-6 rounded-3xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
              <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl">{s.icon}</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{s.label}</p>
                <p className="text-sm font-bold dark:text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- EXPLORATION GRID --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-32 grid lg:grid-cols-12 gap-20">
        
        {/* Left: The Experience */}
        <div className="lg:col-span-8">
          <section className="mb-20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-6">The Essence</h2>
            <p className="text-3xl lg:text-4xl font-serif font-bold dark:text-white leading-tight mb-8">
              "Witness nature's most spectacular theatre under the endless African sky."
            </p>
            <p className="text-xl text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
              {destination?.description || "This isn't just a safari; it's a soul-stirring encounter with the raw rhythm of the earth. From the thunderous hooves across the Mara River to the silent gaze of a leopard in the acacia, every moment is etched in memory."}
            </p>
          </section>

          {/* Interactive Itinerary Tabs */}
          <section>
            <div className="flex gap-10 border-b border-slate-100 dark:border-zinc-900 mb-12">
              {['Itinerary', 'What to Pack', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                    activeTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-12"
              >
                {activeTab === 'Itinerary' && itinerary.map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <span className="text-4xl font-serif font-bold text-slate-200 dark:text-zinc-800 group-hover:text-emerald-500 transition-colors">
                      {item.day}
                    </span>
                    <div>
                      <h4 className="text-xl font-bold dark:text-white mb-2">{item.title}</h4>
                      <p className="text-slate-500 dark:text-zinc-400 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>

        {/* Right: Booking & Sustainability */}
        <aside className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            <div className="p-10 bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-zinc-800 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Price per person</p>
                  <h3 className="text-4xl font-black dark:text-white">KSh {destination?.price?.toLocaleString() || '45,500'}</h3>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-lg text-emerald-600 text-xs font-bold">
                  All Inclusive
                </div>
              </div>

              <button className="w-full h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all mb-4">
                Confirm Reservation
              </button>
              
              <div className="flex gap-4">
                <button className="flex-1 py-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <HeartIcon className="w-4 h-4" /> Wishlist
                </button>
                <button className="flex-1 py-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <ShareIcon className="w-4 h-4" /> Share
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-zinc-800">
                 <div className="flex items-center gap-3 mb-4">
                    <CloudIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold dark:text-white">Eco-Certified Expedition</span>
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-widest">
                   10% of your booking goes directly to community conservancy projects.
                 </p>
              </div>
            </div>

            {/* Travel Insight Card */}
            <div className="p-8 rounded-[2.5rem] bg-indigo-900 text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <GlobeAltIcon className="w-10 h-10 mb-4 opacity-50 group-hover:rotate-12 transition-transform" />
                 <h5 className="text-lg font-bold mb-2">Travel Expert Tip</h5>
                 <p className="text-xs opacity-70 leading-relaxed font-light italic">"Bring a warm layer for the early morning drives; the savannah breeze is crisp before the sun takes hold."</p>
               </div>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}