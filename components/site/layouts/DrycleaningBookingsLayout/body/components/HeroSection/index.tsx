"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  SparklesIcon,
  CalendarDaysIcon,
  TruckIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

// Custom loader for image optimization
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function Hero({ name, bannerUrl }: any) {
  const [date, setDate] = useState(new Date());

  // Fluid Animation Variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVars = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="relative min-h-screen w-full bg-slate-50 dark:bg-[#080a0c] transition-colors duration-700 overflow-hidden flex items-center">
      
      {/* 1. DYNAMIC FLUID BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* Animated Gradient Orbs for Depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-teal-400/20 dark:bg-teal-900/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-900/10 blur-[120px]" />
      </div>

      {/* 2. KINETIC TYPOGRAPHY (The "Visual Punch") */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-10">
        <motion.h2 
          initial={{ x: '30%' }}
          animate={{ x: '-30%' }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="text-[18vw] font-black text-slate-200/50 dark:text-white/[0.02] whitespace-nowrap uppercase leading-none select-none"
        >
          Freshness • 24H Delivery • Eco-Friendly • {name || "GetGo"} • Premium Care
        </motion.h2>
      </div>

      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 grid lg:grid-cols-12 gap-12 pt-20">
        
        {/* 3. BRAND CONTENT */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="lg:col-span-7 flex flex-col justify-center"
        >
          <motion.div variants={itemVars} className="flex items-center gap-3 mb-6">
            <div className="bg-teal-500/10 px-3 py-1 rounded-full flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-teal-600" />
              <p className="text-teal-600 dark:text-teal-400 font-bold tracking-widest text-[10px] uppercase">Eco-Conscious Fabric Care</p>
            </div>
          </motion.div>

          <motion.h1 variants={itemVars} className="text-6xl md:text-[100px] font-bold text-slate-900 dark:text-white leading-[0.9] tracking-tight mb-8">
            Pristine Clean, <br />
            <span className="italic font-serif font-light text-teal-500">Effortlessly.</span>
          </motion.h1>

          <motion.p variants={itemVars} className="max-w-md text-slate-600 dark:text-slate-400 text-lg mb-10 leading-relaxed font-medium">
            Professional laundry services delivered to your doorstep. We treat your garments like the investment they are.
          </motion.p>

          <motion.div variants={itemVars} className="flex flex-wrap gap-8 items-center">
            <div className="group flex items-center gap-4 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 shadow-lg dark:shadow-none flex items-center justify-center group-hover:bg-teal-500 transition-all duration-300">
                <ShoppingBagIcon className="h-5 w-5 text-teal-600 group-hover:text-white" />
              </div>
              <p className="text-slate-900 dark:text-white font-bold text-sm border-b border-transparent group-hover:border-teal-500 transition-all">Services</p>
            </div>

            <div className="group flex items-center gap-4 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 shadow-lg dark:shadow-none flex items-center justify-center group-hover:bg-teal-500 transition-all duration-300">
                <TruckIcon className="h-5 w-5 text-teal-600 group-hover:text-white" />
              </div>
              <p className="text-slate-900 dark:text-white font-bold text-sm border-b border-transparent group-hover:border-teal-500 transition-all">Track Order</p>
            </div>
          </motion.div>
        </motion.div>

        {/* 4. THE BOOKING ENGINE (Sleek Glassmorphism) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="lg:col-span-5 flex items-center"
        >
          <div className="relative w-full bg-white/70 dark:bg-[#111]/60 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white dark:border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)]">
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Pick a Slot</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">NYC Delivery • 24h Turnaround</p>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Select Service</label>
                <div className="flex items-center bg-slate-100/50 dark:bg-white/5 rounded-xl p-4 border border-transparent group-focus-within:border-teal-500 transition-all">
                  <CheckBadgeIcon className="h-5 w-5 text-slate-400 mr-3" />
                  <select className="bg-transparent w-full text-slate-900 dark:text-white outline-none cursor-pointer font-medium">
                    <option>Wash & Fold</option>
                    <option>Dry Cleaning</option>
                    <option>Ironing Only</option>
                  </select>
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Pickup Date</label>
                <div className="flex items-center bg-slate-100/50 dark:bg-white/5 rounded-xl p-4 border border-transparent group-focus-within:border-teal-500 transition-all">
                  <CalendarDaysIcon className="h-5 w-5 text-slate-400 mr-3" />
                  <DatePicker
                    selected={date}
                    onChange={(d) => d && setDate(d)}
                    className="bg-transparent w-full text-slate-900 dark:text-white outline-none cursor-pointer font-medium"
                  />
                </div>
              </div>

              <button className="relative w-full overflow-hidden bg-teal-600 hover:bg-teal-500 group rounded-2xl py-5 transition-all shadow-xl shadow-teal-600/20">
                <span className="relative z-10 flex items-center justify-center gap-3 text-white font-bold uppercase tracking-widest text-sm">
                  Find Availability <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5. MINIMAL SCROLL INDICATOR */}
      <div className="absolute left-1/2 bottom-10 -translate-x-1/2 flex flex-col items-center gap-3">
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-[1px] h-12 bg-gradient-to-b from-teal-500 to-transparent"
        />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] select-none">Explore Services</span>
      </div>

    </section>
  );
}