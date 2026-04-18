"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  TicketIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function Hero({ name, bannerUrl, heroSlides }: any) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#D4AF37'; 
  const [date, setDate] = useState(new Date());

  // Animation Variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVars = {
    hidden: { y: 100, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="relative h-screen w-full bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden flex items-center">
      
      {/* 1. BACKGROUND WITH ADAPTIVE GRADIENT */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="relative h-full w-full"
        >
          <Image
            src={heroSlides?.[0]?.imageUrl || bannerUrl || "/barber-hero.jpg"}
            loader={loader}
            alt="Master Barber"
            fill
            className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-1000"
          />
          {/* Gradient transitions from light/dark depending on mode */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent dark:from-[#050505] dark:via-[#050505]/60" />
        </motion.div>
      </div>

      {/* 2. BACKGROUND TEXT (Visual Punch) */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-10">
        <motion.h2 
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-[25vw] font-black text-black/[0.03] dark:text-white/[0.03] whitespace-nowrap uppercase leading-none"
        >
          {name || "Premium Grooming"} • Sharp & Classic • {name || "Premium Grooming"}
        </motion.h2>
      </div>

      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 grid lg:grid-cols-12 gap-8">
        
        {/* 3. TEXTUAL CONTENT */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="lg:col-span-7 flex flex-col justify-center"
        >
          <motion.div variants={itemVars} className="flex items-center gap-4 mb-8">
            <span className="w-12 h-[2px]" style={{ backgroundColor: primaryColor }} />
            <p className="font-bold tracking-[0.5em] text-xs uppercase" style={{ color: primaryColor }}>
                The Art of the Blade
            </p>
          </motion.div>

          <motion.h1 variants={itemVars} className="text-7xl md:text-[120px] font-bold text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-10">
            CRAFTED <br />
            <span className="italic font-serif font-light" style={{ color: primaryColor }}>Confidence.</span>
          </motion.h1>

          <motion.div variants={itemVars} className="flex flex-wrap gap-8 items-center">
            {/* Pricing Info */}
            <div className="group flex items-center gap-4 cursor-pointer">
              <div 
                className="w-14 h-14 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center transition-all duration-500 group-hover:border-transparent"
                style={{ '--hover-bg': primaryColor } as any}
              >
                <TicketIcon className="h-6 w-6 text-slate-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-bold text-sm">View Pricing</p>
                <p className="text-gray-500 text-xs tracking-wide">Starting at $35.00</p>
              </div>
            </div>

            {/* Hours Info */}
            <div className="group flex items-center gap-4 cursor-pointer">
              <div className="w-14 h-14 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white transition-all duration-500">
                <ClockIcon className="h-6 w-6 text-slate-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-bold text-sm">Open Today</p>
                <p className="text-gray-500 text-xs tracking-wide">9:00 AM - 8:00 PM</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 4. THE BOOKING ENGINE */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="lg:col-span-5 flex items-center"
        >
          <div 
            className="relative w-full bg-white/90 dark:bg-[#111]/80 backdrop-blur-3xl p-10 rounded-sm border-l-4 shadow-2xl transition-colors"
            style={{ borderLeftColor: primaryColor }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <div className="w-8 h-8 border-t-2 border-r-2 border-black dark:border-white" />
            </div>

            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Book the Chair</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 tracking-wide uppercase">Select your next experience</p>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: primaryColor }}>Service</label>
                <div className="flex items-center border-b border-black/10 dark:border-white/10 group-focus-within:border-current transition-colors pb-2" style={{ color: primaryColor }}>
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Signature Haircut" 
                    className="bg-transparent w-full text-slate-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: primaryColor }}>Desired Date</label>
                <div className="flex items-center border-b border-black/10 dark:border-white/10 group-focus-within:border-current transition-colors pb-2" style={{ color: primaryColor }}>
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <DatePicker
                    selected={date}
                    onChange={(d) => d && setDate(d)}
                    className="bg-transparent w-full text-slate-900 dark:text-white outline-none cursor-pointer"
                  />
                </div>
              </div>

              <button className="relative w-full overflow-hidden bg-slate-900 dark:bg-white group py-5 transition-all">
                <div 
                  className="absolute inset-0 w-0 group-hover:w-full transition-all duration-500 ease-[0.76, 0, 0.24, 1]" 
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="relative z-10 flex items-center justify-center gap-3 text-white dark:text-black font-black uppercase tracking-widest text-sm group-hover:text-white">
                  Check Availability <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
            </div>
            
            <p className="mt-6 text-center text-gray-400 dark:text-gray-600 text-[10px] uppercase tracking-widest font-bold">
              Instant Confirmation • Free Cancellation
            </p>
          </div>
        </motion.div>
      </div>

      {/* 5. VERTICAL PROGRESS INDICATOR */}
      <div className="absolute right-12 bottom-12 hidden md:flex flex-col items-center gap-6">
        <div className="h-40 w-[2px] bg-black/5 dark:bg-white/5 relative overflow-hidden">
          <motion.div 
            initial={{ y: -160 }}
            animate={{ y: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-0 w-full h-full"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
        <span className="text-slate-900 dark:text-white font-bold text-xs [writing-mode:vertical-lr] tracking-[0.3em] uppercase opacity-40">Scroll to Explore</span>
      </div>

    </section>
  );
}