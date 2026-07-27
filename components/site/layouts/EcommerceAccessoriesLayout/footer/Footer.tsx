'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CommandLineIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/solid';

interface AddressItem {
  label?: string;
  address?: string;
  city?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPrimary?: boolean;
}

export default function CommandFooter() {
  const { storeFormData } = useStoreContext();
  
  const {
    name = 'SalesmanPro Store',
    description,
    contactEmail: globalEmail,
    contactPhone: globalPhone,
    socialLinks = [],
    themeSettings = {},  
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Normalize multi-address array with fallback to legacy data
  const regionalAddresses: AddressItem[] = addresses?.length > 0 
    ? addresses 
    : [{
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: globalPhone,
        contactEmail: globalEmail,
        isPrimary: true
      }];

  const primaryColor = themeSettings?.primaryColor || '#F59E0B'; // Tactical Amber

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  };

  return (
    <footer className="relative bg-[#050505] text-zinc-500 overflow-hidden border-t-2 border-zinc-900">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 pt-24 md:pt-36 pb-12 relative z-10">
        
        {/* Kinetic Ticker */}
        <div className="mb-24 overflow-hidden select-none pointer-events-none">
          <motion.h1 
            initial={{ x: '0%' }}
            animate={{ x: '-50%' }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="text-[12vw] font-black text-white/5 uppercase italic leading-none whitespace-nowrap tracking-tighter inline-block"
          >
            {name} • SalesmanPro OS • Regional Supply Network • {name} • Tactical Logistics •
          </motion.h1>
        </div>

        {/* Top Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CommandLineIcon className="w-8 h-8 text-amber-500" />
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">{name}</h3>
              </div>
              <p className="text-lg md:text-xl font-bold text-zinc-400 leading-tight uppercase tracking-tighter max-w-md">
                {description || 'Next-generation industrial operating system. Real-time logistics, automated sales, and regional scaling.'}
              </p>
            </div>

            {/* Social Uplink */}
            {socialLinks.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Social Uplink</span>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((s, idx) => (
                    <motion.a
                      key={idx}
                      whileHover={{ y: -4, color: '#FFF' }}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-zinc-900/80 border border-zinc-800 flex items-center justify-center transition-all group relative text-zinc-400 hover:border-amber-500/50"
                    >
                      <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {iconMapper[String(s.channel).toLowerCase()] || <GlobeAltIcon className="w-5 h-5" />}
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.5em] border-l-2 border-amber-500 pl-3">Operations</h4>
              <ul className="space-y-3 text-xs font-black uppercase tracking-widest">
                {['Direct API', 'Storefronts', 'Logistics', 'Procurement', 'Security'].map((item) => (
                  <li key={item}>
                    <Link href={`/automotiveecommerce/${item.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-amber-500 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.5em] border-l-2 border-amber-500 pl-3">Network</h4>
              <ul className="space-y-3 text-xs font-black uppercase tracking-widest">
                {['Documentation', 'Developer Hub', 'Regional Nodes', 'Cloud Status', 'Support'].map((item) => (
                  <li key={item}>
                    <Link href={`/automotiveecommerce/${item.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-amber-500 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1 space-y-6">
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.5em] border-l-2 border-amber-500 pl-3">Dispatch HQ</h4>
              <div className="space-y-4 font-mono text-[11px] font-bold uppercase tracking-tighter">
                {globalEmail && (
                  <div className="flex items-center gap-2.5">
                    <EnvelopeIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <a href={`mailto:${globalEmail}`} className="hover:text-white transition-colors truncate">
                      {globalEmail}
                    </a>
                  </div>
                )}
                {globalPhone && (
                  <div className="flex items-center gap-2.5">
                    <PhoneIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <a href={`tel:${globalPhone}`} className="hover:text-white transition-colors">
                      {globalPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Address Regional Nodes */}
        <div className="mb-20 pt-12 border-t border-zinc-900/80">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-white font-black uppercase text-xs tracking-[0.4em] flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-amber-500" />
              Regional Physical Nodes ({regionalAddresses.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, index) => {
              const fullAddressStr = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressStr)}`;

              return (
                <div 
                  key={index} 
                  className="bg-zinc-900/40 border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
                        {loc.label || `Node 0${index + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase">
                          [Primary HQ]
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-zinc-300 leading-snug uppercase tracking-tight">
                      {loc.address || 'Address information unavailable'}
                    </p>
                    
                    {(loc.city || loc.country) && (
                      <p className="text-xs font-medium text-zinc-500 uppercase">
                        {[loc.city, loc.country].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/50 space-y-2 font-mono text-[11px]">
                    {loc.contactPhone && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <PhoneIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <a href={`tel:${loc.contactPhone}`} className="hover:text-white transition-colors">
                          {loc.contactPhone}
                        </a>
                      </div>
                    )}
                    {loc.contactEmail && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <EnvelopeIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <a href={`mailto:${loc.contactEmail}`} className="hover:text-white transition-colors truncate">
                          {loc.contactEmail}
                        </a>
                      </div>
                    )}

                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 pt-2 text-[10px] font-black tracking-widest text-amber-500 uppercase hover:text-amber-400 transition-colors group-hover:translate-x-0.5 transition-transform"
                    >
                      Get Directions
                      <ArrowUpRightIcon className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900 border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Status: Operational</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              &copy; {new Date().getFullYear()} {name} Core. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Powered by</span>
              <a 
                href="https://salesmanpro.site" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-black uppercase tracking-widest text-white hover:text-amber-500 transition-colors"
              >
                SalesmanPro<span className="text-amber-500">.site</span>
              </a>
            </div>
            <div className="flex items-center gap-3 opacity-30 hover:opacity-100 transition-opacity">
              <ShieldCheckIcon className="w-4 h-4 text-zinc-400" />
              <CommandLineIcon className="w-4 h-4 text-zinc-400" />
              <GlobeAltIcon className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}