"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserIcon, 
  EnvelopeIcon, 
  ScaleIcon, 
  MapPinIcon, 
  ChevronDownIcon, 
  PaperAirplaneIcon, 
  PlayIcon, 
  MagnifyingGlassIcon, 
  PhoneArrowUpRightIcon, 
  GlobeAltIcon 
} from "@heroicons/react/24/outline";
import { PlayIcon as PlayIconSolid } from "@heroicons/react/24/solid";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export function BookingSection() {
  const [activeTab, setActiveTab] = useState("quote");

  const tabs = [
    { id: "quote", label: "Request a Quote", icon: <PaperAirplaneIcon className="w-4 h-4" />, color: "bg-blue-700" },
    { id: "track", label: "Track Cargo", icon: <MagnifyingGlassIcon className="w-4 h-4" />, color: "bg-slate-900" },
    { id: "support", label: "Live Support", icon: <PhoneArrowUpRightIcon className="w-4 h-4" />, color: "bg-orange-600" },
  ];

  return (
    <section className="relative min-h-[900px] bg-[#050505] overflow-hidden flex items-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Hero Image Side (Desktop Only) */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-[400px] lg:h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent z-10" />
        <Image 
          src="https://images.pexels.com/photos/12492225/pexels-photo-12492225.jpeg" 
          alt="Logistics" 
          className="w-full h-full object-cover opacity-60 lg:opacity-100 transition-all duration-1000 group-hover:scale-110"
          fill
          priority
          loader={loader}
        />
        
        {/* Floating Play Button */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 lg:left-10 -translate-x-1/2 -translate-y-1/2 z-30"
        >
          <div className="group cursor-pointer p-4">
            <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:border-orange-500/50 transition-all duration-500">
              <div className="w-16 h-16 rounded-full bg-[#f7941d] flex items-center justify-center text-white shadow-[0_0_40px_rgba(247,148,29,0.4)] group-hover:scale-90 transition-transform">
                <PlayIconSolid className="w-8 h-8 ml-1" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Copy */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md"
            >
              <GlobeAltIcon className="w-4 h-4 text-[#f7941d] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Global Logistics Hub</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white leading-none uppercase italic"
            >
              Streamline <br />
              <span className="text-[#f7941d] not-italic">Your Supply</span> <br />
              Chain
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 max-w-md text-lg leading-relaxed font-light"
            >
              Get instant access to real-time quotes and tracking. We don&apos;t just move freight; we move your business forward with precision.
            </motion.p>
          </div>

          {/* Right Side: Interactive Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Tab Navigation */}
              <div className="flex border-b border-white/10">
                {tabs.map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-6 flex flex-col items-center gap-2 transition-all relative ${
                      activeTab === tab.id ? "text-[#f7941d]" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#f7941d]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="p-8 md:p-12">
                <AnimatePresence mode="wait">
                  {activeTab === "quote" && (
                    <motion.div
                      key="quote"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField icon={<UserIcon className="w-4 h-4"/>} label="Full Name" placeholder="John Doe" />
                        <InputField icon={<EnvelopeIcon className="w-4 h-4"/>} label="Email Address" placeholder="john@company.com" />
                        <InputField icon={<ScaleIcon className="w-4 h-4"/>} label="Weight" placeholder="500 Kg" />
                        <InputField icon={<MapPinIcon className="w-4 h-4"/>} label="Destination" placeholder="New York, NY" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Logistics Type</label>
                        <div className="relative">
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none appearance-none focus:border-[#f7941d]/50 transition-colors">
                            <option className="bg-[#111]">Transport</option>
                            <option className="bg-[#111]">Logistics</option>
                            <option className="bg-[#111]">Waste Management</option>
                          </select>
                          <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                        </div>
                      </div>

                      <button className="w-full py-5 bg-[#f7941d] hover:bg-white hover:text-black text-white font-black uppercase text-xs tracking-[0.3em] rounded-xl transition-all flex items-center justify-center gap-3 group/btn">
                        Get Estimate 
                        <PaperAirplaneIcon className="w-4 h-4 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-1 transition-transform" />
                      </button>
                    </motion.div>
                  )}

                  {activeTab === "track" && (
                    <motion.div
                      key="track"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 flex flex-col items-center text-center space-y-8"
                    >
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                        <MagnifyingGlassIcon className="w-10 h-10 text-[#f7941d]" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-white text-xl font-bold">Track Shipment</h3>
                        <p className="text-white/40 text-sm max-w-[250px]">Enter your 12-digit tracking ID to see live movement.</p>
                      </div>
                      <div className="w-full relative">
                        <input 
                          type="text" 
                          placeholder="TRK-990-221-X" 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-center font-mono tracking-widest outline-none focus:border-[#f7941d] transition-all"
                        />
                        <button className="mt-4 w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#f7941d] hover:text-white transition-colors">
                          Locate Now
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InputField({ icon, label, placeholder }: { icon: React.ReactNode, label: string, placeholder: string }) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] group-focus-within:text-[#f7941d] transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#f7941d] transition-colors">
          {icon}
        </div>
        <input 
          type="text" 
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/10 outline-none focus:border-[#f7941d]/50 transition-colors"
        />
      </div>
    </div>
  );
}