"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  CheckIcon,
  QrCodeIcon,
  StarIcon,
  CloudIcon,
  TicketIcon,
} from "@heroicons/react/24/solid";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

// --- Assets (SVG Components for Store Buttons) ---
const AppleLogo = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="w-6 h-6 mb-1">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 79.9c5.2 14.7 22.1 63 56.5 62.1 27.5-.7 36.7-19.2 64.9-19.2 27.9 0 35.5 19.3 65.5 19.2 27.2-.6 46.1-34.9 63.8-63.1 11.2-17.9 20.8-39.7 20.8-39.7s-24.9-10.7-25.2-43.9zm-46.7-133c16.3-21.8 30.2-47.5 26.6-76.8-25.7 1.8-54.8 17.1-70 34.6-13.8 15.6-25.5 41.5-22.3 71.9 26.3 3.5 53.4-15.6 65.7-29.7z" />
  </svg>
);

const GooglePlayLogo = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5">
    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l220.7-221.3L56.7 58.7 56.7 499z" />
  </svg>
);

const loader = ({ src }: { src: string }) => {
  return src;
};

// --- Sub-Components ---

const FeatureItem = ({ text, delay }: { text: string; delay: number }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center space-x-3"
  >
    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
      <CheckIcon className="h-4 w-4 text-indigo-300" />
    </div>
    <span className="text-indigo-100 font-medium">{text}</span>
  </motion.li>
);

const FloatingCard = ({ className, children, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.6, type: "spring" }}
    animate={{ y: [0, -10, 0] }}
    // @ts-ignore
    transition={{ 
      y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: Math.random() * 2 } 
    }}
    className={`absolute z-20 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-4 flex items-center gap-3 ${className}`}
  >
    {children}
  </motion.div>
);

// --- Main Component ---
export default function MobileAppPromo() {
  return (
    <section className="relative py-24 px-4 overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-[#0f172a] to-purple-900 opacity-80" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Column: Content */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-bold text-sm uppercase tracking-wider mb-6"
          >
            <DevicePhoneMobileIcon className="h-4 w-4" />
            Travel Smarter
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-[1.1]"
          >
            Your Personal Concierge, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Right in Your Pocket.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-indigo-100/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            From real-time flight updates to offline maps and instant chat with your expert planner. The world is vast, but your itinerary stays organized.
          </motion.p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-10 max-w-lg mx-auto lg:mx-0 text-left">
            <FeatureItem text="Instant Trip Itinerary" delay={0.3} />
            <FeatureItem text="Offline Map Access" delay={0.4} />
            <FeatureItem text="24/7 Expert Support" delay={0.5} />
            <FeatureItem text="Mobile-Only Deals" delay={0.6} />
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
          >
            {/* Apple Button */}
            <button className="flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg w-48">
              <AppleLogo />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium uppercase tracking-wide opacity-60">Download on the</div>
                <div className="text-sm">App Store</div>
              </div>
            </button>

            {/* Google Button */}
            <button className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg w-48 backdrop-blur-sm">
              <GooglePlayLogo />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium uppercase tracking-wide opacity-60">Get it on</div>
                <div className="text-sm">Google Play</div>
              </div>
            </button>
          </motion.div>
          
          {/* QR Code Prompt for Desktop */}
          <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ delay: 1 }}
             className="hidden lg:flex items-center gap-4 mt-8 pt-8 border-t border-white/10"
          >
             <div className="bg-white p-2 rounded-lg">
                <QrCodeIcon className="h-12 w-12 text-gray-900" />
             </div>
             <p className="text-sm text-gray-400">Scan to download <br/> the app immediately.</p>
          </motion.div>
        </div>

        {/* Right Column: Visuals */}
        <div className="relative flex justify-center perspective-1000">
          {/* Main Phone Mockup */}
          <motion.div
            initial={{ rotateY: 15, rotateX: 5, opacity: 0 }}
            whileInView={{ rotateY: -5, rotateX: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative w-[280px] h-[580px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden z-10"
          >
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-black rounded-b-xl z-20" />
            
            {/* Screen Image */}
            <Image decoding="async"
              src="https://images.unsplash.com/photo-1517400508447-f8dd518b86db?q=80&w=600&auto=format&fit=crop"
              alt="App Screen"
              fill
              className="object-cover opacity-80"
            />
            
            {/* Fake UI Overlay inside phone */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
            <div className="absolute bottom-8 left-6 right-6">
                <div className="text-white text-2xl font-serif font-bold mb-1">Bali, Indonesia</div>
                <div className="flex items-center gap-2 text-indigo-300 text-sm mb-4">
                    <CloudIcon className="h-4 w-4" /> 28°C Partly Cloudy
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-gray-300">Upcoming Activity</div>
                        <div className="text-sm font-bold text-white">Uluwatu Temple</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                        <TicketIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                </div>
            </div>
          </motion.div>

          {/* Floating Element 1: Notification */}
          <FloatingCard className="-right-12 top-20 hidden md:flex" delay={0.8}>
             <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckIcon className="h-6 w-6 text-white" />
             </div>
             <div>
                <p className="text-xs text-gray-300 uppercase font-bold">Confirmed</p>
                <p className="text-sm text-white font-bold">Flight to Tokyo</p>
             </div>
          </FloatingCard>

          {/* Floating Element 2: Review */}
          <FloatingCard className="-left-8 bottom-32 hidden md:flex" delay={1.1}>
             <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-300 border-2 border-gray-800" />
                <div className="h-8 w-8 rounded-full bg-gray-400 border-2 border-gray-800" />
             </div>
             <div>
                <div className="flex text-yellow-400">
                    <StarIcon className="h-3 w-3" /><StarIcon className="h-3 w-3" /><StarIcon className="h-3 w-3" /><StarIcon className="h-3 w-3" /><StarIcon className="h-3 w-3" />
                </div>
                <p className="text-xs text-white">"Best trip ever!"</p>
             </div>
          </FloatingCard>
          
          {/* Back Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 blur-3xl opacity-20 -z-10 rounded-full scale-110" />
        </div>

      </div>
    </section>
  );
}