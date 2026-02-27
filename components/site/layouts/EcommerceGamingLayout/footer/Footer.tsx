'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { FaceFrownIcon, CpuChipIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name = "EMPIRE_GEMS",
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const accent = '#FF003C'; // Empire Red

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
    twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-black text-zinc-400 pt-20 border-t border-white/10 overflow-hidden">
      {/* Background HUD Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      {/* Signature Red Pulse Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600 shadow-[0_0_15px_rgba(255,0,60,0.8)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16">
          
          {/* Section 01: The Brand Terminal */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600">
                <CpuChipIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
                {name}
              </h2>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider leading-relaxed text-zinc-500 border-l border-red-600/30 pl-4">
              {description || 'Establishing global dominance in the tactical gear marketplace. Establishing secure delivery protocols since 2024.'}
            </p>
            <div className="space-y-1 font-mono text-[10px] text-zinc-600">
              <p className="flex items-center gap-2">
                <span className="text-red-600">ADDR:</span> SECTOR_7_GLOBAL_HUB
              </p>
              <p className="flex items-center gap-2 hover:text-red-500 transition-colors">
                <span className="text-red-600">MAIL:</span> <a href={`mailto:${contactEmail}`}>{contactEmail || 'hq@empiregems.io'}</a>
              </p>
            </div>
          </div>

          {/* Section 02: Protocol Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600" /> Navigation_Map
            </h3>
            <ul className="space-y-4 font-mono text-[11px] uppercase tracking-widest">
              {['About', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link href={`/ecommerce/${item.toLowerCase().replace(' ', '-')}`} 
                        className="hover:text-red-500 hover:pl-2 transition-all duration-300 flex items-center gap-2 group">
                    <span className="opacity-0 group-hover:opacity-100 text-red-600">{'>'}</span> {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 03: Operational Support */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600" /> Support_Core
            </h3>
            <ul className="space-y-4 font-mono text-[11px] uppercase tracking-widest">
              {['Help Center', 'Returns', 'Shipping', 'Track Order'].map((item) => (
                <li key={item}>
                  <Link href={`/ecommerce/${item.toLowerCase().replace(' ', '-')}`} 
                        className="hover:text-red-500 hover:pl-2 transition-all duration-300 flex items-center gap-2 group">
                    <span className="opacity-0 group-hover:opacity-100 text-red-600">{'>'}</span> {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 04: Neural Uplink (Social) */}
          <div className="relative">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600" /> Neural_Links
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {socialLinks.length > 0 ? socialLinks.map((s, idx) => {
                const channel = String(s.channel).toLowerCase();
                const icon = iconMapper[channel] || <GlobeAltIcon className="w-5 h-5" />;
                return (
                  <motion.a
                    key={idx}
                    whileHover={{ y: -3, backgroundColor: '#FF003C' }}
                    href={`${s.url}`}
                    target="_blank"
                    className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-white/5 text-white transition-colors"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}
                  >
                    {icon}
                  </motion.a>
                );
              }) : (
                 <div className="col-span-4 text-[10px] font-mono text-zinc-700 italic">OFFLINE_MODE_ACTIVE</div>
              )}
            </div>
            {/* Status Indicator */}
            <div className="mt-8 p-4 bg-zinc-900/50 border border-white/5 font-mono text-[9px] text-zinc-600">
               SYSTEM_STATUS: <span className="text-green-500 animate-pulse">OPTIMAL</span> <br />
               UPTIME: 99.99% // NODE: EDGE_01
            </div>
          </div>
        </div>

        {/* Final Copyright Bar */}
        <div className="py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            <span>© {new Date().getFullYear()} {name} // HQ_COMMAND</span>
            <div className="hidden md:flex gap-4">
              <Link href="/ecommerce/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/ecommerce/support" className="hover:text-white transition-colors">SUPPORT</Link>
            </div>
          </div>
          
          {/* Decorative Corner Reticle */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600" />
            <div className="h-px w-20 bg-white/10" />
            <span className="font-mono text-[9px] text-red-600">SECURE_ENCRYPTION_v4.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}