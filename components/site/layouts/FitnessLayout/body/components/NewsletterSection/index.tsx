"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate API call
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden border-t border-b border-white/5">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-500/5 skew-x-12 translate-x-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Copy */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-[10px]">
                Intelligence Briefing
              </span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.85]"
            >
              Join the <br /> <span className="text-white/10">Inner Circle</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md text-gray-500 font-medium text-sm leading-relaxed uppercase tracking-wide"
            >
              Weekly protocols on metabolic optimization, tactical strength, and high-performance psychology. No noise. Just signal.
            </motion.p>
          </div>

          {/* Right Side: Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            {/* Form Container */}
            <form 
              onSubmit={handleSubmit}
              className="relative z-10 bg-white/[0.02] border border-white/10 p-2 md:p-3 flex flex-col md:flex-row gap-4 backdrop-blur-md"
            >
              <div className="flex-grow flex items-center px-4 gap-4">
                <EnvelopeIcon className="h-5 w-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="ENTER EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-white font-black tracking-widest text-xs uppercase w-full placeholder:text-gray-700"
                />
              </div>

              <button 
                type="submit"
                disabled={status !== "idle"}
                className="bg-white hover:bg-orange-500 text-black font-black uppercase tracking-[0.2em] text-[10px] px-10 py-5 transition-all duration-300 flex items-center justify-center gap-3 disabled:bg-gray-800 disabled:text-gray-500"
              >
                {status === "loading" ? "Processing..." : status === "success" ? "Access Granted" : (
                  <>
                    Request Access <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Meta Info */}
            <div className="mt-6 flex flex-wrap items-center gap-8 opacity-40">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Encrypted Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Weekly Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Opt-out Anytime</span>
              </div>
            </div>

            {/* Decorative background border effect */}
            <div className="absolute -inset-1 border border-orange-500/10 -z-10 group-hover:border-orange-500/30 transition-colors duration-500" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}