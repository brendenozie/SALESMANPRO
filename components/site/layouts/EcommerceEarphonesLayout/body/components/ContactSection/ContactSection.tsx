'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  MapPinIcon, 
  PhoneIcon,
  CommandLineIcon 
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#f97316';

  const contactMethods = [
    { label: 'Voice Link', value: '+1 (800) OPS-GEAR', Icon: PhoneIcon },
    { label: 'Neural Mail', value: 'support@storefront.io', Icon: ChatBubbleLeftRightIcon },
    { label: 'HQ Base', value: 'Sector 7G, Neon District', Icon: MapPinIcon },
  ];

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-4">
               <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">
                Direct <br /> <span style={{ color: primary }}>Uplink.</span>
              </h2>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Transmission Status: Online</p>
            </div>

            <div className="space-y-6">
              {contactMethods.map((method, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 group transition-all hover:bg-white/5"
                >
                  <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                    <method.Icon className="w-6 h-6" style={{ color: primary }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{method.label}</p>
                    <p className="text-white font-mono text-sm">{method.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Technical Support Form */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-12 rounded-[3rem] bg-white/[0.03] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <CommandLineIcon className="w-24 h-24 text-white" />
              </div>

              <form className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Identifier</label>
                    <input type="text" placeholder="NAME" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs font-mono focus:border-white/40 ring-0 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Frequency</label>
                    <input type="email" placeholder="EMAIL" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs font-mono focus:border-white/40 ring-0 transition-all outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Message Transmission</label>
                  <textarea rows={4} placeholder="ENTER DATA..." className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white text-xs font-mono focus:border-white/40 ring-0 transition-all outline-none" />
                </div>

                <button 
                  type="submit"
                  className="w-full group relative flex items-center justify-center gap-4 bg-white py-6 rounded-2xl overflow-hidden transition-all hover:bg-transparent hover:text-white border border-white"
                >
                  <span className="relative z-10 text-black group-hover:text-white font-black uppercase tracking-[0.3em] text-xs transition-colors">
                    Send Transmission
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-0 group-hover:translate-y-full transition-transform duration-500" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}