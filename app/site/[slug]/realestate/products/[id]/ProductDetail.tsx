"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Square3Stack3DIcon, 
  MapPinIcon, 
  HomeIcon, 
  KeyIcon, 
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ShareIcon,
  HeartIcon,
  ArrowsPointingOutIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const loader = ({ src }: { src: string }) => src;

export default function RealEstatePropertyView({ property, storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0f172a';
  const [activeImage, setActiveImage] = useState(0);

  // Mock property data if missing
  const features = [
    { label: 'Bedrooms', value: property?.beds || 4, icon: <HomeIcon className="w-5 h-5" /> },
    { label: 'Bathrooms', value: property?.baths || 3.5, icon: <Square3Stack3DIcon className="w-5 h-5" /> },
    { label: 'Square Feet', value: property?.sqft || '3,200', icon: <ArrowsPointingOutIcon className="w-5 h-5" /> },
    { label: 'Year Built', value: property?.year || 2023, icon: <KeyIcon className="w-5 h-5" /> },
  ];

  const amenities = ['Smart Home System', 'Infinity Pool', 'Private Gym', '24/7 Security', 'Solar Powered', 'Guest Wing'];

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#050505] selection:bg-slate-200">
      
      {/* --- CINEMATIC GALLERY GRID --- */}
      <section className="relative px-4 lg:px-10 py-6">
        <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-4 h-[60vh] lg:h-[80vh]">
          {/* Main Feature Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 lg:col-span-8 relative rounded-[2.5rem] overflow-hidden group shadow-2xl"
          >
            <Image
              src={property?.images?.[activeImage] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200'}
              alt="Main Property View"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              loader={loader}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            <div className="absolute bottom-10 left-10 flex gap-3">
               <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900">
                 Featured Listing
               </span>
               <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                 Ready to Move
               </span>
            </div>
          </motion.div>

          {/* Secondary Stacked Images */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
            {[1, 2].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="relative flex-1 rounded-[2rem] overflow-hidden group border border-slate-100 dark:border-zinc-800 shadow-xl"
              >
                <Image
                  src={property?.images?.[i] || `https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800`}
                  alt="Property Detail"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loader={loader}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MAIN PROPERTY INFO --- */}
      <main className="max-w-[1800px] mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-12 gap-16">
        
        {/* LEFT SIDE: THE DETAILS */}
        <div className="lg:col-span-8">
          <header className="mb-16">
            <div className="flex items-center gap-2 text-slate-400 mb-6">
              <MapPinIcon className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-bold uppercase tracking-widest">{property?.location || 'Karen, Nairobi, Kenya'}</span>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-slate-900 dark:text-white leading-[1.1]">
                {property?.name || "The Azure Heights Estate"}
              </h1>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Asking Price</p>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white" style={{ color: primaryColor }}>
                  KSh {property?.price?.toLocaleString() || '125,000,000'}
                </h2>
              </div>
            </div>
          </header>

          {/* Key Specs Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {features.map((f, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 text-center group hover:bg-white dark:hover:bg-zinc-900 transition-all duration-500 shadow-sm hover:shadow-xl">
                <div className="flex justify-center text-slate-400 group-hover:text-rose-500 transition-colors mb-4">{f.icon}</div>
                <p className="text-2xl font-bold dark:text-white mb-1">{f.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{f.label}</p>
              </div>
            ))}
          </section>

          {/* Description & Amenities */}
          <section className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-2xl font-bold tracking-tight mb-8">Architectural Narrative</h3>
            <p className="text-xl text-slate-500 dark:text-zinc-400 leading-relaxed font-light mb-12">
              {property?.description || "Experience unparalleled luxury in this contemporary masterpiece. Designed with a focus on seamless indoor-outdoor living, this estate features floor-to-ceiling glass walls that flood the interior with natural light while offering panoramic views of the surrounding greenery."}
            </p>

            <h3 className="text-2xl font-bold tracking-tight mb-8">Premium Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
              {amenities.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-50 dark:border-zinc-800 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium dark:text-white">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDE: AGENT & ACTION */}
        <aside className="lg:col-span-4 h-fit lg:sticky lg:top-32">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-zinc-800 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-6 relative rounded-full overflow-hidden border-4 border-slate-50 dark:border-zinc-800 shadow-lg">
                <Image src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200" alt="Agent" fill className="object-cover" loader={loader}/>
              </div>
              <h4 className="text-xl font-bold dark:text-white">Brenden Odhiambo</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Lead Property Consultant</p>
            </div>

            <div className="space-y-4 mb-8">
              <button className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3">
                <PhoneIcon className="w-4 h-4" /> Book a Private Tour
              </button>
              <button className="w-full py-5 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
                <ChatBubbleLeftRightIcon className="w-4 h-4" /> Message on WhatsApp
              </button>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-4 rounded-2xl border border-slate-50 dark:border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors">
                <HeartIcon className="w-4 h-4" /> Save
              </button>
              <button className="flex-1 py-4 rounded-2xl border border-slate-50 dark:border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors">
                <ShareIcon className="w-4 h-4" /> Share
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 dark:border-zinc-800 text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 italic">Exclusive Portfolio</p>
               <p className="text-[10px] text-slate-400 leading-relaxed">Member of the Nairobi Premium Real Estate Council since 2021.</p>
            </div>
          </div>

          {/* Quick Mortgage Calc / CTA */}
          <div className="mt-8 p-8 rounded-[3rem] bg-indigo-900 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
               <h5 className="text-lg font-bold mb-2 italic">Need Financing?</h5>
               <p className="text-xs opacity-70 mb-6">Explore flexible mortgage plans from our banking partners in Kenya.</p>
               <button className="text-[10px] font-black uppercase tracking-[0.3em] bg-white text-indigo-900 px-6 py-3 rounded-xl">Calculate Monthly Payment</button>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>
        </aside>
      </main>

      {/* --- NEIGHBORHOOD INSIGHTS --- */}
      <section className="py-32 bg-slate-50 dark:bg-[#080808] px-6 lg:px-20 border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
           <div className="flex-1">
             <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Neighborhood Context</h2>
             <h3 className="text-5xl font-serif font-bold dark:text-white leading-tight italic">Life in <br /> <span className="not-italic text-slate-400">Karen</span></h3>
             <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                   <StarSolid className="w-5 h-5 text-amber-500" />
                   <div>
                     <p className="font-bold dark:text-white">Safety & Security</p>
                     <p className="text-sm text-slate-500">Rated 4.8/5.0 by residents for gated community standards.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <StarSolid className="w-5 h-5 text-amber-500" />
                   <div>
                     <p className="font-bold dark:text-white">Connectivity</p>
                     <p className="text-sm text-slate-500">15-minute drive to Westlands and The Hub Shopping Mall.</p>
                   </div>
                </div>
             </div>
           </div>
           <div className="flex-1 w-full h-[500px] rounded-[3rem] bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative shadow-2xl grayscale group hover:grayscale-0 transition-all duration-1000">
              <Image src="https://images.unsplash.com/photo-1549517044-8e3590ad7375?q=80&w=800" alt="Neighborhood" fill className="object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" loader={loader} />
           </div>
        </div>
      </section>
    </div>
  );
}