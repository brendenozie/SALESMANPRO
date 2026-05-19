"use client";

import React from "react";
import Link from "next/link";
import { 
  CpuChipIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  HashtagIcon
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

export default function Footer() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) return null;

  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-neutral-50 dark:bg-neutral-950 pt-20 pb-10 sm:pt-24 sm:pb-12 overflow-hidden border-t border-neutral-200/60 dark:border-neutral-900/40 transition-colors duration-500">
      
      {/* Top Border Dynamic Edge Accent Glow */}
      <div 
        className="absolute top-0 left-0 w-full h-[1px] opacity-40 dark:opacity-60 pointer-events-none" 
        style={{ 
          background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` 
        }} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-12 md:gap-16 mb-16 sm:mb-24">
          
          {/* BRAND COLUMN: Identity & Interactive Status Deck */}
          <div className="md:col-span-4 space-y-6 text-center sm:text-left">
            <div>
              <h4 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase mb-3">
                {storeFormData.name}<span style={{ color: primaryColor }}>.</span>
              </h4>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-widest leading-relaxed max-w-xs mx-auto sm:mx-0">
                {storeFormData.description || "Architecting elite human performance through neural and physical recalibration."}
              </p>
            </div>

            {/* Embedded Live Network Diagnostics Grid Module */}
            <div className="p-4 bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-900/60 rounded-xl inline-block shadow-sm text-left">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] font-black text-neutral-800 dark:text-white uppercase tracking-[0.25em]">System Status: Operational</span>
              </div>
              <div className="flex gap-[3px]">
                {[...Array(14)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-3 w-[2px] rounded-full transition-colors duration-500" 
                    style={{ 
                      backgroundColor: i < 11 ? primaryColor : undefined,
                      opacity: i < 11 ? 0.35 : 0.08
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* NAVIGATION LINKS GRID MATRIX */}
          <div className="sm:col-span-2 md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
            
            {/* Array Hook: Core Protocol Modules */}
            <div className="space-y-4 sm:space-y-5">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>Protocols</h5>
              <ul className="space-y-3">
                {['Programs', 'Trainers', 'Intelligence', 'Community'].map((item) => (
                  <li key={item}>
                    <Link 
                      href={`/fitness/${item.toLowerCase()}`} 
                      className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 group"
                    >
                      <div 
                        className="h-[1px] w-0 group-hover:w-3 transition-all duration-300 shrink-0" 
                        style={{ backgroundColor: primaryColor }}
                      />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Array Hook: Social Network Uplinks */}
            <div className="space-y-4 sm:space-y-5">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>Network</h5>
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center gap-2.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group">
                  <HashtagIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span className="text-xs font-black uppercase tracking-widest">Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-2.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group">
                  <GlobeAltIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span className="text-xs font-black uppercase tracking-widest">Global Link</span>
                </a>
                <a href="#" className="flex items-center gap-2.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group">
                  <CpuChipIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span className="text-xs font-black uppercase tracking-widest">App OS</span>
                </a>
              </div>
            </div>

            {/* Array Hook: Legal Risk Compliance */}
            <div className="space-y-4 sm:space-y-5 col-span-2 sm:col-span-1">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>Compliance</h5>
              <ul className="space-y-3 grid grid-cols-2 sm:grid-cols-1 gap-y-1">
                <li><Link href="/fitness/privacy" className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Privacy</Link></li>
                <li><Link href="/fitness/terms" className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Terms</Link></li>
                <li><Link href="/fitness/security" className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-600" /> Security
                </Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* COMPLIANCE META FOOTER ROW PLATE */}
        <div className="pt-10 border-t border-neutral-200/60 dark:border-neutral-900/60 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.4em]">
            &copy; {currentYear} {storeFormData.name} // Neural Dynamics Inc.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Encryption:</span>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-80" style={{ color: primaryColor }}>AES-256</span>
            </div>
            
            <div className="flex items-center gap-1.5 group">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Powered by</span>
              <a 
                href="https://salesmanpro.site" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                style={{ color: primaryColor }}
              >
                SalesmanPro.site
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Canvas Dynamic Edge Watermark */}
      <div className="absolute bottom-[-10px] sm:bottom-[-2%] left-1/2 -translate-x-1/2 text-[13vw] font-black text-neutral-900/[0.03] dark:text-white/[0.015] whitespace-nowrap pointer-events-none select-none italic tracking-tighter transition-colors">
        PERFORMANCE ARCHITECTURE
      </div>
    </footer>
  );
}