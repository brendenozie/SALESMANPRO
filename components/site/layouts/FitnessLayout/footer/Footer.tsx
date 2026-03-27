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

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#050505] pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Structural Accents */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          
          {/* Brand & Status Column */}
          <div className="md:col-span-4 space-y-8">
            <div>
              <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">
                {storeFormData.name}<span className="text-orange-500">.</span>
              </h4>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-widest leading-relaxed max-w-xs">
                {storeFormData.description || "Architecting elite human performance through neural and physical recalibration."}
              </p>
            </div>

            {/* System Status Mockup */}
            <div className="p-4 bg-white/[0.02] border border-white/5 inline-block">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">System Status: Operational</span>
              </div>
              <div className="flex gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`h-3 w-[2px] ${i < 9 ? 'bg-orange-500/40' : 'bg-white/5'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12">
            {/* Column: Protocols */}
            <div className="space-y-6">
              <h5 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]">Protocols</h5>
              <ul className="space-y-4">
                {['Programs', 'Trainers', 'Intelligence', 'Community'].map((item) => (
                  <li key={item}>
                    <Link href={`/fitness/${item.toLowerCase()}`} className="text-white/40 hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 group">
                      <div className="h-[1px] w-0 bg-orange-500 group-hover:w-3 transition-all" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column: Network */}
            <div className="space-y-6">
              <h5 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]">Network</h5>
              <div className="flex flex-col gap-4">
                <a href="#" className="flex items-center gap-3 text-white/40 hover:text-white transition-colors">
                  <HashtagIcon className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-white/40 hover:text-white transition-colors">
                  <GlobeAltIcon className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Global Link</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-white/40 hover:text-white transition-colors">
                  <CpuChipIcon className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-widest">App OS</span>
                </a>
              </div>
            </div>

            {/* Column: Compliance */}
            <div className="space-y-6">
              <h5 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]">Compliance</h5>
              <ul className="space-y-4">
                <li><Link href="/fitness/privacy" className="text-white/40 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Privacy</Link></li>
                <li><Link href="/fitness/terms" className="text-white/40 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Terms</Link></li>
                <li><Link href="/fitness/security" className="text-white/40 hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                  <ShieldCheckIcon className="h-3 w-3" /> Security
                </Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">
            &copy; {currentYear} {storeFormData.name} // Neural Dynamics Inc.
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Encryption:</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-500/50">AES-256</span>
            </div>
            
            <div className="flex items-center gap-1.5 group">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Powered by</span>
              <a 
                href="https://salesmanpro.site" 
                className="text-[10px] font-black uppercase tracking-widest text-orange-600 group-hover:text-orange-400 transition-colors"
              >
                SalesmanPro.site
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Background ghost text */}
      <div className="absolute bottom-[-2%] left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.02] whitespace-nowrap pointer-events-none select-none italic tracking-tighter">
        PERFORMANCE ARCHITECTURE
      </div>
    </footer>
  );
}